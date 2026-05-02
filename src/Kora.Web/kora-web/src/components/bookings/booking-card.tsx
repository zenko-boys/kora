"use client";

import { format, parseISO } from "date-fns";
import { Users, Clock, MapPin, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { BookingCard as BookingCardType } from "@/lib/types";

interface BookingCardProps {
    booking: BookingCardType;
    onJoin: (bookingId: string) => void;
    isJoining: boolean;
    onLeave: (bookingId: string) => void;
    isLeaving: boolean;
}

function formatTime(utcString: string) {
    return format(parseISO(utcString), "HH:mm");
}

function formatDate(utcString: string) {
    return format(parseISO(utcString), "EEE, MMM d");
}

const TYPE_COLORS = {
    Game: "bg-[#3D46FB]/20 text-[#818cf8] border-[#3D46FB]/30",
    DayUse: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
} as const;

export function BookingCard({ booking, onJoin, isJoining, onLeave, isLeaving }: BookingCardProps) {
    const {
        bookingId,
        clubName,
        courtName,
        type,
        startsAtUtc,
        endsAtUtc,
        participantsCount,
        capacity,
        spotsOpen,
        amIIn,
    } = booking;

    const fillPercent = capacity > 0 ? (participantsCount / capacity) * 100 : 0;
    const isFull = spotsOpen <= 0;

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
                    <Badge
                        variant="outline"
                        className={`shrink-0 border text-[10px] font-semibold uppercase tracking-wider ${TYPE_COLORS[type]}`}
                    >
                        {type === "DayUse" ? "Day Use" : "Game"}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-4 px-5 pb-5">
                {/* Time */}
                <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="font-medium text-foreground">{formatDate(startsAtUtc)}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">
                        {formatTime(startsAtUtc)} – {formatTime(endsAtUtc)}
                    </span>
                </div>

                {/* Participants */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Users className="h-3.5 w-3.5" />
                            <span>{participantsCount} / {capacity} players</span>
                        </div>
                        {isFull ? (
                            <span className="font-semibold text-destructive">Full</span>
                        ) : (
                            <span className="font-semibold text-emerald-500">{spotsOpen} open</span>
                        )}
                    </div>
                    <Progress value={fillPercent} className="h-1.5 [&>div]:bg-[#3D46FB]" />
                </div>

                {/* CTA */}
                <div className="flex justify-center pt-1">
                    {amIIn ? (
                        <div className="flex w-full flex-col gap-2">
                            <div className="flex items-center justify-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-500">
                                <CheckCircle2 className="h-4 w-4" />
                                You&apos;re In
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onLeave(bookingId)}
                                disabled={isLeaving}
                                className="w-full text-xs text-muted-foreground hover:text-destructive"
                            >
                                {isLeaving ? "Cancelling…" : "Cancel participation"}
                            </Button>
                        </div>
                    ) : isFull ? (
                        <Button disabled variant="outline" className="w-full">
                            Booking Full
                        </Button>
                    ) : (
                        <Button
                            onClick={() => onJoin(bookingId)}
                            disabled={isJoining}
                            className="w-full bg-[#3D46FB] text-white hover:bg-[#3D46FB]/90 disabled:opacity-60"
                        >
                            {isJoining ? "Joining…" : "Join Booking"}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
