"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { X, Check, Clock, Loader2, Search, Star, Sunrise, Sun, Moon } from "lucide-react";
import moment from "moment-timezone";
import { createApiClient } from "@/lib/api";
import { MANAGEMENT_ROLES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { AvatarSlot } from "@/components/players/avatar-slot";
import { PlayerSelectorDialog } from "@/components/players/player-selector-dialog";
import type { TeamSlot } from "@/components/players/types";
import { PERIOD_KEYS, type PeriodKey, bucketSlotPeriod } from "@/lib/booking-filter-slots";
import type {
    BookingType,
    CreateBookingRequest,
    BookingParticipantRequest,
    BookingGuestRequest,
    BookingTeam,
} from "@/lib/types";

const PERIOD_ICONS: Record<PeriodKey, typeof Sunrise> = { manha: Sunrise, tarde: Sun, noite: Moon };
const PERIOD_LABEL_KEYS: Record<PeriodKey, string> = {
    manha: "filter.periods.morning",
    tarde: "filter.periods.afternoon",
    noite: "filter.periods.evening",
};

function inputCls(extra?: string) {
    return `w-full rounded-xl border-[1.5px] border-border bg-background px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#8CC63F] ${extra ?? ""}`;
}

function FieldLabel({
    children,
    required,
    action,
}: {
    children: React.ReactNode;
    required?: boolean;
    action?: React.ReactNode;
}) {
    return (
        <div className="mb-3 flex items-center justify-between">
            <label className="flex items-center gap-1 text-sm font-bold text-foreground">
                {children}
                {required && <span className="text-[#8CC63F]">*</span>}
            </label>
            {action}
        </div>
    );
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
    const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey | null>(null);
    const [courtsToOccupy, setCourtsToOccupy] = useState<number>(1);
    const [capacity, setCapacity] = useState<number | "">(10);
    const [description, setDescription] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);
    const [teamSlots, setTeamSlots] = useState<[TeamSlot, TeamSlot, TeamSlot, TeamSlot]>([null, null, null, null]);
    const [selectorOpen, setSelectorOpen] = useState(false);
    const [editingSlotIndex, setEditingSlotIndex] = useState<number | null>(null);

    const hasRealPlayer = teamSlots.some((s) => !!s?.userId);

    function handleSlotAvatarClick(index: number) {
        setEditingSlotIndex(index);
        setSelectorOpen(true);
    }

    function handleSlotPlayerSelect({ name, email, userId }: { name: string; email: string; userId?: string }) {
        if (editingSlotIndex === null) return;
        setTeamSlots((prev) => {
            const next = [...prev] as [TeamSlot, TeamSlot, TeamSlot, TeamSlot];
            next[editingSlotIndex] = { name, email, userId };
            return next;
        });
        setSelectorOpen(false);
        setEditingSlotIndex(null);
    }

    // Reset slot selection when club or date changes
    useEffect(() => { setSelectionRange(null); setSelectedPeriod(null); }, [clubId, date]);

    const { data: clubsData, isLoading: loadingClubs } = useQuery({
        queryKey: ["my-clubs"],
        queryFn: () => api.getMyClubs(),
    });

    const clubs = clubsData?.clubs ?? [];
    const filteredClubs = clubSearch.trim()
        ? clubs.filter((c) => c.name.toLowerCase().includes(clubSearch.trim().toLowerCase()))
        : clubs;

    const selectedClubRole = clubs.find((c) => c.clubId === clubId)?.role ?? "";
    const canCreateDayUse = MANAGEMENT_ROLES.includes(selectedClubRole);
    const availableTypes: BookingType[] = canCreateDayUse ? ["Game", "DayUse"] : ["Game"];

    // Reset to Game if selected club doesn't allow Day Use
    useEffect(() => {
        if (!canCreateDayUse && type === "DayUse") setType("Game");
    }, [canCreateDayUse, type]);

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

    // Default to "tarde" the first time a day's slots load, mirroring the reference design.
    useEffect(() => {
        if (slotsData && selectedPeriod === null) setSelectedPeriod("tarde");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slotsData]);

    const periodSlots = slots
        .map((slot, index) => ({ slot, index }))
        .filter(({ slot }) => !selectedPeriod || bucketSlotPeriod(slot.startTime) === selectedPeriod);

    const selectedCellCount = selectionRange ? selectionRange.end - selectionRange.start + 1 : 0;
    const meetsMinDuration = selectedCellCount * cellMin >= minMin;

    function isSlotPast(index: number): boolean {
        const cell = slots[index];
        if (!cell || !date) return false;
        const nowInClubTz = moment.tz(timeZoneId);
        if (date !== nowInClubTz.format("YYYY-MM-DD")) return false;
        const slotStart = moment.parseZone(cell.startTime);
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

    function formatSlotTime(isoString: string) {
        return moment.parseZone(isoString).format("HH:mm");
    }

    const mutation = useMutation({
        mutationFn: () => {
            const startMoment = moment.parseZone(slots[selectionRange!.start].startTime);
            const slotTimes = Array.from({ length: selectedCellCount }, (_, i) =>
                startMoment.clone().add(i * cellMin, "minutes").format()
            );

            const showTeamSlots = isPrivate && type === "Game";
            const participants: BookingParticipantRequest[] = [];
            const guests: BookingGuestRequest[] = [];
            if (showTeamSlots) {
                teamSlots.forEach((slot, i) => {
                    if (!slot) return;
                    const team: BookingTeam = i < 2 ? "TeamA" : "TeamB";
                    const positionInTeam = (i % 2) + 1;
                    if (slot.userId) {
                        participants.push({ userId: slot.userId, team, positionInTeam });
                    } else {
                        guests.push({ name: slot.name, email: slot.email || undefined, team, positionInTeam });
                    }
                });
            }

            const body: CreateBookingRequest = {
                type,
                slots: slotTimes,
                courtsToOccupy,
                capacity: capacity !== "" ? capacity : undefined,
                description: description || undefined,
                isPrivate,
                participants: participants.length > 0 ? participants : undefined,
                guests: guests.length > 0 ? guests : undefined,
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
        if (isPrivate && type === "Game" && !hasRealPlayer) {
            toast.error(t("form.privatePlayerRequired"));
            return;
        }
        mutation.mutate();
    };

    const todayMoment = moment();
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
        <form onSubmit={handleSubmit}>
            {/* Club search + carousel */}
            <div className="mb-7.5">
                <FieldLabel required>{t("form.club")}</FieldLabel>
                <div className="relative mb-4">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4.25 w-4.25 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder={t("form.searchClubs")}
                        value={clubSearch}
                        onChange={(e) => setClubSearch(e.target.value)}
                        className={inputCls("pl-10")}
                    />
                </div>
                {loadingClubs ? (
                    <div className="flex gap-3.5 overflow-x-auto pb-1">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-28 w-45 shrink-0 animate-pulse rounded-[20px] bg-muted" />
                        ))}
                    </div>
                ) : filteredClubs.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-border py-3 text-center text-xs text-muted-foreground">
                        {t("form.noClubsFound")}
                    </p>
                ) : (
                    <div className="flex gap-3.5 overflow-x-auto pb-1">
                        {filteredClubs.map((c) => {
                            const isSelected = clubId === c.clubId;
                            const stars = c.rating ?? 0;
                            return (
                                <button
                                    key={c.clubId}
                                    type="button"
                                    onClick={() => setClubId(c.clubId)}
                                    className={[
                                        "relative flex h-28 w-45 shrink-0 cursor-pointer flex-col justify-between rounded-[20px] border-[1.5px] p-4 text-left transition-all",
                                        isSelected ? "border-[#8CC63F] bg-[#8CC63F]/5" : "border-[#1E2F40] bg-card hover:border-[#2A3B4C]",
                                    ].join(" ")}
                                >
                                    {isSelected && (
                                        <div className="absolute top-3 right-3 flex h-5.5 w-5.5 items-center justify-center rounded-full bg-[#8CC63F]">
                                            <Check className="h-3 w-3 text-[#0D1B2A]" strokeWidth={3} />
                                        </div>
                                    )}
                                    <div className="min-w-0 pr-6">
                                        <p className="truncate text-[15px] font-bold text-foreground">{c.name}</p>
                                        {c.courtsCount !== undefined && (
                                            <p className="mt-1 text-[11px] text-muted-foreground">{c.courtsCount} {t("form.courts")}</p>
                                        )}
                                    </div>
                                    {stars > 0 && (
                                        <span className="flex items-center gap-0.5">
                                            {Array.from({ length: 5 }, (_, i) => (
                                                <Star
                                                    key={i}
                                                    className={[
                                                        "h-2.5 w-2.5",
                                                        i < Math.round(stars)
                                                            ? "fill-yellow-400 text-yellow-400"
                                                            : "text-muted-foreground/30",
                                                    ].join(" ")}
                                                />
                                            ))}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {!!clubId && (
                <div className="mb-7.5">
                    <FieldLabel required>{t("form.type")}</FieldLabel>
                    <div className={["grid gap-3.5", availableTypes.length > 1 ? "grid-cols-2" : "grid-cols-1"].join(" ")}>
                        {availableTypes.map((tp) => {
                            const isSelected = type === tp;
                            const label = tp === "Game" ? t("form.gameLabel") : t("form.dayUseLabel");
                            const description = tp === "Game" ? t("form.gameDescription") : t("form.dayUseDescription");
                            return (
                                <button
                                    key={tp}
                                    type="button"
                                    onClick={() => setType(tp)}
                                    className={[
                                        "flex cursor-pointer flex-col items-start rounded-[14px] border-2 p-4.5 text-left transition-all",
                                        isSelected
                                            ? "border-[#8CC63F] bg-[#8CC63F]/6"
                                            : "border-border bg-background hover:border-[#8CC63F]/40 hover:bg-[#8CC63F]/5",
                                    ].join(" ")}
                                >
                                    <span className={["text-base font-extrabold", isSelected ? "text-[#8CC63F]" : "text-foreground"].join(" ")}>
                                        {label}
                                    </span>
                                    <span className="mt-1.5 text-[12.5px] leading-snug text-muted-foreground">{description}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Courts to occupy + Capacity (DayUse only) */}
            {!!clubId && type === "DayUse" && (
                <div className="mb-7.5 grid gap-4 sm:grid-cols-2">
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
                <div className="mb-7.5">
                    <FieldLabel
                        required
                        action={
                            <div className="flex gap-0.5 rounded-full bg-background p-0.75">
                                <button
                                    type="button"
                                    onClick={() => setDateViewMode("week")}
                                    className={[
                                        "cursor-pointer rounded-full px-3.5 py-1.5 text-[12.5px] font-bold transition-colors",
                                        dateViewMode === "week"
                                            ? "bg-[#8CC63F] text-[#0D1B2A]"
                                            : "text-muted-foreground hover:text-foreground",
                                    ].join(" ")}
                                >
                                    {t("form.week")}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDateViewMode("month")}
                                    className={[
                                        "cursor-pointer rounded-full px-3.5 py-1.5 text-[12.5px] font-bold transition-colors",
                                        dateViewMode === "month"
                                            ? "bg-[#8CC63F] text-[#0D1B2A]"
                                            : "text-muted-foreground hover:text-foreground",
                                    ].join(" ")}
                                >
                                    {t("form.month")}
                                </button>
                            </div>
                        }
                    >
                        {t("form.date")}
                    </FieldLabel>
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
                                        "flex min-w-14.5 shrink-0 flex-col items-center gap-0.5 rounded-xl border-[1.5px] px-1 pt-2.5 pb-3 text-xs font-medium transition-colors",
                                        isPast
                                            ? "cursor-not-allowed border-border bg-muted/40 text-muted-foreground opacity-40"
                                            : isSelected
                                                ? "cursor-pointer border-transparent bg-[#8CC63F] text-[#0D1B2A]"
                                                : "cursor-pointer border-border bg-background text-foreground hover:border-[#8CC63F]/40 hover:bg-[#8CC63F]/5",
                                    ].join(" ")}
                                >
                                    <span className="text-[10.5px] leading-none font-bold uppercase opacity-70">{DAY_INITIALS[d.day()]}</span>
                                    <span className="mt-1 text-base leading-none font-extrabold">{d.date()}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Período + horário */}
            {clubId && date && (
                <div className="mb-7.5">
                    <FieldLabel required>{t("filter.period")}</FieldLabel>

                    {loadingSlots || fetchingSlots ? (
                        <div className="flex items-center gap-2 py-4 text-xs text-muted-foreground">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            {t("form.loadingSlots")}
                        </div>
                    ) : slots.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-border py-4 text-center text-xs text-muted-foreground">
                            {t("form.noSlotsAvailable")}
                        </p>
                    ) : (
                        <>
                            <div className="grid grid-cols-3 gap-2.5">
                                {PERIOD_KEYS.map((key) => {
                                    const Icon = PERIOD_ICONS[key];
                                    const isSelected = selectedPeriod === key;
                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => {
                                                setSelectedPeriod(key);
                                                setSelectionRange(null);
                                            }}
                                            className={[
                                                "flex cursor-pointer flex-col items-center gap-2 rounded-xl border-[1.5px] px-1.5 pt-4 pb-3 transition-colors",
                                                isSelected
                                                    ? "border-[#8CC63F] bg-[#8CC63F]/8"
                                                    : "border-border hover:border-[#8CC63F]/40",
                                            ].join(" ")}
                                        >
                                            <Icon className={["h-5.5 w-5.5", isSelected ? "text-[#8CC63F]" : "text-muted-foreground"].join(" ")} />
                                            <span className={["text-[12.5px] font-bold", isSelected ? "text-[#8CC63F]" : "text-muted-foreground"].join(" ")}>
                                                {t(PERIOD_LABEL_KEYS[key])}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="my-3.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Clock className="h-3.25 w-3.25" />
                                {tzBadge}
                            </div>

                            {periodSlots.length === 0 ? (
                                <p className="rounded-xl border border-dashed border-border py-4 text-center text-xs text-muted-foreground">
                                    {t("form.noSlotsForPeriod")}
                                </p>
                            ) : (
                                <div className="grid grid-cols-3 gap-2.5">
                                    {periodSlots.map(({ slot, index }) => {
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
                                                    "rounded-xl border-[1.5px] px-1.5 py-3 text-center text-[13px] font-bold transition-colors",
                                                    available
                                                        ? isSelected
                                                            ? "cursor-pointer border-[#8CC63F] bg-[#8CC63F] text-[#0D1B2A]"
                                                            : "cursor-pointer border-border bg-background text-foreground hover:border-[#8CC63F]/40 hover:bg-[#8CC63F]/5"
                                                        : occupied
                                                            ? "cursor-not-allowed border-[#FBE4E4] bg-[#FBE4E4] text-[#E5484D]"
                                                            : "cursor-not-allowed border-border bg-muted/40 text-muted-foreground opacity-40",
                                                ].join(" ")}
                                            >
                                                {formatSlotTime(slot.startTime)}&nbsp;–&nbsp;{formatSlotTime(slot.endTime)}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {selectionRange && (
                                <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#8CC63F]/25 bg-[#8CC63F]/8 px-3 py-2.5 text-xs">
                                    <Clock className="h-3.5 w-3.5 text-[#8CC63F]" />
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
                <div className="mb-7.5">
                    <label className="mb-3 flex items-center gap-1 text-sm font-bold text-foreground">
                        {t("form.description")}
                        <span className="font-medium text-muted-foreground">({t("form.capacityOptional")})</span>
                    </label>
                    <RichTextEditor
                        onChange={setDescription}
                        placeholder={t("form.descriptionPlaceholder")}
                    />
                </div>
            )}

            {!!clubId && (
                <div className="mb-7.5 flex items-center justify-between gap-4 rounded-[14px] border-[1.5px] border-border p-4.5">
                    <div className="space-y-1">
                        <Label htmlFor="is-private" className="cursor-pointer text-[14.5px] font-bold text-foreground">
                            {t("form.isPrivate")}
                        </Label>
                        <p className="text-[12.5px] leading-snug text-muted-foreground">{t("form.isPrivateDescription")}</p>
                    </div>
                    <Switch
                        id="is-private"
                        checked={isPrivate}
                        onCheckedChange={setIsPrivate}
                        className="cursor-pointer data-checked:bg-[#8CC63F]"
                    />
                </div>
            )}

            {!!clubId && isPrivate && type === "Game" && (
                <div className="mb-7.5 space-y-2 rounded-[14px] border-[1.5px] border-border p-4.5">
                    <div>
                        <label className="text-xs font-medium text-muted-foreground">{t("form.selectPlayers")}</label>
                        <p className="text-xs text-muted-foreground/70">{t("form.selectPlayersDescription")}</p>
                    </div>
                    <div className="flex items-center justify-around gap-2 pt-1">
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t("form.teamA")}</span>
                            <div className="flex gap-3">
                                {([0, 1] as const).map((i) => (
                                    <AvatarSlot
                                        key={i}
                                        slot={teamSlots[i]}
                                        onClick={() => handleSlotAvatarClick(i)}
                                        addLabel={t("form.addPlayer")}
                                    />
                                ))}
                            </div>
                        </div>
                        <span className="text-xs font-bold text-muted-foreground/60">VS</span>
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t("form.teamB")}</span>
                            <div className="flex gap-3">
                                {([2, 3] as const).map((i) => (
                                    <AvatarSlot
                                        key={i}
                                        slot={teamSlots[i]}
                                        onClick={() => handleSlotAvatarClick(i)}
                                        addLabel={t("form.addPlayer")}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    {!hasRealPlayer && (
                        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                            {t("form.privatePlayerRequired")}
                        </p>
                    )}
                </div>
            )}

            <PlayerSelectorDialog
                open={selectorOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectorOpen(false);
                        setEditingSlotIndex(null);
                    }
                }}
                onSelect={handleSlotPlayerSelect}
                titleLabel={t("form.selectPlayer")}
                searchLabel={t("form.searchPlayers")}
                guestLabel={t("form.guest")}
            />

            <div className="mt-2 flex items-center justify-end gap-3.5">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    disabled={mutation.isPending}
                    className="text-[14.5px] font-bold text-muted-foreground"
                >
                    <X className="h-3.5 w-3.5" />
                    {t("form.cancel")}
                </Button>
                <Button
                    type="submit"
                    disabled={
                        mutation.isPending ||
                        !selectionRange ||
                        !meetsMinDuration ||
                        (isPrivate && type === "Game" && !hasRealPlayer)
                    }
                    className="rounded-full bg-[#8CC63F] px-6 text-[14.5px] font-extrabold text-[#0D1B2A] hover:bg-[#7AB534]"
                >
                    <Check className="h-3.5 w-3.5" />
                    {mutation.isPending ? t("form.creating") : t("form.create")}
                </Button>
            </div>
        </form>
    );
}

