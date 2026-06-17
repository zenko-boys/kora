"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { X, UserPlus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { CourtSummary } from "@/lib/types";
import type { SlotKey } from "./types";
import { START_HOUR } from "./constants";
import { formatSlotTime } from "./helpers";

export interface BookingFormData {
  courtId: string;
  slotKeys: SlotKey[];
  teamA: [string, string];
  teamB: [string, string];
}

export function BookingPanel({
  selection,
  courts,
  selectedDate,
  startHour = START_HOUR,
  onClose,
  onConfirm,
}: {
  selection: SlotKey[];
  courts: CourtSummary[];
  selectedDate: Date;
  startHour?: number;
  onClose: () => void;
  onConfirm: (data: BookingFormData) => void;
}) {
  const t = useTranslations("manage");
  const [teamA, setTeamA] = useState<[string, string]>(["", ""]);
  const [teamB, setTeamB] = useState<[string, string]>(["", ""]);

  if (selection.length === 0) return null;

  const courtId = selection[0].courtId;
  const court = courts.find((c) => c.id === courtId);
  const minSlot = Math.min(...selection.map((s) => s.slotIndex));
  const maxSlot = Math.max(...selection.map((s) => s.slotIndex));
  const sh = startHour + Math.floor(minSlot / 2);
  const shHalf = minSlot % 2 === 1;
  const eh = startHour + Math.floor((maxSlot + 1) / 2);
  const ehHalf = (maxSlot + 1) % 2 === 1;

  function updateTeamA(i: 0 | 1, value: string) {
    setTeamA((prev) => {
      const next = [...prev] as [string, string];
      next[i] = value;
      return next;
    });
  }

  function updateTeamB(i: 0 | 1, value: string) {
    setTeamB((prev) => {
      const next = [...prev] as [string, string];
      next[i] = value;
      return next;
    });
  }

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-xl border border-slate-200 bg-white">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-100 px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800">
            {court?.name ?? "—"}
          </p>
          <p className="text-xs text-slate-400">
            {format(selectedDate, "EEE, MMM d")}
            {" · "}
            {formatSlotTime(sh, shHalf)} – {formatSlotTime(eh, ehHalf)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-2 mt-0.5 shrink-0 rounded-md p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Team A */}
        <div>
          <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {t("calendar.teamA")}
          </p>
          <div className="space-y-2">
            {([0, 1] as const).map((i) => (
              <div key={i} className="relative">
                <UserPlus className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={teamA[i]}
                  onChange={(e) => updateTeamA(i, e.target.value)}
                  placeholder={t("calendar.addPlayer")}
                  className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#8CC63F] focus:ring-2 focus:ring-[#8CC63F]/20"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs font-bold text-slate-300">VS</span>
          <Separator className="flex-1" />
        </div>

        {/* Team B */}
        <div>
          <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {t("calendar.teamB")}
          </p>
          <div className="space-y-2">
            {([0, 1] as const).map((i) => (
              <div key={i} className="relative">
                <UserPlus className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={teamB[i]}
                  onChange={(e) => updateTeamB(i, e.target.value)}
                  placeholder={t("calendar.addPlayer")}
                  className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#8CC63F] focus:ring-2 focus:ring-[#8CC63F]/20"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex gap-2 border-t border-slate-100 p-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          {t("calendar.cancel")}
        </button>
        <button
          type="button"
          onClick={() =>
            onConfirm({ courtId, slotKeys: selection, teamA, teamB })
          }
          className="flex-1 rounded-lg bg-[#8CC63F] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#7AB534]"
        >
          {t("calendar.confirm")}
        </button>
      </div>
    </div>
  );
}
