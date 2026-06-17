"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { AvatarSlot } from "./AvatarSlot";
import { PlayerSelectorDialog } from "./PlayerSelectorDialog";
import { COURTS } from "./constants";
import type { Booking, TeamSlot } from "./types";

export function TeamCardDialog({
  booking,
  onClose,
}: {
  booking: Booking | null;
  onClose: () => void;
}) {
  const t = useTranslations("manage");
  const [teams, setTeams] = useState<[TeamSlot, TeamSlot, TeamSlot, TeamSlot]>(
    [null, null, null, null]
  );
  const [playerSelectorOpen, setPlayerSelectorOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<number | null>(null);

  useEffect(() => {
    if (booking) {
      setTeams([
        booking.teamA[0],
        booking.teamA[1],
        booking.teamB[0],
        booking.teamB[1],
      ]);
    }
  }, [booking]);

  function handleAvatarClick(index: number) {
    setEditingSlot(index);
    setPlayerSelectorOpen(true);
  }

  function handlePlayerSelect(name: string) {
    if (editingSlot === null) return;
    setTeams((prev) => {
      const next = [...prev] as [TeamSlot, TeamSlot, TeamSlot, TeamSlot];
      next[editingSlot] = { name };
      return next;
    });
    setPlayerSelectorOpen(false);
    setEditingSlot(null);
  }

  const court = COURTS.find((c) => c.id === booking?.courtId);
  const isConfirmed = booking?.status === "confirmed";

  return (
    <>
      <Dialog
        open={!!booking}
        onOpenChange={(isOpen) => {
          if (!isOpen) onClose();
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{court?.name ?? ""}</DialogTitle>
            {booking && (
              <p className="mt-0.5 text-xs text-slate-500">
                {format(new Date(booking.startTime), "EEE, MMM d")}
                {" · "}
                {format(new Date(booking.startTime), "h:mm a")}
                {" – "}
                {format(new Date(booking.endTime), "h:mm a")}
                {" · "}
                <span
                  className={
                    isConfirmed ? "text-emerald-600" : "text-amber-500"
                  }
                >
                  {booking.status}
                </span>
              </p>
            )}
          </DialogHeader>

          <Separator />

          <div className="flex items-start justify-between gap-4 py-2">
            <div className="flex flex-col items-center gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {t("calendar.teamA")}
              </span>
              <div className="flex gap-3">
                {([0, 1] as const).map((i) => (
                  <AvatarSlot
                    key={i}
                    slot={teams[i]}
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
                {t("calendar.teamB")}
              </span>
              <div className="flex gap-3">
                {([2, 3] as const).map((i) => (
                  <AvatarSlot
                    key={i}
                    slot={teams[i]}
                    onClick={() => handleAvatarClick(i)}
                    addLabel={t("calendar.addPlayer")}
                  />
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <PlayerSelectorDialog
        open={playerSelectorOpen}
        onOpenChange={(open) => {
          if (!open) {
            setPlayerSelectorOpen(false);
            setEditingSlot(null);
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
