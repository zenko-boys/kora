"use client";

import { useTranslations } from "next-intl";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { BookingsFilter, BookingType } from "@/lib/types";

interface BookingsFilterBarProps {
    filters: BookingsFilter;
    onChange: (filters: BookingsFilter) => void;
}

export function BookingsFilterBar({ filters, onChange }: BookingsFilterBarProps) {
    const t = useTranslations("bookings.filter");
    const handleTypeChange = (value: string | null) => {
        if (!value) return;
        onChange({
            ...filters,
            type: value === "all" ? undefined : (value as BookingType),
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
                <Select value={filters.type ?? "all"} onValueChange={handleTypeChange}>
                    <SelectTrigger className="h-8 w-32 text-sm">
                        <SelectValue placeholder={t("allTypes")} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t("allTypes")}</SelectItem>
                        <SelectItem value="Game">{t("game")}</SelectItem>
                        <SelectItem value="DayUse">{t("dayUse")}</SelectItem>
                    </SelectContent>
                </Select>
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
