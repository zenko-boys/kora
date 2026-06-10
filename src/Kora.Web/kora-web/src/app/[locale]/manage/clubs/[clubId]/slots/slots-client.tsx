"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import moment from "moment-timezone";
import { ArrowLeft, Clock, LayoutGrid, Users } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { createApiClient } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScheduleSlot, CourtSchedule } from "@/lib/types";

interface SlotsClientProps {
    clubId: string;
    clubName: string;
    timeZoneId: string;
    title: string;
    subtitle: string;
    backLabel: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmtTime(iso: string) {
    return moment.parseZone(iso).format("HH:mm");
}

function isSlotPast(slot: ScheduleSlot, tzId: string): boolean {
    return moment.parseZone(slot.startTime).isBefore(moment.tz(tzId));
}

// ─── Week date picker (same pattern as create-booking-form) ─────────────────

function WeekPicker({
    selected,
    onChange,
    tzId,
}: {
    selected: string;
    onChange: (d: string) => void;
    tzId: string;
}) {
    const today = moment.tz(tzId);
    const [weekStart, setWeekStart] = useState(() =>
        today.clone().startOf("isoWeek")
    );

    const days = Array.from({ length: 7 }, (_, i) =>
        weekStart.clone().add(i, "days")
    );

    return (
        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={() => setWeekStart((w) => w.clone().subtract(7, "days"))}
                className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:border-[#8CC63F]/50 hover:text-foreground"
            >
                ‹
            </button>
            <div className="flex gap-1">
                {days.map((d) => {
                    const iso = d.format("YYYY-MM-DD");
                    const isToday = iso === today.format("YYYY-MM-DD");
                    const isSelected = iso === selected;
                    const isPast = d.isBefore(today, "day");
                    return (
                        <button
                            key={iso}
                            type="button"
                            disabled={isPast}
                            onClick={() => onChange(iso)}
                            className={[
                                "flex w-11 flex-col items-center rounded-lg border py-1.5 text-xs transition-colors",
                                isSelected
                                    ? "border-[#8CC63F] bg-[#8CC63F] text-[#0D1B2A]"
                                    : isToday
                                        ? "border-[#8CC63F]/40 text-foreground hover:border-[#8CC63F] hover:bg-[#8CC63F]/5"
                                        : isPast
                                            ? "cursor-not-allowed border-border text-muted-foreground/40"
                                            : "border-border text-muted-foreground hover:border-[#8CC63F]/40 hover:text-foreground",
                            ].join(" ")}
                        >
                            <span className="text-[10px] font-medium uppercase opacity-60">
                                {d.format("ddd")}
                            </span>
                            <span className="text-sm font-bold">{d.format("D")}</span>
                        </button>
                    );
                })}
            </div>
            <button
                type="button"
                onClick={() => setWeekStart((w) => w.clone().add(7, "days"))}
                className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:border-[#8CC63F]/50 hover:text-foreground"
            >
                ›
            </button>
        </div>
    );
}

// ─── Court Schedule Panel ────────────────────────────────────────────────────

function CourtSchedulePanel({
    court,
    tzId,
}: {
    court: CourtSchedule;
    tzId: string;
}) {
    const t = useTranslations("manage");

    return (
        <Card className="overflow-hidden border-border">
            <CardHeader className="border-b border-border bg-muted/30 px-5 py-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <LayoutGrid className="h-4 w-4 text-[#8CC63F]" />
                    {court.courtName}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                {court.slots.length === 0 ? (
                    <p className="py-4 text-center text-xs text-muted-foreground">
                        {t("slots.noSlots")}
                    </p>
                ) : (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-2">
                        {court.slots.map((slot) => {
                            const past = isSlotPast(slot, tzId);
                            const available = !past && slot.available;
                            return (
                                <div
                                    key={slot.startTime}
                                    className={[
                                        "flex flex-col rounded-md border px-3 py-2 text-xs",
                                        past
                                            ? "border-border bg-muted/40 text-muted-foreground/50"
                                            : available
                                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                : "border-red-500/30 bg-red-500/10 text-red-500",
                                    ].join(" ")}
                                >
                                    <span className="font-semibold">
                                        {fmtTime(slot.startTime)} – {fmtTime(slot.endTime)}
                                    </span>
                                    <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wider opacity-70">
                                        {past
                                            ? t("slots.past")
                                            : available
                                                ? t("slots.available")
                                                : t("slots.occupied")}
                                    </span>
                                    {!past && !available && slot.booking && (
                                        <span className="mt-1 flex items-center gap-1 text-[10px] opacity-80">
                                            <Users className="h-2.5 w-2.5" />
                                            {slot.booking.participantsCount}/{slot.booking.capacity}
                                            {" · "}
                                            {slot.booking.type}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function SlotsClient({
    clubId,
    clubName,
    timeZoneId,
    title,
    subtitle,
    backLabel,
}: SlotsClientProps) {
    const { getToken } = useAuth();
    const t = useTranslations("manage");
    const api = createApiClient(async (opts) => getToken(opts));

    const today = moment.tz(timeZoneId).format("YYYY-MM-DD");
    const [date, setDate] = useState(today);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["club-schedule", clubId, date],
        queryFn: () => api.getClubSchedule(clubId, date),
        enabled: !!date,
        staleTime: 0,
    });

    const courts = data?.courts ?? [];
    const tzId = data?.timeZoneId ?? timeZoneId;
    const tzBadge = moment.tz(timeZoneId).format("[UTC]Z") + " · " + timeZoneId;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Link
                    href={`/manage/clubs/${clubId}`}
                    className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {backLabel}
                </Link>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            {title}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {clubName} · {subtitle}
                        </p>
                    </div>
                    <span className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {tzBadge}
                    </span>
                </div>
            </div>

            {/* Date picker */}
            <div className="flex items-center gap-3">
                <WeekPicker
                    selected={date}
                    onChange={setDate}
                    tzId={timeZoneId}
                />
            </div>

            {/* Courts grid */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-40 w-full rounded-xl" />
                    ))}
                </div>
            ) : isError ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
                    <p className="text-sm text-destructive">{t("slots.failedToLoad")}</p>
                </div>
            ) : courts.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
                    <LayoutGrid className="mb-4 h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm font-medium text-muted-foreground">
                        {t("slots.noCourts")}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {courts.map((court) => (
                        <CourtSchedulePanel
                            key={court.courtId}
                            court={court}
                            tzId={tzId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
