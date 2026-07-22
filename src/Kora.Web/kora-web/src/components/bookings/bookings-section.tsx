"use client";

import { CalendarOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { BookingCard } from "@/components/bookings/booking-card";
import { BookingCardSkeleton } from "@/components/bookings/booking-card-skeleton";
import { BookingsCarousel } from "@/components/bookings/bookings-carousel";
import type { BookingCard as BookingCardType } from "@/lib/types";

type Slot = { team: "TeamA" | "TeamB"; positionInTeam: number };

interface BookingsSectionProps {
    title: string;
    bookings: BookingCardType[];
    isLoading: boolean;
    isError: boolean;
    onJoin: (bookingId: string, slot?: Slot) => void;
    joiningId: string | null;
    isJoinPending: boolean;
    onLeave: (bookingId: string) => void;
    leavingId: string | null;
    isLeavePending: boolean;
}

export function BookingsSection({
    title,
    bookings,
    isLoading,
    isError,
    onJoin,
    joiningId,
    isJoinPending,
    onLeave,
    leavingId,
    isLeavePending,
}: BookingsSectionProps) {
    const t = useTranslations("bookings");

    return (
        <section>
            <div className="mb-4 flex items-baseline justify-between">
                <h2 className="text-[18px] font-bold text-foreground">{title}</h2>
                {!isLoading && !isError && (
                    <span className="text-[13px] text-muted-foreground">
                        {t("bookingsFound", { count: bookings.length })}
                    </span>
                )}
            </div>

            {isLoading ? (
                <div className="flex gap-5 overflow-hidden">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="w-[300px] shrink-0">
                            <BookingCardSkeleton />
                        </div>
                    ))}
                </div>
            ) : isError ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 py-12 text-center">
                    <p className="text-sm font-medium text-destructive">{t("failedToLoad")}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{t("checkConnection")}</p>
                </div>
            ) : bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-border py-12 text-center">
                    <CalendarOff className="mb-3 h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm font-medium text-muted-foreground">{t("noBookingsAvailable")}</p>
                    <p className="mt-1 text-xs text-muted-foreground/60">{t("adjustFilters")}</p>
                </div>
            ) : (
                <BookingsCarousel>
                    {bookings.map((booking) => (
                        <div key={booking.bookingId} className="w-[300px] shrink-0">
                            <BookingCard
                                booking={booking}
                                onJoin={onJoin}
                                isJoining={joiningId === booking.bookingId && isJoinPending}
                                onLeave={onLeave}
                                isLeaving={leavingId === booking.bookingId && isLeavePending}
                            />
                        </div>
                    ))}
                </BookingsCarousel>
            )}
        </section>
    );
}
