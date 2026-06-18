"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import type { ScheduleBookingInfo, ScheduleSlot } from "@/lib/types";

interface SlotBookingCardProps {
  booking: ScheduleBookingInfo;
  courtName: string;
  startSlot: ScheduleSlot;
  endSlot: ScheduleSlot;
  span: number;
  slotHeight: number;
  onClick: () => void;
}

export function SlotBookingCard({
  booking,
  courtName,
  startSlot,
  endSlot,
  span,
  slotHeight,
  onClick,
}: SlotBookingCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const teamA = booking.participants.filter((p) => p.team === "TeamA");
  const teamB = booking.participants.filter((p) => p.team === "TeamB");
  const startFmt = format(new Date(startSlot.startTime), "h:mm a");
  const endFmt = format(new Date(endSlot.endTime), "h:mm a");

  function handleMouseEnter() {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      const tooltipWidth = 224;
      const spaceRight = window.innerWidth - rect.right;
      const left =
        spaceRight > tooltipWidth + 8
          ? rect.right + 8
          : rect.left - tooltipWidth - 8;
      setTooltipPos({ top: rect.top, left });
    }
  }

  function handleMouseLeave() {
    closeTimerRef.current = setTimeout(() => setTooltipPos(null), 150);
  }

  return (
    <>
      <div
        ref={cardRef}
        className="absolute inset-x-0.5 top-0.5 z-10 cursor-pointer overflow-hidden rounded-md border border-rose-200 bg-rose-100 px-1.5 py-1 transition-colors hover:bg-rose-200"
        style={{ height: span * slotHeight - 4 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
      >
        <p className="truncate text-[10px] font-semibold leading-tight text-rose-700">
          {courtName}
        </p>
        {span > 1 && (
          <p className="truncate text-[10px] leading-tight text-rose-500">
            {startFmt} – {endFmt}
          </p>
        )}
      </div>

      {tooltipPos !== null &&
        createPortal(
          <div
            className="pointer-events-none fixed z-9999 w-56 rounded-lg border border-slate-200 bg-white p-3 shadow-lg"
            style={{ top: tooltipPos.top, left: tooltipPos.left }}
          >
            <p className="text-xs font-semibold text-slate-800">{courtName}</p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              {startFmt} – {endFmt}
            </p>

            {booking.participants.length > 0 ? (
              <div className="mt-2 flex items-center gap-1">
                {teamA.map((p) => (
                  <img
                    key={p.userId}
                    src={`https://picsum.photos/seed/${encodeURIComponent(p.userId)}/32/32`}
                    alt=""
                    className="h-6 w-6 rounded-full object-cover ring-1 ring-white"
                  />
                ))}
                <span className="px-1 text-[10px] font-bold text-slate-300">
                  VS
                </span>
                {teamB.map((p) => (
                  <img
                    key={p.userId}
                    src={`https://picsum.photos/seed/${encodeURIComponent(p.userId)}/32/32`}
                    alt=""
                    className="h-6 w-6 rounded-full object-cover ring-1 ring-white"
                  />
                ))}
              </div>
            ) : (
              <p className="mt-1 text-[11px] text-slate-400">
                {booking.participantsCount} participant
                {booking.participantsCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>,
          document.body
        )}
    </>
  );
}
