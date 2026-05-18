"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CalendarOff, Plus } from "lucide-react";
import { createApiClient } from "@/lib/api";
import { BookingCard } from "@/components/bookings/booking-card";
import { BookingCardSkeleton } from "@/components/bookings/booking-card-skeleton";
import { BookingsFilterBar } from "@/components/bookings/bookings-filter-bar";
import { CreateBookingForm } from "@/components/bookings/create-booking-form";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { BookingsFilter, MyClubSummary } from "@/lib/types";

const MANAGEMENT_ROLES = ["Owner", "Manager", "Admin"];

export function ManageBookingsClient({ title, subtitle }: { title: string; subtitle: string }) {
    const { getToken } = useAuth();
    const qc = useQueryClient();
    const t = useTranslations("manage");
    const searchParams = useSearchParams();
    const initialClubId: string = searchParams.get("clubId") ?? "";
    const api = createApiClient(async (opts) => getToken(opts));

    const [showCreate, setShowCreate] = useState(false);
    const [clubId, setClubId] = useState(initialClubId);
    const [subFilters, setSubFilters] = useState<BookingsFilter>({});
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // ── Clubs ──────────────────────────────────────────────────────────────
    const { data: clubsData } = useQuery({
        queryKey: ["my-clubs"],
        queryFn: () => api.getMyClubs(),
    });
    const managedClubs: MyClubSummary[] = (clubsData?.clubs ?? []).filter((c) =>
        MANAGEMENT_ROLES.includes(c.role)
    );

    // ── Bookings ───────────────────────────────────────────────────────────
    const filters: BookingsFilter = {
        ...subFilters,
        ...(clubId ? { clubId } : {}),
    };

    const { data, isLoading, isError } = useQuery({
        queryKey: ["bookings", filters],
        queryFn: () => api.getBookings(filters),
    });
    const bookings = data?.bookings ?? [];

    const deleteMutation = useMutation({
        mutationFn: (bookingId: string) => {
            setDeletingId(bookingId);
            return api.deleteBooking(bookingId);
        },
        onSuccess: () => {
            toast.success(t("bookings.toast.deleted"));
            qc.invalidateQueries({ queryKey: ["bookings"] });
        },
        onError: (err: Error) => {
            toast.error(t("bookings.toast.deleteFailed"), { description: err.message });
        },
        onSettled: () => setDeletingId(null),
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
                </div>
                {!showCreate && (
                    <Button
                        size="sm"
                        onClick={() => setShowCreate(true)}
                        className="bg-[#3D46FB] text-white hover:bg-[#3D46FB]/90"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        {t("bookings.newBooking")}
                    </Button>
                )}
            </div>

            {/* Create form */}
            {showCreate && <CreateBookingForm onClose={() => setShowCreate(false)} />}

            {/* Filters */}
            <div className="rounded-xl border border-border bg-card px-4 py-3">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Club filter */}
                    <div className="flex items-center gap-2">
                        <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Club
                        </Label>
                        <Select value={clubId || "all"} onValueChange={(v) => setClubId(!v || v === "all" ? "" : v)}>
                            <SelectTrigger className="h-8 w-44 text-sm">
                                <SelectValue placeholder={t("bookings.allClubs")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t("bookings.allClubs")}</SelectItem>
                                {managedClubs.map((c) => (
                                    <SelectItem key={c.clubId} value={c.clubId}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Type + open spots (reuse shared filter bar minus club dropdown) */}
                    <BookingsFilterBar filters={subFilters} onChange={setSubFilters} />
                </div>
            </div>

            {/* Results count */}
            {!isLoading && !isError && (
                <p className="text-sm text-muted-foreground">
                    {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}
                </p>
            )}

            {/* Grid */}
            {isLoading ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <BookingCardSkeleton key={i} />
                    ))}
                </div>
            ) : isError ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 py-16 text-center">
                    <p className="text-sm font-medium text-destructive">
                        {t("bookings.noBookings")}
                    </p>
                </div>
            ) : bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-border py-20 text-center">
                    <CalendarOff className="mb-4 h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm font-medium text-muted-foreground">
                        {t("bookings.noBookings")}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/60">
                        {t("bookings.adjustFilters")}
                    </p>
                </div>
            ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {bookings.map((booking) => (
                        <BookingCard
                            key={booking.bookingId}
                            booking={booking}
                            onJoin={() => { }}
                            isJoining={false}
                            onLeave={() => { }}
                            isLeaving={false}
                            onDelete={(id) => deleteMutation.mutate(id)}
                            isDeleting={deletingId === booking.bookingId && deleteMutation.isPending}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
