"use client";

import { useState, useEffect } from "react";
import { format, type Locale } from "date-fns";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ScheduleBookingInfo, ScheduleSlot } from "@/lib/types";
import type { TeamSlot } from "./types";
import { AvatarSlot } from "./AvatarSlot";
import { PlayerSelectorDialog } from "./PlayerSelectorDialog";

interface BookingDetailPanelProps {
  booking: ScheduleBookingInfo;
  courtName: string;
  startSlot: ScheduleSlot;
  endSlot: ScheduleSlot;
  locale?: Locale;
  onClose: () => void;
  standalone?: boolean;
}

function buildSlots(booking: ScheduleBookingInfo): [TeamSlot, TeamSlot, TeamSlot, TeamSlot] {
  const slots: [TeamSlot, TeamSlot, TeamSlot, TeamSlot] = [null, null, null, null];

  const teamA = booking.participants.filter((p) => p.team === "TeamA");
  const teamB = booking.participants.filter((p) => p.team === "TeamB");

  teamA.slice(0, 2).forEach((p, i) => {
    slots[i] = { name: p.userId, email: "" };
  });
  teamB.slice(0, 2).forEach((p, i) => {
    slots[2 + i] = { name: p.userId, email: "" };
  });

  return slots;
}

export function BookingDetailPanel({
  booking,
  courtName,
  startSlot,
  endSlot,
  locale,
  onClose,
  standalone = true,
}: BookingDetailPanelProps) {
  const t = useTranslations("manage");

  const [slots, setSlots] = useState<[TeamSlot, TeamSlot, TeamSlot, TeamSlot]>(() =>
    buildSlots(booking)
  );
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    setSlots(buildSlots(booking));
  }, [booking]);

  const startFmt = format(new Date(startSlot.startTime), "p", { locale });
  const endFmt = format(new Date(endSlot.endTime), "p", { locale });

  function handleAvatarClick(index: number) {
    setEditingIndex(index);
    setSelectorOpen(true);
  }

  function handlePlayerSelect({ name, email }: { name: string; email: string }) {
    if (editingIndex === null) return;
    setSlots((prev) => {
      const next = [...prev] as [TeamSlot, TeamSlot, TeamSlot, TeamSlot];
      next[editingIndex] = { name, email };
      return next;
    });
    setSelectorOpen(false);
    setEditingIndex(null);
  }

  const inner = (
    <>
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-100 px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800">{courtName}</p>
          <p className="text-xs text-slate-400">
            {startFmt} – {endFmt}
          </p>
        </div>
        {standalone && (
          <button
            type="button"
            onClick={onClose}
            className="ml-2 mt-0.5 shrink-0 rounded-md p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Teams */}
      <div className="flex flex-1 items-start justify-between gap-2 px-4 py-5">
        <div className="flex flex-col items-center gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Team A
          </span>
          <div className="flex gap-3">
            {([0, 1] as const).map((i) => (
              <AvatarSlot
                key={i}
                slot={slots[i]}
                onClick={() => handleAvatarClick(i)}
                addLabel={t("calendar.addPlayer")}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center pt-8">
          <span className="text-xs font-bold text-slate-300">VS</span>
        </div>

        <div className="flex flex-col items-center gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Team B
          </span>
          <div className="flex gap-3">
            {([2, 3] as const).map((i) => (
              <AvatarSlot
                key={i}
                slot={slots[i]}
                onClick={() => handleAvatarClick(i)}
                addLabel={t("calendar.addPlayer")}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 px-4 py-3">
        <p className="text-xs text-slate-400">
          {booking.participantsCount} / {booking.capacity} participants
        </p>
        {booking.description && (
          <p className="mt-1 text-xs text-slate-500">{booking.description}</p>
        )}
      </div>
    </>
  );

  return (
    <>
      {standalone ? (
        <div className="flex w-80 shrink-0 flex-col rounded-xl border border-slate-200 bg-white">
          {inner}
        </div>
      ) : (
        <div className="flex flex-col">{inner}</div>
      )}

      <PlayerSelectorDialog
        open={selectorOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSelectorOpen(false);
            setEditingIndex(null);
          }
        }}
        onSelect={handlePlayerSelect}
        titleLabel={t("calendar.selectPlayer")}
        searchLabel={t("calendar.searchPlayers")}
        guestLabel={t("calendar.guest")}
      />
    </>
  );
}
