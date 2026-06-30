"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { Locale } from "date-fns";
import type { ScheduleBookingInfo, ScheduleSlot } from "@/lib/types";
import type { SlotKey } from "./types";
import { BookingDetailPanel } from "./BookingDetailPanel";

export interface ViewingBooking {
  booking: ScheduleBookingInfo;
  courtId: string;
  courtName: string;
  startSlot: ScheduleSlot;
  endSlot: ScheduleSlot;
  slotKeys: SlotKey[];
}

const SCROLL_STEP = 180;
// Approximate header height of this panel (title row), subtracted from
// maxHeight so the inner scroll area matches the calendar column exactly.
const HEADER_HEIGHT = 41;

export function SelectedGamesPanel({
  bookings,
  dateLocale,
  onCloseBooking,
  titleLabel,
  maxHeight,
}: {
  bookings: ViewingBooking[];
  dateLocale: Locale;
  onCloseBooking: (bookingId: string) => void;
  titleLabel: string;
  /** Measured height (px) of the sibling calendar column; the scroll area is capped to match it. */
  maxHeight?: number;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollUp(el.scrollTop > 4);
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
  }, [bookings.length, updateScrollState]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateScrollState]);

  function scrollBy(amount: number) {
    scrollRef.current?.scrollBy({ top: amount, behavior: "smooth" });
  }

  return (
    <div className="flex w-80 shrink-0 flex-col border-l border-slate-200">
      <div className="shrink-0 border-b border-slate-200 px-4 py-2.5">
        <p className="text-sm font-semibold text-slate-700">
          {titleLabel} ({bookings.length})
        </p>
      </div>

      <div
        className="relative"
        style={{ height: maxHeight !== undefined ? maxHeight - HEADER_HEIGHT : undefined }}
      >
        {canScrollUp && (
          <button
            type="button"
            onClick={() => scrollBy(-SCROLL_STEP)}
            className="absolute left-0 right-0 top-0 z-10 flex h-7 items-center justify-center bg-gradient-to-b from-white via-white/90 to-transparent transition-opacity hover:opacity-80"
          >
            <ChevronUp className="h-4 w-4 text-slate-400" />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="h-full space-y-3 overflow-y-auto p-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {bookings.map((vb) => (
            <div
              key={vb.booking.bookingId}
              className="rounded-lg border border-slate-200"
            >
              <BookingDetailPanel
                booking={vb.booking}
                courtName={vb.courtName}
                startSlot={vb.startSlot}
                endSlot={vb.endSlot}
                locale={dateLocale}
                onClose={() => onCloseBooking(vb.booking.bookingId)}
                standalone={false}
                showCloseButton
              />
            </div>
          ))}
        </div>

        {canScrollDown && (
          <button
            type="button"
            onClick={() => scrollBy(SCROLL_STEP)}
            className="absolute bottom-0 left-0 right-0 z-10 flex h-7 items-center justify-center bg-gradient-to-t from-white via-white/90 to-transparent transition-opacity hover:opacity-80"
          >
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>
        )}
      </div>
    </div>
  );
}
