"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { CalendarDays, X } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { ClubSwitcher, type ClubSwitcherClub } from "@/components/clubs/club-switcher";
import { useDateLocale } from "@/lib/useDateLocale";
import type { BookingsFilter, BookingType } from "@/lib/types";

interface BookingsFilterBarProps {
    filters: BookingsFilter;
    onChange: (filters: BookingsFilter) => void;
    clubOptions?: ClubSwitcherClub[];
}

export function BookingsFilterBar({ filters, onChange, clubOptions = [] }: BookingsFilterBarProps) {
    const t = useTranslations("bookings.filter");
    const dateLocale = useDateLocale();
    const [dateRangeOpen, setDateRangeOpen] = useState(false);

    const handleTypeChange = (values: string[]) => {
        const val = values[0];
        if (!val) return; // prevent full deselection
        onChange({
            ...filters,
            type: val === "all" ? undefined : (val as BookingType),
        });
    };

    const handleOpenChange = (checked: boolean) => {
        onChange({ ...filters, open: checked || undefined });
    };

    const handleClubChange = (clubId: string) => {
        onChange({ ...filters, clubId: clubId || undefined });
    };

    const selectedRange: DateRange | undefined = filters.fromUtc
        ? { from: new Date(filters.fromUtc), to: filters.toUtc ? new Date(filters.toUtc) : undefined }
        : undefined;

    const handleRangeSelect = (range: DateRange | undefined) => {
        if (!range?.from) {
            onChange({ ...filters, fromUtc: undefined, toUtc: undefined });
            return;
        }
        const from = new Date(range.from);
        from.setHours(0, 0, 0, 0);
        const to = new Date(range.to ?? range.from);
        to.setHours(23, 59, 59, 999);
        onChange({ ...filters, fromUtc: from.toISOString(), toUtc: to.toISOString() });
        if (range.to) setDateRangeOpen(false);
    };

    const clearDateRange = () => {
        onChange({ ...filters, fromUtc: undefined, toUtc: undefined });
        setDateRangeOpen(false);
    };

    return (
        <div className="flex flex-wrap items-center gap-4">
            {/* Type filter */}
            <ToggleGroup
                value={[filters.type ?? "all"]}
                onValueChange={handleTypeChange}
                className="h-8 rounded-md border border-border bg-background p-0.5"
            >
                <ToggleGroupItem value="all" className="h-6 cursor-pointer rounded px-2.5 text-xs aria-pressed:bg-foreground/10 aria-pressed:text-foreground">
                    {t("allTypes")}
                </ToggleGroupItem>
                <ToggleGroupItem value="Game" className="h-6 cursor-pointer rounded px-2.5 text-xs aria-pressed:bg-[#8CC63F]/20 aria-pressed:text-[#8CC63F]">
                    {t("game")}
                </ToggleGroupItem>
                <ToggleGroupItem value="DayUse" className="h-6 cursor-pointer rounded px-2.5 text-xs aria-pressed:bg-[#8CC63F]/20 aria-pressed:text-[#8CC63F]">
                    {t("dayUse")}
                </ToggleGroupItem>
            </ToggleGroup>

            {/* Open spots toggle */}
            <div className="flex items-center gap-2">
                <Switch
                    id="open-spots"
                    checked={!!filters.open}
                    onCheckedChange={handleOpenChange}
                    className="cursor-pointer data-[state=checked]:bg-[#8CC63F]"
                />
                <Label
                    htmlFor="open-spots"
                    className="cursor-pointer text-sm text-muted-foreground"
                >
                    {t("openSpotsOnly")}
                </Label>
            </div>

            {/* Club filter */}
            <ClubSwitcher
                clubs={clubOptions}
                selectedClubId={filters.clubId ?? ""}
                onSelect={handleClubChange}
                placeholder={t("club")}
                allLabel={t("allClubs")}
            />

            {/* Date range filter */}
            <Popover open={dateRangeOpen} onOpenChange={setDateRangeOpen}>
                <PopoverTrigger className="flex h-7 cursor-pointer items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-xs text-foreground transition-colors hover:bg-accent">
                    <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                    {selectedRange?.from
                        ? selectedRange.to
                            ? `${format(selectedRange.from, "d MMM", { locale: dateLocale })} – ${format(selectedRange.to, "d MMM", { locale: dateLocale })}`
                            : format(selectedRange.from, "d MMM", { locale: dateLocale })
                        : t("anyDate")}
                    {selectedRange?.from && (
                        <X
                            className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground"
                            onClick={(e) => {
                                e.stopPropagation();
                                clearDateRange();
                            }}
                        />
                    )}
                </PopoverTrigger>
                <PopoverContent side="bottom" align="start" className="w-auto p-0">
                    <Calendar
                        mode="range"
                        selected={selectedRange}
                        onSelect={handleRangeSelect}
                        locale={dateLocale}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
