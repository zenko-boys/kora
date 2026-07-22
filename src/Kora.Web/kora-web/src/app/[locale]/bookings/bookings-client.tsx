"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { startOfDay } from "date-fns";
import { CalendarOff, Plus, SlidersHorizontal } from "lucide-react";
import { BookingCard } from "@/components/bookings/booking-card";
import { BookingCardSkeleton } from "@/components/bookings/booking-card-skeleton";
import { BookingsFiltersColumn } from "@/components/bookings/bookings-filters-column";
import { CreateBookingDialog } from "@/components/bookings/create-booking-dialog";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { createApiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { getBookingStatus } from "@/lib/booking-status";
import type { BookingsFilter } from "@/lib/types";

const STATUS_RANK = { upcoming: 0, inProgress: 1, finished: 2 } as const;

export function BookingsClient({ title }: { title: string }) {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    const t = useTranslations("bookings");
    const [joiningId, setJoiningId] = useState<string | null>(null);
    const [leavingId, setLeavingId] = useState<string | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<BookingsFilter>({ open: true });
    const [tab, setTab] = useState<"myGames" | "discover">("myGames");

    const api = createApiClient(async () => getToken({ template: "dev" }));

    // Default the lower bound to the start of today (instead of "now") so games
    // already underway or finished earlier today still show up in the listing.
    const effectiveFilters: BookingsFilter = {
        ...filters,
        fromUtc: filters.fromUtc ?? startOfDay(new Date()).toISOString(),
    };

    const { data, isLoading, isError } = useQuery({
        queryKey: ["bookings", effectiveFilters],
        queryFn: () => api.getBookings(effectiveFilters),
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

    const allBookings = [...(data?.bookings ?? [])].sort((a, b) => {
        const statusA = getBookingStatus(a);
        const statusB = getBookingStatus(b);
        if (statusA !== statusB) return STATUS_RANK[statusA] - STATUS_RANK[statusB];
        const startA = new Date(a.startsAt).getTime();
        const startB = new Date(b.startsAt).getTime();
        return statusA === "finished" ? startB - startA : startA - startB;
    });
    const myGames = allBookings.filter((b) => b.amIIn);
    const discoverGames = allBookings.filter((b) => !b.amIIn);
    const bookings = tab === "myGames" ? myGames : discoverGames;

    const clubOptions = (myClubsData?.clubs ?? [])
        .map((c) => ({ clubId: c.clubId, name: c.name, timeZoneId: c.timeZoneId }))
        .sort((a, b) => a.name.localeCompare(b.name));

    return (
        <>
            <div className="hidden w-[320px] shrink-0 border-r border-border lg:block">
                <BookingsFiltersColumn
                    title={title}
                    tab={tab}
                    onTabChange={setTab}
                    initialFilters={filters}
                    clubOptions={clubOptions}
                    onApply={setFilters}
                />
            </div>

            <div className="min-w-0 flex-1 overflow-y-auto px-10 py-8">
                <div className="mb-6 flex items-baseline justify-between">
                    <div>
                        <h2 className="text-[22px] font-extrabold text-foreground">{t("page.resultsTitle")}</h2>
                        {!isLoading && !isError && (
                            <p className="mt-0.5 text-[13px] text-muted-foreground">
                                {t("bookingsFound", { count: bookings.length })}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
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
                            className="bg-[#8CC63F] text-[#0D1B2A] font-semibold hover:bg-[#7AB534]"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            {t("newBooking")}
                        </Button>
                    </div>
                </div>

                <CreateBookingDialog open={showCreate} onOpenChange={setShowCreate} />

                <Dialog open={showFilters} onOpenChange={setShowFilters}>
                    <DialogContent className="max-h-[85vh] w-full max-w-sm overflow-y-auto p-0 lg:hidden" showCloseButton>
                        <DialogTitle className="sr-only">{title}</DialogTitle>
                        <BookingsFiltersColumn
                            title={title}
                            tab={tab}
                            onTabChange={setTab}
                            initialFilters={filters}
                            clubOptions={clubOptions}
                            onApply={(f) => {
                                setFilters(f);
                                setShowFilters(false);
                            }}
                        />
                    </DialogContent>
                </Dialog>

                {isLoading ? (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <BookingCardSkeleton key={i} />
                        ))}
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 py-16 text-center">
                        <p className="text-sm font-medium text-destructive">{t("failedToLoad")}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{t("checkConnection")}</p>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-border py-20 text-center">
                        <CalendarOff className="mb-4 h-10 w-10 text-muted-foreground/40" />
                        <p className="text-sm font-medium text-muted-foreground">{t("noBookingsAvailable")}</p>
                        <p className="mt-1 text-xs text-muted-foreground/60">{t("adjustFilters")}</p>
                    </div>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {bookings.map((booking) => (
                            <BookingCard
                                key={booking.bookingId}
                                booking={booking}
                                onJoin={(id, slot) => joinMutation.mutate({ bookingId: id, slot })}
                                isJoining={joiningId === booking.bookingId && joinMutation.isPending}
                                onLeave={(id) => leaveMutation.mutate(id)}
                                isLeaving={leavingId === booking.bookingId && leaveMutation.isPending}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
