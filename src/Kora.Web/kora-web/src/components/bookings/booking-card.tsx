"use client";

import { useState } from "react";
import moment from "moment-timezone";
import "moment/locale/pt";
import { Clock, MapPin, CheckCircle2, Trash2, UserMinus, User } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import type { BookingCard as BookingCardType } from "@/lib/types";

interface BookingCardProps {
    booking: BookingCardType;
    onJoin: (bookingId: string) => void;
    isJoining: boolean;
    onLeave: (bookingId: string) => void;
    isLeaving: boolean;
    onDelete?: (bookingId: string) => void;
    isDeleting?: boolean;
    isManageView?: boolean;
}

function formatTime(isoString: string) {
    if (!isoString) return "--:--";
    return moment.parseZone(isoString).format("HH:mm");
}

function formatDate(isoString: string, locale: string) {
    if (!isoString) return "---";
    return moment.parseZone(isoString).locale(locale).format("ddd, MMM D");
}

const TYPE_COLORS = {
    Game: "bg-[#3D46FB]/20 text-[#818cf8] border-[#3D46FB]/30",
    DayUse: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
} as const;

export function BookingCard({ booking, onJoin, isJoining, onLeave, isLeaving, onDelete, isDeleting, isManageView = false }: BookingCardProps) {
    const t = useTranslations("bookings.card");
    const locale = useLocale();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const {
        bookingId,
        clubName,
        courtName,
        type,
        startsAt,
        endsAt,
        participantsCount,
        capacity,
        spotsOpen,
        amIIn,
    } = booking;

    const isFull = spotsOpen <= 0;

    const { user } = useUser();
    const userInitials = user
        ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase().trim() || "?"
        : "?";

    const MAX_AVATARS = 6;
    const totalSlots = Math.min(capacity, MAX_AVATARS);
    const overflowCount = capacity > MAX_AVATARS ? capacity - MAX_AVATARS : 0;

    return (
        <Card className="flex flex-col overflow-hidden border-border transition-all hover:shadow-md">
            <CardHeader className="px-5 pb-3 pt-5">
                <div className="flex items-start justify-between gap-2">
                    {/* Club + court */}
                    <div className="min-w-0">
                        <p className="truncate text-base font-semibold leading-tight text-foreground">{clubName}</p>
                        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{courtName}</span>
                        </div>
                    </div>
                    {/* Type badge */}
                    <div className="flex shrink-0 items-center gap-2">
                        <Badge
                            variant="outline"
                            className={`border text-[10px] font-semibold uppercase tracking-wider ${TYPE_COLORS[type]}`}
                        >
                            {type === "DayUse" ? "Day Use" : "Game"}
                        </Badge>
                        {onDelete && (
                            <button
                                onClick={() => onDelete(bookingId)}
                                disabled={isDeleting}
                                aria-label={t("deleteBooking")}
                                className="cursor-pointer rounded p-1 text-muted-foreground/50 transition-colors hover:text-destructive disabled:opacity-40"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-4 px-5 pb-5">
                {/* Time */}
                <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="font-medium text-foreground">{formatDate(startsAt, locale)}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">
                        {formatTime(startsAt)} – {formatTime(endsAt)}
                    </span>
                </div>

                {/* Participants */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                            {Array.from({ length: totalSlots }, (_, i) => {
                                const filled = i < participantsCount;
                                const isCurrentUser = amIIn && i === 0;

                                if (!filled) {
                                    return (
                                        <div
                                            key={i}
                                            className="h-8 w-8 shrink-0 rounded-full border-2 border-dashed border-border bg-background ring-2 ring-card"
                                        />
                                    );
                                }

                                if (isCurrentUser && user?.imageUrl) {
                                    return (
                                        <div key={i} className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-2 ring-card">
                                            <img src={user.imageUrl} alt={user.fullName ?? ""} className="h-full w-full object-cover" />
                                        </div>
                                    );
                                }

                                if (isCurrentUser) {
                                    return (
                                        <div key={i} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3D46FB]/20 text-[10px] font-bold text-[#818cf8] ring-2 ring-card">
                                            {userInitials}
                                        </div>
                                    );
                                }

                                return (
                                    <div key={i} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted ring-2 ring-card">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                );
                            })}
                        </div>
                        {overflowCount > 0 && (
                            <span className="text-xs text-muted-foreground">+{overflowCount}</span>
                        )}
                    </div>
                    {isFull ? (
                        <span className="text-xs font-semibold text-destructive">{t("full")}</span>
                    ) : (
                        <span className="text-xs font-semibold text-emerald-500">{t("openSpots", { count: spotsOpen })}</span>
                    )}
                </div>

                {/* CTA */}
                {!isManageView && (
                    <div className="flex items-center justify-between gap-2 pt-1">
                        {amIIn ? (
                            <>
                                <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-500">
                                    <CheckCircle2 className="h-4 w-4" />
                                    {t("youreIn")}
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => onLeave(bookingId)}
                                    disabled={isLeaving}
                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                >
                                    <UserMinus className="h-3.5 w-3.5" />
                                    {isLeaving ? t("leaving") : t("leave")}
                                </Button>
                            </>
                        ) : isFull ? (
                            <Button disabled variant="outline" className="w-full">
                                {t("bookingFull")}
                            </Button>
                        ) : (
                            <>
                                <Button
                                    onClick={() => setConfirmOpen(true)}
                                    disabled={isJoining}
                                    className="w-full bg-[#3D46FB] text-white hover:bg-[#3D46FB]/90 disabled:opacity-60"
                                >
                                    {isJoining ? t("joining") : t("join")}
                                </Button>

                                <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                                    <DialogContent className="sm:max-w-sm">
                                        <DialogHeader>
                                            <DialogTitle>{t("joinConfirm.title")}</DialogTitle>
                                            <DialogDescription>{t("joinConfirm.description")}</DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter className="gap-2 sm:gap-0">
                                            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                                                {t("joinConfirm.cancel")}
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    setConfirmOpen(false);
                                                    onJoin(bookingId);
                                                }}
                                                className="bg-[#3D46FB] text-white hover:bg-[#3D46FB]/90"
                                            >
                                                {t("joinConfirm.confirm")}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
