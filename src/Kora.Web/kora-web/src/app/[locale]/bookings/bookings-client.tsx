"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CalendarOff, Plus } from "lucide-react";
import { BookingCard } from "@/components/bookings/booking-card";
import { BookingCardSkeleton } from "@/components/bookings/booking-card-skeleton";
import { BookingsFilterBar } from "@/components/bookings/bookings-filter-bar";
import { CreateBookingForm } from "@/components/bookings/create-booking-form";
import { createApiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import type { BookingsFilter } from "@/lib/types";

export function BookingsClient({ title, subtitle }: { title: string; subtitle: string }) {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    const t = useTranslations("bookings");
    const [joiningId, setJoiningId] = useState<string | null>(null);
    const [leavingId, setLeavingId] = useState<string | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [filters, setFilters] = useState<BookingsFilter>({});

    const api = createApiClient(async () => getToken({ template: "dev" }));

    const { data, isLoading, isError } = useQuery({
        queryKey: ["bookings", filters],
        queryFn: () => api.getBookings(filters),
    });

    const joinMutation = useMutation({
        mutationFn: (bookingId: string) => {
            setJoiningId(bookingId);
            return api.joinBooking(bookingId);
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
            toast.error(t("toast.cancelFailed"), { description: err.message });
        },
        onSettled: () => setLeavingId(null),
    });

    const bookings = data?.bookings ?? [];

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
                        {t("newBooking")}
                    </Button>
                )}
            </div>

            {/* Create form */}
            {showCreate && <CreateBookingForm onClose={() => setShowCreate(false)} />}

            {/* Filter bar */}
            <div className="rounded-xl border border-border bg-card px-4 py-3">
                <BookingsFilterBar filters={filters} onChange={setFilters} />
            </div>

            {/* Results header */}
            {!isLoading && !isError && (
                <p className="text-sm text-muted-foreground">
                    {t("bookingsFound", { count: bookings.length })}
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
                            onJoin={(id) => joinMutation.mutate(id)}
                            isJoining={joiningId === booking.bookingId && joinMutation.isPending}
                            onLeave={(id) => leaveMutation.mutate(id)}
                            isLeaving={leavingId === booking.bookingId && leaveMutation.isPending}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
