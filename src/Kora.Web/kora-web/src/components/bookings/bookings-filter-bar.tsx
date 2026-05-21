"use client";

import { useTranslations } from "next-intl";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";
import type { BookingsFilter, BookingType } from "@/lib/types";

interface BookingsFilterBarProps {
    filters: BookingsFilter;
    onChange: (filters: BookingsFilter) => void;
}

export function BookingsFilterBar({ filters, onChange }: BookingsFilterBarProps) {
    const t = useTranslations("bookings.filter");

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

    return (
        <div className="flex flex-wrap items-center gap-4">
            {/* Type filter */}
            <div className="flex items-center gap-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t("type")}
                </Label>
                <ToggleGroup
                    value={[filters.type ?? "all"]}
                    onValueChange={handleTypeChange}
                    className="h-8 rounded-md border border-border bg-background p-0.5"
                >
                    <ToggleGroupItem value="all" className="h-6 rounded px-2.5 text-xs data-[state=on]:bg-foreground/10 data-[state=on]:text-foreground">
                        {t("allTypes")}
                    </ToggleGroupItem>
                    <ToggleGroupItem value="Game" className="h-6 rounded px-2.5 text-xs data-[state=on]:bg-[#3D46FB]/20 data-[state=on]:text-[#818cf8]">
                        {t("game")}
                    </ToggleGroupItem>
                    <ToggleGroupItem value="DayUse" className="h-6 rounded px-2.5 text-xs data-[state=on]:bg-emerald-500/20 data-[state=on]:text-emerald-400">
                        {t("dayUse")}
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>

            {/* Open spots toggle */}
            <div className="flex items-center gap-2">
                <Switch
                    id="open-spots"
                    checked={!!filters.open}
                    onCheckedChange={handleOpenChange}
                    className="data-[state=checked]:bg-[#3D46FB]"
                />
                <Label
                    htmlFor="open-spots"
                    className="cursor-pointer text-sm text-muted-foreground"
                >
                    {t("openSpotsOnly")}
                </Label>
            </div>
        </div>
    );
}
