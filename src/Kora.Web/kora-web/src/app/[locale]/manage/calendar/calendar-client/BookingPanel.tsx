"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import type { CourtSummary } from "@/lib/types";
import type { SlotKey, TeamSlot } from "./types";
import { START_HOUR } from "./constants";
import { formatSlotTime } from "./helpers";
import { AvatarSlot } from "./AvatarSlot";
import { PlayerSelectorDialog } from "./PlayerSelectorDialog";

const MOCK_PLAYERS = [
  "Rafaela Monteiro",
  "Bruno Cavalcante",
  "Letícia Drummond",
  "Caio Ferreira",
  "Viviane Assis",
  "Marcos Teixeira",
  "Isadora Leal",
  "Henrique Nogueira",
  "Priya Mendes",
  "Rodrigo Bittencourt",
  "Camila Zanetti",
  "Felipe Guimarães",
  "Tatiane Ramos",
  "André Lustosa",
  "Nathalia Vaz",
  "Claudio Pires",
];

export interface BookingFormData {
  courtId: string;
  slotKeys: SlotKey[];
  teamA: [TeamSlot, TeamSlot];
  teamB: [TeamSlot, TeamSlot];
}

export function BookingPanel({
  selection,
  courts,
  selectedDate,
  startHour = START_HOUR,
  onClose,
  onConfirm,
  isPending = false,
}: {
  selection: SlotKey[];
  courts: CourtSummary[];
  selectedDate: Date;
  startHour?: number;
  onClose: () => void;
  onConfirm: (data: BookingFormData) => void;
  isPending?: boolean;
}) {
  const t = useTranslations("manage");

  // slots[0,1] = Team A positions 1,2 — slots[2,3] = Team B positions 1,2
  const [slots, setSlots] = useState<[TeamSlot, TeamSlot, TeamSlot, TeamSlot]>(
    [null, null, null, null]
  );
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  if (selection.length === 0) return null;

  const courtId = selection[0].courtId;
  const court = courts.find((c) => c.id === courtId);
  const minSlot = Math.min(...selection.map((s) => s.slotIndex));
  const maxSlot = Math.max(...selection.map((s) => s.slotIndex));
  const sh = startHour + Math.floor(minSlot / 2);
  const shHalf = minSlot % 2 === 1;
  const eh = startHour + Math.floor((maxSlot + 1) / 2);
  const ehHalf = (maxSlot + 1) % 2 === 1;

  function handleAvatarClick(index: number) {
    setEditingIndex(index);
    setSelectorOpen(true);
  }

  function handlePlayerSelect(name: string) {
    if (editingIndex === null) return;
    setSlots((prev) => {
      const next = [...prev] as [TeamSlot, TeamSlot, TeamSlot, TeamSlot];
      next[editingIndex] = { name };
      return next;
    });
    setSelectorOpen(false);
    setEditingIndex(null);
  }

  function handleSelectorClose(open: boolean) {
    if (!open) {
      setSelectorOpen(false);
      setEditingIndex(null);
    }
  }

  return (
    <>
      <div className="flex w-80 shrink-0 flex-col rounded-xl border border-slate-200 bg-white">
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

        {/* Teams */}
        <div className="flex flex-1 items-start justify-between gap-2 px-4 py-5">
          {/* Team A */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {t("calendar.teamA")}
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

          {/* Team B */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {t("calendar.teamB")}
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
            disabled={isPending}
            onClick={() =>
              onConfirm({
                courtId,
                slotKeys: selection,
                teamA: [slots[0], slots[1]],
                teamB: [slots[2], slots[3]],
              })
            }
            className="flex-1 rounded-lg bg-[#8CC63F] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#7AB534] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                {t("calendar.confirm")}
              </span>
            ) : (
              t("calendar.confirm")
            )}
          </button>
        </div>
      </div>

      <PlayerSelectorDialog
        open={selectorOpen}
        onOpenChange={handleSelectorClose}
        onSelect={handlePlayerSelect}
        players={MOCK_PLAYERS}
        titleLabel={t("calendar.selectPlayer")}
        searchLabel={t("calendar.searchPlayers")}
        guestLabel={t("calendar.guest")}
      />
    </>
  );
}
