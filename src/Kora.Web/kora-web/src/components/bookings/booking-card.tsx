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
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip";
import type { BookingCard as BookingCardType } from "@/lib/types";

type Team = "TeamA" | "TeamB";
type Slot = { team: Team; positionInTeam: number };

interface BookingCardProps {
    booking: BookingCardType;
    onJoin: (bookingId: string, slot?: Slot) => void;
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
    Game: "bg-[#8CC63F]/20 text-[#8CC63F] border-[#8CC63F]/30",
    DayUse: "bg-[#8CC63F]/20 text-[#8CC63F] border-[#8CC63F]/30",
} as const;

// Slots ordered: TeamA pos 0, TeamA pos 1, TeamB pos 0, TeamB pos 1
const GAME_SLOTS: Slot[] = [
    { team: "TeamA", positionInTeam: 1 },
    { team: "TeamA", positionInTeam: 2 },
    { team: "TeamB", positionInTeam: 1 },
    { team: "TeamB", positionInTeam: 2 },
];

function GameSlotAvatar({
    filled,
    isCurrentUser,
    userImageUrl,
    userInitials,
    clickable,
    onClick,
}: {
    filled: boolean;
    isCurrentUser: boolean;
    userImageUrl?: string;
    userInitials: string;
    clickable: boolean;
    onClick?: () => void;
}) {
    if (filled) {
        if (isCurrentUser && userImageUrl) {
            return (
                <Tooltip>
                    <TooltipTrigger render={
                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full ring-2 ring-[#8CC63F]/40" />
                    }>
                        <img src={userImageUrl} className="h-full w-full object-cover" alt="" />
                    </TooltipTrigger>
                    <TooltipContent>You</TooltipContent>
                </Tooltip>
            );
        }
        if (isCurrentUser) {
            return (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#8CC63F]/20 text-xs font-bold text-[#8CC63F] ring-2 ring-[#8CC63F]/40">
                    {userInitials}
                </div>
            );
        }
        return (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted">
                <User className="h-5 w-5 text-muted-foreground" />
            </div>
        );
    }

    if (clickable) {
        return (
            <button
                onClick={onClick}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-border bg-background transition-colors hover:border-[#8CC63F]/60 hover:bg-[#8CC63F]/5 cursor-pointer"
                aria-label="Select this spot"
            >
                <User className="h-5 w-5 text-muted-foreground/40" />
            </button>
        );
    }

    return (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-border/40 bg-background">
            <User className="h-5 w-5 text-muted-foreground/20" />
        </div>
    );
}

export function BookingCard({
    booking,
    onJoin,
    isJoining,
    onLeave,
    isLeaving,
    onDelete,
    isDeleting,
    isManageView = false,
}: BookingCardProps) {
    const t = useTranslations("bookings.card");
    const locale = useLocale();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
    const { user } = useUser();

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

    const userInitials = user
        ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase().trim() || "?"
        : "?";

    // For non-game bookings
    const MAX_AVATARS = 6;
    const totalSlots = Math.min(capacity, MAX_AVATARS);
    const overflowCount = capacity > MAX_AVATARS ? capacity - MAX_AVATARS : 0;

    const handleSlotClick = (slot: Slot) => {
        setSelectedSlot(slot);
        setConfirmOpen(true);
    };

    const handleConfirmJoin = () => {
        setConfirmOpen(false);
        if (type === "Game") {
            onJoin(bookingId, selectedSlot ?? undefined);
        } else {
            onJoin(bookingId);
        }
    };

    return (
        <Card className="flex flex-col overflow-hidden border border-[#1E2F40] transition-all hover:border-[#2A3B4C] hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
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
                {type === "Game" ? (
                    // Game: two-team slot layout
                    <div className="flex items-center justify-between gap-2">
                        {/* TeamA */}
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Team A</span>
                            <div className="flex gap-2">
                                {GAME_SLOTS.filter(s => s.team === "TeamA").map((slot, i) => {
                                    const slotIndex = i; // 0 or 1
                                    const filled = slotIndex < Math.min(participantsCount, 2);
                                    const isCurrentUser = amIIn && slotIndex === 0;
                                    const clickable = !filled && !amIIn && !isFull && !isManageView;
                                    return (
                                        <GameSlotAvatar
                                            key={slot.positionInTeam}
                                            filled={filled}
                                            isCurrentUser={isCurrentUser}
                                            userImageUrl={user?.imageUrl}
                                            userInitials={userInitials}
                                            clickable={clickable}
                                            onClick={() => handleSlotClick(slot)}
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        {/* VS divider */}
                        <div className="flex flex-col items-center">
                            <span className="text-xs font-bold text-muted-foreground/60">VS</span>
                        </div>

                        {/* TeamB */}
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Team B</span>
                            <div className="flex gap-2">
                                {GAME_SLOTS.filter(s => s.team === "TeamB").map((slot, i) => {
                                    const globalIndex = 2 + i; // slots 2 and 3 overall
                                    const filled = globalIndex < participantsCount;
                                    const isCurrentUser = false; // current user is always placed in TeamA
                                    const clickable = !filled && !amIIn && !isFull && !isManageView;
                                    return (
                                        <GameSlotAvatar
                                            key={slot.positionInTeam}
                                            filled={filled}
                                            isCurrentUser={isCurrentUser}
                                            userImageUrl={user?.imageUrl}
                                            userInitials={userInitials}
                                            clickable={clickable}
                                            onClick={() => handleSlotClick(slot)}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    // DayUse: original avatar row
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
                                            <Tooltip key={i}>
                                                <TooltipTrigger render={<div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-2 ring-card" />}>
                                                    <img src={user.imageUrl} alt={user.fullName ?? ""} className="h-full w-full object-cover" />
                                                </TooltipTrigger>
                                                <TooltipContent>{user?.fullName ?? user?.firstName}</TooltipContent>
                                            </Tooltip>
                                        );
                                    }
                                    if (isCurrentUser) {
                                        return (
                                            <Tooltip key={i}>
                                                <TooltipTrigger render={<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#8CC63F]/20 text-[10px] font-bold text-[#0D1B2A] ring-2 ring-card" />}>
                                                    {userInitials}
                                                </TooltipTrigger>
                                                <TooltipContent>{user?.fullName ?? user?.firstName}</TooltipContent>
                                            </Tooltip>
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
                            <span className="text-xs font-semibold text-[#8CC63F]">{t("openSpots", { count: spotsOpen })}</span>
                        )}
                    </div>
                )}

                {/* CTA */}
                {!isManageView && (
                    <div className="flex items-center justify-between gap-2 pt-1">
                        {amIIn ? (
                            <>
                                <div className="flex items-center gap-1.5 text-sm font-medium text-[#8CC63F]">
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
                        ) : type === "Game" ? (
                            // For game bookings the slot avatars above are the CTA — show a hint
                            <p className="text-xs text-muted-foreground">{t("selectSpot")}</p>
                        ) : (
                            <Button
                                onClick={() => setConfirmOpen(true)}
                                disabled={isJoining}
                                className="w-full bg-[#8CC63F] text-[#0D1B2A] font-semibold hover:bg-[#7AB534] disabled:opacity-60"
                            >
                                {isJoining ? t("joining") : t("join")}
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>

            {/* Confirm dialog (shared for both game slot and dayuse join) */}
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{t("joinConfirm.title")}</DialogTitle>
                        <DialogDescription>
                            {type === "Game" && selectedSlot
                                ? `${selectedSlot.team === "TeamA" ? "Team A" : "Team B"}, position ${selectedSlot.positionInTeam}`
                                : t("joinConfirm.description")}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                            {t("joinConfirm.cancel")}
                        </Button>
                        <Button
                            onClick={handleConfirmJoin}
                            disabled={isJoining}
                            className="bg-[#8CC63F] text-[#0D1B2A] font-semibold hover:bg-[#7AB534]"
                        >
                            {t("joinConfirm.confirm")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
