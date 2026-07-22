"use client";

import { useTranslations } from "next-intl";
import { Plus, Sunrise, Sun, Moon } from "lucide-react";
import { DayPickerRow } from "@/components/bookings/day-picker-row";
import { ClubSearchInput, type ClubSearchOption } from "@/components/clubs/club-search-input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PERIOD_KEYS, type PeriodKey, dayOnlyUtcRange, periodUtcRange } from "@/lib/booking-filter-slots";
import type { BookingsFilter, BookingType } from "@/lib/types";

const PERIOD_ICONS: Record<PeriodKey, typeof Sunrise> = { manha: Sunrise, tarde: Sun, noite: Moon };
const PERIOD_LABEL_KEYS: Record<PeriodKey, string> = {
    manha: "periods.morning",
    tarde: "periods.afternoon",
    noite: "periods.evening",
};

export interface FilterDraft {
    type: BookingType | undefined;
    open: boolean;
    clubId: string;
    selectedDay: string | null;
    selectedPeriod: PeriodKey | null;
}

export const EMPTY_FILTER_DRAFT: FilterDraft = {
    type: undefined,
    open: true,
    clubId: "",
    selectedDay: null,
    selectedPeriod: null,
};

function FieldLabel({ children }: { children: React.ReactNode }) {
    return (
        <span className="mb-2 block text-[11.5px] font-bold tracking-[0.5px] text-muted-foreground uppercase">
            {children}
        </span>
    );
}

interface BookingsFiltersColumnProps {
    tab: "myGames" | "discover";
    onTabChange: (tab: "myGames" | "discover") => void;
    draft: FilterDraft;
    onDraftChange: (draft: FilterDraft) => void;
    clubOptions: ClubSearchOption[];
    onApply: (filters: BookingsFilter) => void;
    onCreateBooking: () => void;
}

export function BookingsFiltersColumn({
    tab,
    onTabChange,
    draft,
    onDraftChange,
    clubOptions,
    onApply,
    onCreateBooking,
}: BookingsFiltersColumnProps) {
    const t = useTranslations("bookings.filter");
    const tTabs = useTranslations("bookings.tabs");
    const tBookings = useTranslations("bookings");

    const { type, open, clubId, selectedDay, selectedPeriod } = draft;

    function update(patch: Partial<FilterDraft>) {
        onDraftChange({ ...draft, ...patch });
    }

    const selectedClub = clubOptions.find((c) => c.clubId === clubId);

    const missingField = !clubId ? "club" : !selectedDay ? "day" : !selectedPeriod ? "period" : null;

    function handleApply() {
        if (missingField || !selectedDay || !selectedPeriod) return;

        const range = selectedClub?.timeZoneId
            ? periodUtcRange(selectedDay, selectedPeriod, selectedClub.timeZoneId)
            : dayOnlyUtcRange(selectedDay);

        onApply({
            type,
            open: open || undefined,
            clubId: clubId || undefined,
            fromUtc: range.fromUtc,
            toUtc: range.toUtc,
        });
    }

    return (
        <div className="flex h-full flex-col overflow-y-auto bg-card px-6 py-[30px]">
            <button
                type="button"
                onClick={onCreateBooking}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-[#8CC63F] py-3 text-sm font-extrabold text-[#0D1B2A] transition-[filter] hover:brightness-[1.06]"
            >
                <Plus className="h-4 w-4" />
                {tBookings("newBooking")}
            </button>

            <div className="my-6 flex items-center gap-3">
                <span className="shrink-0 text-[11px] font-extrabold tracking-[0.8px] text-muted-foreground uppercase">
                    {t("sectionTitle")}
                </span>
                <div className="h-px flex-1 bg-border" />
            </div>

            {/* Mode tabs: My Games / Discover — reactive, not staged behind Filtrar */}
            <div className="mb-[22px] flex items-center gap-2.5">
                <button
                    type="button"
                    onClick={() => onTabChange("myGames")}
                    className={[
                        "cursor-pointer rounded-full px-3.5 py-2 text-[13.5px] font-bold transition-colors",
                        tab === "myGames" ? "bg-[#8CC63F]/25 text-[#1F5C33] dark:text-[#8CC63F]" : "text-muted-foreground hover:text-foreground",
                    ].join(" ")}
                >
                    {tTabs("myGames")}
                </button>
                <div className="h-4 w-px bg-border" />
                <button
                    type="button"
                    onClick={() => onTabChange("discover")}
                    className={[
                        "cursor-pointer rounded-full px-3.5 py-2 text-[13.5px] font-bold transition-colors",
                        tab === "discover" ? "bg-[#8CC63F]/25 text-[#1F5C33] dark:text-[#8CC63F]" : "text-muted-foreground hover:text-foreground",
                    ].join(" ")}
                >
                    {tTabs("discover")}
                </button>
            </div>

            {/* Type segmented control */}
            <div className="mb-6 flex gap-1 rounded-xl bg-background p-1">
                {([
                    { value: undefined, label: t("allTypes") },
                    { value: "Game" as const, label: t("game") },
                    { value: "DayUse" as const, label: t("dayUse") },
                ]).map(({ value, label }) => {
                    const isSelected = type === value;
                    return (
                        <button
                            key={label}
                            type="button"
                            onClick={() => update({ type: value })}
                            className={[
                                "flex-1 cursor-pointer rounded-[9px] py-2.5 text-center text-[13px] font-bold transition-colors",
                                isSelected ? "bg-[#8CC63F] text-[#0D1B2A]" : "text-muted-foreground hover:text-foreground",
                            ].join(" ")}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>

            {/* Open spots only */}
            <div className="mb-6 flex items-center justify-between">
                <Label htmlFor="open-spots" className="cursor-pointer text-[13.5px] font-semibold text-foreground">
                    {t("openSpotsOnly")}
                </Label>
                <Switch
                    id="open-spots"
                    checked={open}
                    onCheckedChange={(checked) => update({ open: checked })}
                    className="cursor-pointer data-checked:bg-[#8CC63F]"
                />
            </div>

            {/* Club */}
            <FieldLabel>{t("club")}</FieldLabel>
            <div className="mb-7">
                <ClubSearchInput
                    clubs={clubOptions}
                    selectedClubId={clubId}
                    onSelect={(id) => update({ clubId: id })}
                    placeholder={t("clubSearchPlaceholder")}
                    allLabel={t("allClubs")}
                />
            </div>

            {/* Day */}
            <FieldLabel>{t("day")}</FieldLabel>
            <div className="mb-[26px]">
                <DayPickerRow selectedDay={selectedDay} onSelect={(day) => update({ selectedDay: day })} />
            </div>

            {/* Period — each card is itself a time range, no further slot picking needed */}
            <FieldLabel>{t("period")}</FieldLabel>
            <div className="grid grid-cols-3 gap-2.5">
                {PERIOD_KEYS.map((key) => {
                    const Icon = PERIOD_ICONS[key];
                    const isSelected = selectedPeriod === key;
                    const disabled = !clubId || !selectedDay;
                    return (
                        <button
                            key={key}
                            type="button"
                            disabled={disabled}
                            onClick={() => update({ selectedPeriod: isSelected ? null : key })}
                            className={[
                                "flex flex-col items-center gap-2 rounded-xl border-[1.5px] px-1.5 pt-3.5 pb-2.5 transition-colors",
                                disabled
                                    ? "cursor-not-allowed border-border opacity-40"
                                    : isSelected
                                        ? "cursor-pointer border-[#8CC63F] bg-[#8CC63F]/8"
                                        : "cursor-pointer border-border hover:border-[#8CC63F]/40",
                            ].join(" ")}
                        >
                            <Icon className={["h-5.5 w-5.5", isSelected && !disabled ? "text-[#8CC63F]" : "text-muted-foreground"].join(" ")} />
                            <span className={["text-xs font-bold", isSelected && !disabled ? "text-[#8CC63F]" : "text-muted-foreground"].join(" ")}>
                                {t(PERIOD_LABEL_KEYS[key])}
                            </span>
                        </button>
                    );
                })}
            </div>

            <button
                type="button"
                onClick={handleApply}
                disabled={!!missingField}
                className={[
                    "mt-6 w-full rounded-[10px] py-3 text-sm font-extrabold transition-[filter]",
                    missingField
                        ? "cursor-not-allowed bg-muted text-muted-foreground"
                        : "cursor-pointer bg-[#8CC63F] text-[#0D1B2A] hover:brightness-[1.06]",
                ].join(" ")}
            >
                {missingField === "club"
                    ? t("selectClubFirst")
                    : missingField === "day"
                        ? t("selectDayFirst")
                        : missingField === "period"
                            ? t("selectPeriodFirst")
                            : t("apply")}
            </button>
        </div>
    );
}
