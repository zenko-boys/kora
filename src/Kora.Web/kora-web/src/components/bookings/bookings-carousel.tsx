"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function BookingsCarousel({ children }: { children: React.ReactNode }) {
    const trackRef = useRef<HTMLDivElement>(null);

    function scroll(delta: number) {
        trackRef.current?.scrollBy({ left: delta, behavior: "smooth" });
    }

    return (
        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={() => scroll(-340)}
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-[#8CC63F] hover:text-[#8CC63F]"
                aria-label="Scroll left"
            >
                <ChevronLeft className="h-4 w-4" />
            </button>
            <div
                ref={trackRef}
                className="flex flex-1 gap-5 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {children}
            </div>
            <button
                type="button"
                onClick={() => scroll(340)}
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-[#8CC63F] hover:text-[#8CC63F]"
                aria-label="Scroll right"
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
}
