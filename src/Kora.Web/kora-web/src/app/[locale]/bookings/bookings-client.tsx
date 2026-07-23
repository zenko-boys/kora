"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { startOfDay } from "date-fns";
import { Plus, SlidersHorizontal } from "lucide-react";
import { BookingsSection } from "@/components/bookings/bookings-section";
import { BookingsFiltersColumn, EMPTY_FILTER_DRAFT, type FilterDraft } from "@/components/bookings/bookings-filters-column";
import { CreateBookingDialog } from "@/components/bookings/create-booking-dialog";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { createApiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { getBookingStatus } from "@/lib/booking-status";
import type { BookingCard, BookingsFilter } from "@/lib/types";

const STATUS_RANK = { upcoming: 0, inProgress: 1, finished: 2 } as const;

function sortBookings(bookings: BookingCard[]): BookingCard[] {
    return [...bookings].sort((a, b) => {
        const statusA = getBookingStatus(a);
        const statusB = getBookingStatus(b);
        if (statusA !== statusB) return STATUS_RANK[statusA] - STATUS_RANK[statusB];
        const startA = new Date(a.startsAt).getTime();
        const startB = new Date(b.startsAt).getTime();
        return statusA === "finished" ? startB - startA : startA - startB;
    });
}

export function BookingsClient({ title }: { title: string }) {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    const t = useTranslations("bookings");
    const [joiningId, setJoiningId] = useState<string | null>(null);
    const [leavingId, setLeavingId] = useState<string | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Each section (Meus Jogos / Descobrir Jogos) keeps its own independently applied filter,
    // plus its own in-progress draft — so switching tabs never resets what you were configuring.
    const [activeFilterTab, setActiveFilterTab] = useState<"myGames" | "discover">("myGames");
    const [myGamesFilters, setMyGamesFilters] = useState<BookingsFilter>({ open: true });
    const [discoverFilters, setDiscoverFilters] = useState<BookingsFilter>({ open: true });
    const [myGamesDraft, setMyGamesDraft] = useState<FilterDraft>(EMPTY_FILTER_DRAFT);
    const [discoverDraft, setDiscoverDraft] = useState<FilterDraft>(EMPTY_FILTER_DRAFT);

    const activeDraft = activeFilterTab === "myGames" ? myGamesDraft : discoverDraft;
    const setActiveDraft = activeFilterTab === "myGames" ? setMyGamesDraft : setDiscoverDraft;

    const api = createApiClient(async () => getToken({ template: "dev" }));

    // Default the lower bound to the start of today (instead of "now") so games
    // already underway or finished earlier today still show up in the listing.
    const effectiveMyGamesFilters: BookingsFilter = {
        ...myGamesFilters,
        fromUtc: myGamesFilters.fromUtc ?? startOfDay(new Date()).toISOString(),
    };
    const effectiveDiscoverFilters: BookingsFilter = {
        ...discoverFilters,
        fromUtc: discoverFilters.fromUtc ?? startOfDay(new Date()).toISOString(),
    };

    const { data: myGamesData, isLoading: myGamesLoading, isError: myGamesError } = useQuery({
        queryKey: ["bookings", "myGames", effectiveMyGamesFilters],
        queryFn: () => api.getBookings(effectiveMyGamesFilters),
    });

    const { data: discoverData, isLoading: discoverLoading, isError: discoverError } = useQuery({
        queryKey: ["bookings", "discover", effectiveDiscoverFilters],
        queryFn: () => api.getBookings(effectiveDiscoverFilters),
    });

    const { data: myClubsData } = useQuery({
        queryKey: ["my-clubs"],
        queryFn: () => api.getMyClubs(),
    });

    const joinMutation = useMutation({
        mutationFn: ({ bookingId, slot }: { bookingId: string; slot?: { team: "TeamA" | "TeamB"; positionInTeam: number } }) => {
            setJoiningId(bookingId);
            return api.joinBooking(bookingId, slot);
        },
        onSuccess: (result) => {
            toast.success(t("toast.joined"), {
                description: t("toast.joinedDescription", {
                    count: result.participantsCount,
                    capacity: result.capacity,
                }),
            });
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
        },
        onError: (err: Error) => {
            toast.error(t("toast.joinFailed"), { description: err.message });
        },
        onSettled: () => setJoiningId(null),
    });

    const leaveMutation = useMutation({
        mutationFn: (bookingId: string) => {
            setLeavingId(bookingId);
            return api.leaveBooking(bookingId);
        },
        onSuccess: () => {
            toast.success(t("toast.cancelled"));
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
        },
        onError: (err: Error) => {
            const knownErrors: Record<string, string> = {
                "Cannot leave a booking less than 24 hours before it starts.": "toast.cancelTooLate",
            };
            const description = knownErrors[err.message] ? t(knownErrors[err.message]) : err.message;
            toast.error(t("toast.cancelFailed"), { description });
        },
        onSettled: () => setLeavingId(null),
    });

    const myGames = sortBookings(myGamesData?.bookings ?? []).filter((b) => b.amIIn);
    const discoverGames = sortBookings(discoverData?.bookings ?? []).filter((b) => !b.amIIn);

    const clubOptions = (myClubsData?.clubs ?? [])
        .map((c) => ({ clubId: c.clubId, name: c.name, timeZoneId: c.timeZoneId }))
        .sort((a, b) => a.name.localeCompare(b.name));

    const handleJoin = (bookingId: string, slot?: { team: "TeamA" | "TeamB"; positionInTeam: number }) =>
        joinMutation.mutate({ bookingId, slot });
    const handleLeave = (bookingId: string) => leaveMutation.mutate(bookingId);

    return (
        <>
            <div className="hidden w-[320px] shrink-0 border-r border-border lg:block">
                <BookingsFiltersColumn
                    tab={activeFilterTab}
                    onTabChange={setActiveFilterTab}
                    draft={activeDraft}
                    onDraftChange={setActiveDraft}
                    clubOptions={clubOptions}
                    onApply={activeFilterTab === "myGames" ? setMyGamesFilters : setDiscoverFilters}
                    onCreateBooking={() => setShowCreate(true)}
                />
            </div>

            <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-card">
                {/* Ambient brand-green glow, matching the landing page's visual language */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-32 left-1/2 h-140 w-140 -translate-x-1/2 rounded-full bg-[#8CC63F] opacity-10 blur-[150px]"
                />

                {/* Top header bar */}
                <div className="relative z-10 flex shrink-0 items-center justify-center bg-linear-to-r from-[#8CC63F] to-[#6FA82F] py-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.15)]">
                    <img src="/logo.png" alt="Kora" className="h-5 w-auto" />
                </div>

                <div className="relative z-10 flex-1 overflow-y-auto px-10 py-8">
                    <div className="mb-6 flex items-center justify-end gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowFilters(true)}
                            aria-label={t("filter.mobileOpen")}
                            className="lg:hidden"
                        >
                            <SlidersHorizontal className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => setShowCreate(true)}
                            className="bg-[#8CC63F] text-[#0D1B2A] font-semibold hover:bg-[#7AB534] lg:hidden"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            {t("newBooking")}
                        </Button>
                    </div>

                    <CreateBookingDialog open={showCreate} onOpenChange={setShowCreate} />

                    <Dialog open={showFilters} onOpenChange={setShowFilters}>
                        <DialogContent className="max-h-[85vh] w-full max-w-sm overflow-y-auto p-0 lg:hidden" showCloseButton>
                            <DialogTitle className="sr-only">{title}</DialogTitle>
                            <BookingsFiltersColumn
                                tab={activeFilterTab}
                                onTabChange={setActiveFilterTab}
                                draft={activeDraft}
                                onDraftChange={setActiveDraft}
                                clubOptions={clubOptions}
                                onApply={(filters) => {
                                    if (activeFilterTab === "myGames") setMyGamesFilters(filters);
                                    else setDiscoverFilters(filters);
                                    setShowFilters(false);
                                }}
                                onCreateBooking={() => {
                                    setShowFilters(false);
                                    setShowCreate(true);
                                }}
                            />
                        </DialogContent>
                    </Dialog>

                    <div className="flex flex-col gap-10">
                        <BookingsSection
                            title={t("tabs.myGames")}
                            bookings={myGames}
                            isLoading={myGamesLoading}
                            isError={myGamesError}
                            onJoin={handleJoin}
                            joiningId={joiningId}
                            isJoinPending={joinMutation.isPending}
                            onLeave={handleLeave}
                            leavingId={leavingId}
                            isLeavePending={leaveMutation.isPending}
                        />
                        <BookingsSection
                            title={t("tabs.discover")}
                            bookings={discoverGames}
                            isLoading={discoverLoading}
                            isError={discoverError}
                            onJoin={handleJoin}
                            joiningId={joiningId}
                            isJoinPending={joinMutation.isPending}
                            onLeave={handleLeave}
                            leavingId={leavingId}
                            isLeavePending={leaveMutation.isPending}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
