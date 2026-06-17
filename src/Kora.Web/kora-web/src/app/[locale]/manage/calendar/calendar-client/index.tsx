"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  format,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  isSameDay,
} from "date-fns";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { COURTS, SLOT_HEIGHT, SLOTS, START_HOUR } from "./constants";
import { timeToSlotIndex, formatSlotTime } from "./helpers";
import { NewBookingDialog } from "./NewBookingDialog";
import { TeamCardDialog } from "./TeamCardDialog";
import type { Booking, SlotKey } from "./types";

export function CalendarClient({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const t = useTranslations("manage");

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectionStart, setSelectionStart] = useState<SlotKey | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<SlotKey | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [slotHeight, setSlotHeight] = useState(SLOT_HEIGHT);

  useEffect(() => {
    const el = gridContainerRef.current;
    if (!el) return;
    const compute = () => {
      const header = el.querySelector<HTMLElement>("[data-header]");
      const headerH = header?.offsetHeight ?? 40;
      setSlotHeight(Math.max(20, Math.floor((el.clientHeight - headerH) / SLOTS)));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekLabel = `${format(weekStart, "MMM d")} – ${format(weekEnd, "d, yyyy")}`;
  const dayLabel = format(selectedDate, "EEEE, MMM d, yyyy");

  const dayBookings = useMemo<Booking[]>(() => [], []);

  const selection = useMemo<SlotKey[]>(() => {
    if (!selectionStart || !selectionEnd) return [];
    if (selectionStart.courtId !== selectionEnd.courtId) return [];
    const min = Math.min(selectionStart.slotIndex, selectionEnd.slotIndex);
    const max = Math.max(selectionStart.slotIndex, selectionEnd.slotIndex);
    return Array.from({ length: max - min + 1 }, (_, i) => ({
      courtId: selectionStart.courtId,
      slotIndex: min + i,
    }));
  }, [selectionStart, selectionEnd]);

  const clearSelection = useCallback(() => {
    setSelectionStart(null);
    setSelectionEnd(null);
  }, []);

  useEffect(() => {
    const handler = () => {
      if (!isDragging) return;
      setIsDragging(false);
      if (
        selectionStart &&
        selectionEnd &&
        selectionStart.courtId === selectionEnd.courtId
      ) {
        setShowNewBooking(true);
      }
    };
    document.addEventListener("mouseup", handler);
    return () => document.removeEventListener("mouseup", handler);
  }, [isDragging, selectionStart, selectionEnd]);

  const handleCellMouseDown = useCallback(
    (courtId: string, slotIndex: number, e: React.MouseEvent) => {
      e.preventDefault();
      setSelectionStart({ courtId, slotIndex });
      setSelectionEnd({ courtId, slotIndex });
      setIsDragging(true);
    },
    []
  );

  const handleCellMouseEnter = useCallback(
    (courtId: string, slotIndex: number) => {
      if (!isDragging || !selectionStart) return;
      if (selectionStart.courtId !== courtId) return;
      setSelectionEnd({ courtId, slotIndex });
    },
    [isDragging, selectionStart]
  );

  const isSlotSelected = useCallback(
    (courtId: string, slotIndex: number) =>
      selection.some(
        (s) => s.courtId === courtId && s.slotIndex === slotIndex
      ),
    [selection]
  );

  function handleNewBookingClose() {
    setShowNewBooking(false);
    clearSelection();
  }

  return (
    <div className="flex h-full flex-col space-y-5">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      {/* Date navigation */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setSelectedDate((d) => subDays(d, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800 active:scale-[0.96]"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="min-w-0 text-center">
          <p className="text-sm font-semibold leading-tight tracking-tight text-slate-800">
            {dayLabel}
          </p>
          <p className="text-[11px] leading-tight text-slate-400">
            {t("calendar.weekOf")} {weekLabel}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSelectedDate((d) => addDays(d, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800 active:scale-[0.96]"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => setSelectedDate(new Date())}
          className="ml-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 active:scale-[0.97]"
        >
          {t("calendar.today")}
        </button>
      </div>

      {/* Calendar grid */}
      <div
        ref={gridContainerRef}
        className="flex-1 overflow-x-auto overflow-y-hidden rounded-xl border border-slate-200 bg-white"
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `72px repeat(${COURTS.length}, minmax(128px, 1fr))`,
            minWidth: `${72 + COURTS.length * 128}px`,
          }}
        >
          <div data-header className="sticky left-0 top-0 z-25 border-b border-slate-200 bg-white" />

          {COURTS.map((court) => (
            <div
              key={court.id}
              className="sticky top-0 z-20 border-b border-l border-slate-200 bg-white px-3 py-3 text-center"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {court.name}
              </span>
            </div>
          ))}

          {Array.from({ length: SLOTS }, (_, slotIndex) => {
            const hour = START_HOUR + Math.floor(slotIndex / 2);
            const half = slotIndex % 2 === 1;

            return (
              <React.Fragment key={slotIndex}>
                <div
                  className="sticky left-0 z-15 border-b border-slate-100 bg-white pr-3 pt-1 text-right"
                  style={{ height: slotHeight }}
                >
                  {!half && (
                    <span className="text-[11px] leading-none text-slate-400">
                      {formatSlotTime(hour, false)}
                    </span>
                  )}
                </div>

                {COURTS.map((court) => {
                  const booking = dayBookings.find(
                    (b) =>
                      b.courtId === court.id &&
                      timeToSlotIndex(b.startTime) === slotIndex
                  );
                  const isOccupied = dayBookings.some((b) => {
                    if (b.courtId !== court.id) return false;
                    const s = timeToSlotIndex(b.startTime);
                    const e = timeToSlotIndex(b.endTime);
                    return slotIndex >= s && slotIndex < e;
                  });
                  const selected = isSlotSelected(court.id, slotIndex);

                  return (
                    <div
                      key={`${court.id}-${slotIndex}`}
                      className={[
                        "relative select-none border-b border-l border-slate-100 transition-colors",
                        !isOccupied && "cursor-pointer",
                        selected
                          ? "bg-[#8CC63F]/20 ring-1 ring-inset ring-[#8CC63F]/50"
                          : !isOccupied
                            ? "hover:bg-[#8CC63F]/10"
                            : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      style={{ height: slotHeight }}
                      onMouseDown={
                        isOccupied
                          ? undefined
                          : (e) => handleCellMouseDown(court.id, slotIndex, e)
                      }
                      onMouseEnter={() =>
                        handleCellMouseEnter(court.id, slotIndex)
                      }
                    >
                      {booking &&
                        (() => {
                          const startIdx = timeToSlotIndex(booking.startTime);
                          const endIdx = timeToSlotIndex(booking.endTime);
                          const spanSlots = endIdx - startIdx;
                          const confirmed = booking.status === "confirmed";
                          const lead = booking.teamA[0]?.name ?? "";

                          return (
                            <button
                              type="button"
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBooking(booking);
                              }}
                              className={[
                                "absolute inset-x-1 rounded-lg border px-2 py-1.5 text-left transition-opacity hover:opacity-80 active:scale-[0.98]",
                                confirmed
                                  ? "border-green-300 bg-green-100"
                                  : "border-yellow-300 bg-yellow-100",
                              ].join(" ")}
                              style={{
                                top: 2,
                                height: spanSlots * slotHeight - 4,
                                zIndex: 10,
                              }}
                            >
                              <span
                                className={[
                                  "block truncate text-[11px] font-semibold leading-tight",
                                  confirmed ? "text-green-800" : "text-yellow-800",
                                ].join(" ")}
                              >
                                {lead.split(" ")[0] || "—"}
                              </span>
                              {spanSlots > 1 && (
                                <span
                                  className={[
                                    "block text-[10px] leading-tight",
                                    confirmed
                                      ? "text-green-600"
                                      : "text-yellow-600",
                                  ].join(" ")}
                                >
                                  {format(
                                    new Date(booking.startTime),
                                    "h:mm a"
                                  )}{" "}
                                  –{" "}
                                  {format(new Date(booking.endTime), "h:mm a")}
                                </span>
                              )}
                            </button>
                          );
                        })()}
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Empty state */}
      {dayBookings.length === 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
          <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
          <p className="text-sm text-slate-500">{t("calendar.noBookings")}</p>
        </div>
      )}

      {/* Dialogs */}
      <NewBookingDialog
        open={showNewBooking}
        onClose={handleNewBookingClose}
        selection={selection}
        currentDate={selectedDate}
      />
      <TeamCardDialog
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />
    </div>
  );
}
