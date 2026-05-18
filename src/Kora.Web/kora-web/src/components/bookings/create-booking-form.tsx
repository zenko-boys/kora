"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { X, Check, Clock, Loader2, Search, Star } from "lucide-react";
import moment from "moment-timezone";
import { createApiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import type { BookingType, CreateBookingRequest } from "@/lib/types";

function inputCls(extra?: string) {
    return `w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#82B1FF]/50 ${extra ?? ""}`;
}

export function CreateBookingForm({ onClose }: { onClose: () => void }) {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    const t = useTranslations("bookings");
    const api = createApiClient(async (opts) => getToken(opts));

    const [clubId, setClubId] = useState("");
    const [clubSearch, setClubSearch] = useState("");
    const [type, setType] = useState<BookingType>("Game");
    const [date, setDate] = useState("");
    const [dateViewMode, setDateViewMode] = useState<"month" | "week">("week");
    const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);
    const [courtsToOccupy, setCourtsToOccupy] = useState<number>(1);
    const [capacity, setCapacity] = useState<number | "">(10);
    const [description, setDescription] = useState("");

    // Reset slot selection when club or date changes
    useEffect(() => { setSelectionRange(null); }, [clubId, date]);

    const { data: clubsData, isLoading: loadingClubs } = useQuery({
        queryKey: ["my-clubs"],
        queryFn: () => api.getMyClubs(),
    });

    const clubs = clubsData?.clubs ?? [];
    const filteredClubs = clubSearch.trim()
        ? clubs.filter((c) => c.name.toLowerCase().includes(clubSearch.trim().toLowerCase()))
        : clubs;

    const { data: slotsData, isLoading: loadingSlots, isFetching: fetchingSlots } = useQuery({
        queryKey: ["club-slots", clubId, date],
        queryFn: () => api.getClubSlots(clubId, date),
        enabled: !!clubId && !!date,
        staleTime: 0,
        refetchOnMount: true,
    });

    const timeZoneId = slotsData?.timeZoneId ?? "UTC";
    const cellMin = slotsData?.slotCellDurationMinutes ?? 60;
    const minMin = slotsData?.minimumBookingDurationMinutes ?? 60;
    const slots = slotsData?.slots ?? [];
    const maxCourts = slots.length > 0 ? Math.max(...slots.map((s) => s.availableCourts)) : 1;

    const selectedCellCount = selectionRange ? selectionRange.end - selectionRange.start + 1 : 0;
    const meetsMinDuration = selectedCellCount * cellMin >= minMin;

    function isSlotPast(index: number): boolean {
        const cell = slots[index];
        if (!cell || !date) return false;
        const nowInClubTz = moment.tz(timeZoneId);
        if (date !== nowInClubTz.format("YYYY-MM-DD")) return false;
        const slotStart = moment.tz(`${date} ${cell.startTime}`, "YYYY-MM-DD HH:mm:ss", timeZoneId);
        return slotStart.isBefore(nowInClubTz);
    }

    function isSlotAvailable(index: number): boolean {
        const cell = slots[index];
        if (!cell || cell.availableCourts < courtsToOccupy) return false;
        return !isSlotPast(index);
    }

    function handleSlotClick(index: number) {
        if (!selectionRange) {
            setSelectionRange({ start: index, end: index });
            return;
        }
        // Click within current selection → clear
        if (index >= selectionRange.start && index <= selectionRange.end) {
            setSelectionRange(null);
            return;
        }
        // Extend if immediately adjacent to either end
        if (index === selectionRange.start - 1) {
            setSelectionRange({ start: index, end: selectionRange.end });
            return;
        }
        if (index === selectionRange.end + 1) {
            setSelectionRange({ start: selectionRange.start, end: index });
            return;
        }
        // Non-adjacent → start fresh
        setSelectionRange({ start: index, end: index });
    }

    // Clear selection if any selected slot no longer satisfies courtsToOccupy or slots refresh
    useEffect(() => {
        if (!selectionRange || slots.length === 0) return;
        for (let i = selectionRange.start; i <= selectionRange.end; i++) {
            if (!isSlotAvailable(i)) { setSelectionRange(null); return; }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courtsToOccupy, slots]);

    // Timezone display badge: e.g. "America/Sao_Paulo  → BRT (UTC-03:00)"
    const tzBadge = timeZoneId !== "UTC"
        ? moment.tz(timeZoneId).format("[UTC]Z") + " · " + timeZoneId
        : "UTC";

    function formatSlotTime(timeStr: string) {
        // timeStr is "HH:mm:ss" local to the club timezone
        return moment.tz(`${date} ${timeStr}`, "YYYY-MM-DD HH:mm:ss", timeZoneId).format("HH:mm");
    }

    const mutation = useMutation({
        mutationFn: () => {
            const startMoment = moment.tz(
                `${date} ${slots[selectionRange!.start].startTime}`,
                "YYYY-MM-DD HH:mm:ss",
                timeZoneId
            );
            const slotsUtc = Array.from({ length: selectedCellCount }, (_, i) =>
                startMoment.clone().add(i * cellMin, "minutes").utc().toISOString()
            );

            const body: CreateBookingRequest = {
                type,
                slots: slotsUtc,
                courtsToOccupy,
                capacity: capacity !== "" ? capacity : undefined,
                description: description || undefined,
            };
            return api.createBooking(clubId, body);
        },
        onSuccess: () => {
            toast.success(t("toast.created"));
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
            queryClient.invalidateQueries({ queryKey: ["club-slots", clubId, date] });
            onClose();
        },
        onError: (err: Error) => {
            toast.error(t("toast.createFailed"), { description: err.message });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!clubId) { toast.error(t("toast.selectClub")); return; }
        if (!date) { toast.error(t("toast.selectDate")); return; }
        if (!selectionRange) { toast.error(t("toast.selectSlot")); return; }
        if (!meetsMinDuration) { toast.error(t("toast.minimumDuration", { min: minMin })); return; }
        mutation.mutate();
    };

    const todayMoment = moment();
    const today = todayMoment.format("YYYY-MM-DD");
    const DAY_INITIALS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const visibleDays = (() => {
        const start = todayMoment.clone().subtract(3, "days");
        if (dateViewMode === "week") {
            const weekEnd = todayMoment.clone().endOf("isoWeek");
            const days: moment.Moment[] = [];
            for (let d = start.clone(); d.isSameOrBefore(weekEnd, "day"); d.add(1, "day")) {
                days.push(d.clone());
            }
            return days;
        }
        const monthEnd = todayMoment.clone().endOf("month");
        const days: moment.Moment[] = [];
        for (let d = start.clone(); d.isSameOrBefore(monthEnd, "day"); d.add(1, "day")) {
            days.push(d.clone());
        }
        return days;
    })();

    return (
        <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-[#424242]/20 bg-[#82B1FF]/5 p-5">
            <h3 className="text-sm font-semibold text-foreground">{t("form.title")}</h3>

            {/* Club search + carousel */}
            <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">{t("form.club")} *</label>
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder={t("form.searchClubs")}
                        value={clubSearch}
                        onChange={(e) => setClubSearch(e.target.value)}
                        className={inputCls("pl-8")}
                    />
                </div>
                {loadingClubs ? (
                    <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        {t("form.loadingClubs")}
                    </div>
                ) : filteredClubs.length === 0 ? (
                    <p className="rounded-md border border-dashed border-border py-3 text-center text-xs text-muted-foreground">
                        {t("form.noClubsFound")}
                    </p>
                ) : (
                    <div className="flex gap-3 overflow-x-auto pb-1">
                        {filteredClubs.map((c) => {
                            const isSelected = clubId === c.clubId;
                            const stars = c.rating ?? 0;
                            return (
                                <button
                                    key={c.clubId}
                                    type="button"
                                    onClick={() => setClubId(c.clubId)}
                                    className={[
                                        "relative flex h-28 w-40 shrink-0 cursor-pointer flex-col justify-end overflow-hidden rounded-xl border-2 p-2.5 text-left transition-all",
                                        isSelected
                                            ? "border-[#424242] ring-2 ring-[#82B1FF]/40"
                                            : "border-transparent hover:border-[#424242]/50",
                                    ].join(" ")}
                                >
                                    {c.imageUrl ? (
                                        <img src={c.imageUrl} alt={c.name} className="absolute inset-0 h-full w-full object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 bg-linear-to-br from-[#82B1FF]/60 to-[#82B1FF]/20" />
                                    )}
                                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                                    <div className="relative space-y-0.5">
                                        <p className="truncate text-xs font-semibold text-white">{c.name}</p>
                                        <div className="flex items-center justify-between gap-2">
                                            {c.courtsCount !== undefined && (
                                                <span className="text-[10px] text-white/80">{c.courtsCount} {t("form.courts")}</span>
                                            )}
                                            {stars > 0 && (
                                                <span className="flex items-center gap-0.5">
                                                    {Array.from({ length: 5 }, (_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={[
                                                                "h-2.5 w-2.5",
                                                                i < Math.round(stars)
                                                                    ? "fill-yellow-400 text-yellow-400"
                                                                    : "text-white/40",
                                                            ].join(" ")}
                                                        />
                                                    ))}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {!!clubId && (
                <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">{t("form.type")} *</label>
                    <div className="grid grid-cols-2 gap-3">
                        {(["Game", "DayUse"] as BookingType[]).map((tp) => {
                            const isSelected = type === tp;
                            const label = tp === "Game" ? t("form.gameLabel") : t("form.dayUseLabel");
                            const description = tp === "Game" ? t("form.gameDescription") : t("form.dayUseDescription");
                            return (
                                <button
                                    key={tp}
                                    type="button"
                                    onClick={() => setType(tp)}
                                    className={[
                                        "flex flex-col items-start cursor-pointer rounded-xl border-2 px-4 py-3 text-left transition-all",
                                        isSelected
                                            ? "border-[#424242] bg-[#82B1FF]/10 ring-2 ring-[#82B1FF]/30"
                                            : "border-border bg-background hover:border-[#424242]/50 hover:bg-[#82B1FF]/5",
                                    ].join(" ")}
                                >
                                    <span className={["text-sm font-semibold", isSelected ? "text-[#82B1FF]" : "text-foreground"].join(" ")}>
                                        {label}
                                    </span>
                                    <span className="mt-0.5 text-[10px] text-muted-foreground">{description}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Courts to occupy + Capacity (DayUse only) */}
            {!!clubId && type === "DayUse" && (
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">{t("form.courtsToOccupy")} *</label>
                        <input
                            name="courtsToOccupy"
                            type="number"
                            min={1}
                            max={maxCourts > 0 ? maxCourts : 1}
                            value={courtsToOccupy}
                            onChange={(e) => {
                                const v = Math.max(1, Number(e.target.value));
                                setCourtsToOccupy(v);
                            }}
                            className={inputCls()}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">{t("form.capacity")}</label>
                        <input
                            name="capacity"
                            type="number"
                            min={1}
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value === "" ? "" : Number(e.target.value))}
                            placeholder={t("form.capacityOptional")}
                            className={inputCls()}
                        />
                    </div>
                </div>
            )}

            {!!clubId && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-muted-foreground">{t("form.date")} *</label>
                        <div className="flex overflow-hidden rounded-md border border-border text-xs">
                            <button
                                type="button"
                                onClick={() => setDateViewMode("week")}
                                className={[
                                    "cursor-pointer px-3 py-1 transition-colors",
                                    dateViewMode === "week"
                                        ? "bg-[#82B1FF] text-white"
                                        : "bg-background text-foreground hover:bg-muted",
                                ].join(" ")}
                            >
                                {t("form.week")}
                            </button>
                            <button
                                type="button"
                                onClick={() => setDateViewMode("month")}
                                className={[
                                    "cursor-pointer px-3 py-1 transition-colors",
                                    dateViewMode === "month"
                                        ? "bg-[#82B1FF] text-white"
                                        : "bg-background text-foreground hover:bg-muted",
                                ].join(" ")}
                            >
                                {t("form.month")}
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] justify-items-center gap-2">
                        {visibleDays.map((d) => {
                            const val = d.format("YYYY-MM-DD");
                            const isPast = d.isBefore(todayMoment, "day");
                            const isSelected = date === val;
                            return (
                                <button
                                    key={val}
                                    type="button"
                                    disabled={isPast}
                                    onClick={() => setDate(val)}
                                    className={[
                                        "flex shrink-0 flex-col items-center rounded-md border px-2 py-1.5 text-xs font-medium transition-colors",
                                        isPast
                                            ? "cursor-not-allowed border-border bg-muted/40 text-muted-foreground opacity-40"
                                            : isSelected
                                                ? "cursor-pointer border-[#424242] bg-[#82B1FF] text-white"
                                                : "cursor-pointer border-border bg-background text-foreground hover:border-[#424242]/60 hover:bg-[#82B1FF]/5",
                                    ].join(" ")}
                                >
                                    <span className="text-[10px] leading-none opacity-70">{DAY_INITIALS[d.day()]}</span>
                                    <span className="mt-0.5 leading-none">{d.date()}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Slot picker */}
            {clubId && date && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-muted-foreground">
                            Available time slots *
                        </label>
                        {timeZoneId && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {tzBadge}
                            </span>
                        )}
                    </div>

                    {loadingSlots || fetchingSlots ? (
                        <div className="flex items-center gap-2 py-4 text-xs text-muted-foreground">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            {t("form.loadingSlots")}
                        </div>
                    ) : slots.length === 0 ? (
                        <p className="rounded-md border border-dashed border-border py-4 text-center text-xs text-muted-foreground">
                            {t("form.noSlotsAvailable")}
                        </p>
                    ) : (
                        <>
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(6rem,1fr))] justify-items-center gap-2">
                                {slots.map((slot, index) => {
                                    const available = isSlotAvailable(index);
                                    const past = !available && isSlotPast(index);
                                    const occupied = !available && !past;
                                    const isSelected = !!selectionRange && index >= selectionRange.start && index <= selectionRange.end;
                                    return (
                                        <button
                                            key={slot.startTime}
                                            type="button"
                                            disabled={!available}
                                            onClick={() => handleSlotClick(index)}
                                            className={[
                                                "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                                                available
                                                    ? isSelected
                                                        ? "cursor-pointer border-[#424242] bg-[#82B1FF] text-white"
                                                        : "cursor-pointer border-border bg-background text-foreground hover:border-[#424242]/60 hover:bg-[#82B1FF]/5"
                                                    : occupied
                                                        ? "cursor-not-allowed border-red-500/30 bg-red-500/10 text-red-400"
                                                        : "cursor-not-allowed border-border bg-muted/40 text-muted-foreground opacity-40",
                                            ].join(" ")}
                                        >
                                            {formatSlotTime(slot.startTime)}&nbsp;–&nbsp;{formatSlotTime(slot.endTime)}
                                            {available && !isSelected && (
                                                <span className="ml-1 text-muted-foreground">({slot.availableCourts})</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                            {selectionRange && (
                                <div className="mt-2 flex items-center gap-2 rounded-md border border-[#424242]/20 bg-[#82B1FF]/10 px-3 py-2 text-xs">
                                    <Clock className="h-3.5 w-3.5 text-[#82B1FF]" />
                                    <span className="font-medium text-foreground">
                                        {formatSlotTime(slots[selectionRange.start].startTime)}&nbsp;–&nbsp;{formatSlotTime(slots[selectionRange.end].endTime)}
                                        &nbsp;&middot;&nbsp;{selectedCellCount * cellMin} min
                                    </span>
                                    {!meetsMinDuration && (
                                        <span className="text-destructive">{t("form.minimumDuration", { min: minMin })}</span>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {!!clubId && (
                <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">
                        {t("form.description")}
                        <span className="ml-1 text-muted-foreground/60">({t("form.capacityOptional")})</span>
                    </label>
                    <RichTextEditor
                        onChange={setDescription}
                        placeholder={t("form.descriptionPlaceholder")}
                    />
                </div>
            )}

            <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={mutation.isPending}>
                    <X className="h-3.5 w-3.5" />
                    {t("form.cancel")}
                </Button>
                <Button
                    type="submit"
                    size="sm"
                    disabled={mutation.isPending || !selectionRange || !meetsMinDuration}
                    className="bg-[#82B1FF] text-white hover:bg-[#82B1FF]/90"
                >
                    <Check className="h-3.5 w-3.5" />
                    {mutation.isPending ? t("form.creating") : t("form.create")}
                </Button>
            </div>
        </form>
    );
}

