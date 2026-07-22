"use client";

import { useRef } from "react";
import { addDays, format, startOfToday } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDateLocale } from "@/lib/useDateLocale";

const VISIBLE_DAYS = 14;

interface DayPickerRowProps {
    selectedDay: string | null; // YYYY-MM-DD, null when nothing has been picked yet
    onSelect: (day: string) => void;
}

export function DayPickerRow({ selectedDay, onSelect }: DayPickerRowProps) {
    const locale = useDateLocale();
    const trackRef = useRef<HTMLDivElement>(null);
    const today = startOfToday();

    const days = Array.from({ length: VISIBLE_DAYS }, (_, i) => {
        const date = addDays(today, i);
        return { value: format(date, "yyyy-MM-dd"), date };
    });

    function scroll(delta: number) {
        trackRef.current?.scrollBy({ left: delta, behavior: "smooth" });
    }

    return (
        <div className="flex items-center gap-1.5">
            <button
                type="button"
                onClick={() => scroll(-120)}
                className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-[#8CC63F] hover:text-[#8CC63F]"
                aria-label="Previous days"
            >
                <ChevronLeft className="h-2.5 w-2.5" />
            </button>

            <div
                ref={trackRef}
                className="flex gap-2 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {days.map(({ value, date }) => {
                    const isSelected = value === selectedDay;
                    return (
                        <button
                            key={value}
                            type="button"
                            onClick={() => onSelect(value)}
                            className={[
                                "flex min-w-[54px] shrink-0 cursor-pointer flex-col items-center gap-0.5 rounded-xl border-[1.5px] px-1 pt-2 pb-2.5 transition-colors",
                                isSelected
                                    ? "border-[#8CC63F] bg-[#8CC63F]/8"
                                    : "border-border hover:border-[#8CC63F]/40",
                            ].join(" ")}
                        >
                            <span
                                className={[
                                    "text-[10.5px] font-bold uppercase tracking-[0.3px]",
                                    isSelected ? "text-[#8CC63F]" : "text-muted-foreground",
                                ].join(" ")}
                            >
                                {format(date, "EEE", { locale })}
                            </span>
                            <span
                                className={[
                                    "text-[15px] font-extrabold",
                                    isSelected ? "text-[#8CC63F]" : "text-foreground",
                                ].join(" ")}
                            >
                                {format(date, "d")}
                            </span>
                        </button>
                    );
                })}
            </div>

            <button
                type="button"
                onClick={() => scroll(120)}
                className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-[#8CC63F] hover:text-[#8CC63F]"
                aria-label="Next days"
            >
                <ChevronRight className="h-2.5 w-2.5" />
            </button>
        </div>
    );
}
