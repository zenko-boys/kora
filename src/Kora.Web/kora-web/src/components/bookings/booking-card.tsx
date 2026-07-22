"use client";

import { useRef, useState } from "react";
import moment from "moment-timezone";
import "moment/locale/pt";
import { Clock, MapPin, CheckCircle2, ChevronLeft, ChevronRight, Trash2, LogOut, User } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useUser } from "@clerk/nextjs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { getBookingStatus } from "@/lib/booking-status";
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
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-[#8CC63F]/40" />
                    }>
                        <img src={userImageUrl} className="h-full w-full object-cover" alt="" />
                    </TooltipTrigger>
                    <TooltipContent>You</TooltipContent>
                </Tooltip>
            );
        }
        if (isCurrentUser) {
            return (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#8CC63F]/20 text-xs font-bold text-[#8CC63F] ring-2 ring-[#8CC63F]/40">
                    {userInitials}
                </div>
            );
        }
        return (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#8CC63F] bg-gradient-to-br from-[#8CC63F] to-[#6FA82F]">
                <User className="h-5 w-5 text-white" fill="currentColor" />
            </div>
        );
    }

    if (clickable) {
        return (
            <button
                onClick={onClick}
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-border bg-background transition-colors hover:border-[#8CC63F]/60 hover:bg-[#8CC63F]/5"
                aria-label="Select this spot"
            >
                <User className="h-4.5 w-4.5 text-muted-foreground/60" />
            </button>
        );
    }

    return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-border/40 bg-background">
            <User className="h-4.5 w-4.5 text-muted-foreground/20" />
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
    const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
    const { user } = useUser();
    const tagsTrackRef = useRef<HTMLDivElement>(null);

    function scrollTags(delta: number) {
        tagsTrackRef.current?.scrollBy({ left: delta, behavior: "smooth" });
    }

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
    const status = getBookingStatus(booking);
    const isFinished = status === "finished";
    const isInProgress = status === "inProgress";
    const canJoin = status === "upcoming";
    const hoursUntilStart = (new Date(startsAt).getTime() - Date.now()) / (1000 * 60 * 60);
    const canLeave = hoursUntilStart >= 24;

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
        <div
            className={cn(
                "relative flex flex-col rounded-[20px] border-[1.5px] border-[#1E2F40] bg-card px-5.5 py-5 transition-all hover:border-[#2A3B4C] hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)]",
                isFinished && "pointer-events-none opacity-60 grayscale-30"
            )}
        >
            {onDelete && (
                <button
                    onClick={() => onDelete(bookingId)}
                    disabled={isDeleting}
                    aria-label={t("deleteBooking")}
                    className="absolute right-3 top-3 z-10 cursor-pointer rounded p-1 text-muted-foreground/50 transition-colors hover:text-destructive disabled:opacity-40"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            )}

            {/* game-card-top: title + time on the right */}
            <div className="mb-1 flex items-start justify-between gap-3">
                <h3 className="min-w-0 truncate text-[17px] font-bold leading-tight text-foreground">{clubName}</h3>
                <div className="flex shrink-0 items-center gap-1.5 text-[13px] text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span>
                        {formatDate(startsAt, locale)} · {formatTime(startsAt)} – {formatTime(endsAt)}
                    </span>
                </div>
            </div>

            {/* court name + tags carousel (mirrors the day-picker's scroll-arrow pattern) */}
            <div className="mt-1 flex items-center justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-1.5 text-[13px] text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{courtName}</span>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                    <button
                        type="button"
                        onClick={() => scrollTags(-60)}
                        className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-[#8CC63F] hover:text-[#8CC63F]"
                        aria-label="Previous"
                    >
                        <ChevronLeft className="h-2.5 w-2.5" />
                    </button>

                    <div
                        ref={tagsTrackRef}
                        className="flex max-w-24 items-center gap-1.5 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                        <span
                            className={cn(
                                "shrink-0 rounded-full px-3 py-1.25 text-[10.5px] font-extrabold tracking-[0.3px] uppercase",
                                isFinished
                                    ? "bg-muted text-muted-foreground"
                                    : isInProgress
                                        ? "bg-amber-500/40 text-amber-800 dark:text-amber-300"
                                        : "bg-[#8CC63F]/35 text-[#2F6B1B] dark:text-[#8CC63F]"
                            )}
                        >
                            {isFinished ? t("statusFinished") : isInProgress ? t("statusInProgress") : t("statusUpcoming")}
                        </span>
                        <span
                            className={cn(
                                "shrink-0 rounded-full px-3 py-1.25 text-[11px] font-extrabold tracking-[0.3px] uppercase",
                                type === "DayUse" ? "bg-foreground/8 text-foreground" : "bg-[#8CC63F]/12 text-[#8CC63F]"
                            )}
                        >
                            {type === "DayUse" ? "Day Use" : "Game"}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={() => scrollTags(60)}
                        className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-[#8CC63F] hover:text-[#8CC63F]"
                        aria-label="Next"
                    >
                        <ChevronRight className="h-2.5 w-2.5" />
                    </button>
                </div>
            </div>

            {/* Participants */}
            {type === "Game" ? (
                // Game: teams-row
                <div className="mt-3 mb-4.5 grid grid-cols-[1fr_auto_1fr] items-center border-t border-border pt-3.5">
                    {/* TeamA */}
                    <div className="flex flex-col items-center gap-2.5">
                        <span className="text-[11px] font-extrabold tracking-[0.5px] text-muted-foreground uppercase">Team A</span>
                        <div className="flex gap-1.5">
                            {GAME_SLOTS.filter(s => s.team === "TeamA").map((slot, i) => {
                                const slotIndex = i; // 0 or 1
                                const filled = slotIndex < Math.min(participantsCount, 2);
                                const isCurrentUser = amIIn && slotIndex === 0;
                                const clickable = !filled && !amIIn && !isFull && !isManageView && canJoin;
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
                    <span className="px-2.5 text-xs font-extrabold text-muted-foreground/60">VS</span>

                    {/* TeamB */}
                    <div className="flex flex-col items-center gap-2.5">
                        <span className="text-[11px] font-extrabold tracking-[0.5px] text-muted-foreground uppercase">Team B</span>
                        <div className="flex gap-1.5">
                            {GAME_SLOTS.filter(s => s.team === "TeamB").map((slot, i) => {
                                const globalIndex = 2 + i; // slots 2 and 3 overall
                                const filled = globalIndex < participantsCount;
                                const isCurrentUser = false; // current user is always placed in TeamA
                                const clickable = !filled && !amIIn && !isFull && !isManageView && canJoin;
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
                // DayUse: flat capacity, no teams in the data model — stacked avatar row instead
                <div className="mt-3 mb-4.5 flex items-center justify-between gap-2 border-t border-border pt-3.5">
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                            {Array.from({ length: totalSlots }, (_, i) => {
                                const filled = i < participantsCount;
                                const isCurrentUser = amIIn && i === 0;

                                if (!filled) {
                                    return (
                                        <div
                                            key={i}
                                            className="h-10 w-10 shrink-0 rounded-full border-2 border-dashed border-border bg-background ring-2 ring-card"
                                        />
                                    );
                                }
                                if (isCurrentUser && user?.imageUrl) {
                                    return (
                                        <Tooltip key={i}>
                                            <TooltipTrigger render={<div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-card" />}>
                                                <img src={user.imageUrl} alt={user.fullName ?? ""} className="h-full w-full object-cover" />
                                            </TooltipTrigger>
                                            <TooltipContent>{user?.fullName ?? user?.firstName}</TooltipContent>
                                        </Tooltip>
                                    );
                                }
                                if (isCurrentUser) {
                                    return (
                                        <Tooltip key={i}>
                                            <TooltipTrigger render={<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#8CC63F]/20 text-[10px] font-bold text-[#0D1B2A] ring-2 ring-card" />}>
                                                {userInitials}
                                            </TooltipTrigger>
                                            <TooltipContent>{user?.fullName ?? user?.firstName}</TooltipContent>
                                        </Tooltip>
                                    );
                                }
                                return (
                                    <div key={i} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#8CC63F] bg-gradient-to-br from-[#8CC63F] to-[#6FA82F] ring-2 ring-card">
                                        <User className="h-5 w-5 text-white" fill="currentColor" />
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

            {/* card-footer */}
            {!isManageView && (
                <div className="flex items-center justify-between border-t border-border pt-3.5">
                    {amIIn ? (
                        <div className="flex w-full flex-col gap-3.5">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 text-[13px] font-bold text-[#8CC63F]">
                                    <CheckCircle2 className="h-4 w-4" />
                                    {t("youreIn")}
                                </div>
                                <button
                                    onClick={() => setConfirmLeaveOpen(true)}
                                    disabled={isLeaving || !canLeave}
                                    className="flex cursor-pointer items-center gap-1.5 text-[13px] font-bold text-destructive transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <LogOut className="h-4 w-4" />
                                    {isLeaving ? t("leaving") : t("leave")}
                                </button>
                            </div>
                            {!canLeave && (
                                <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                                    {t("cancelTooLate")}
                                </p>
                            )}
                        </div>
                    ) : isFull ? (
                        <span className="text-[13px] font-semibold text-muted-foreground">{t("bookingFull")}</span>
                    ) : type === "Game" ? (
                        // For game bookings the slot avatars above are the CTA — show a hint
                        canJoin && <p className="text-[13px] font-medium text-muted-foreground">{t("selectSpot")}</p>
                    ) : (
                        <>
                            <span className="text-[13px] font-medium text-muted-foreground">
                                {t("openSpots", { count: spotsOpen })}
                            </span>
                            <button
                                onClick={() => setConfirmOpen(true)}
                                disabled={isJoining || !canJoin}
                                className="cursor-pointer rounded-lg bg-[#8CC63F] px-4 py-2 text-[13px] font-extrabold text-[#0D1B2A] transition-[filter] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isJoining ? t("joining") : t("join")}
                            </button>
                        </>
                    )}
                </div>
            )}

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

            {/* Confirm dialog for leaving a booking */}
            <Dialog open={confirmLeaveOpen} onOpenChange={setConfirmLeaveOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{t("leaveConfirm.title")}</DialogTitle>
                        <DialogDescription>{t("leaveConfirm.description")}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setConfirmLeaveOpen(false)}>
                            {t("leaveConfirm.cancel")}
                        </Button>
                        <Button
                            onClick={() => {
                                setConfirmLeaveOpen(false);
                                onLeave(bookingId);
                            }}
                            disabled={isLeaving}
                            className="bg-destructive text-white font-semibold hover:bg-destructive/90"
                        >
                            {t("leaveConfirm.confirm")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
