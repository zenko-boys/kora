"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { format, type Locale } from "date-fns";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { createApiClient } from "@/lib/api";
import type { ScheduleBookingInfo, ScheduleSlot, BookingParticipantDto, BookingGuestDto } from "@/lib/types";
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

// positionInTeam from API is 1-indexed; slot index within team is 0-indexed.
// slots[0] = TeamA pos 0, slots[1] = TeamA pos 1, slots[2] = TeamB pos 0, slots[3] = TeamB pos 1
function buildSlots(
  participants: BookingParticipantDto[],
  guests: BookingGuestDto[]
): [TeamSlot, TeamSlot, TeamSlot, TeamSlot] {
  const slots: [TeamSlot, TeamSlot, TeamSlot, TeamSlot] = [null, null, null, null];

  for (const p of participants) {
    const teamOffset = p.team === "TeamA" ? 0 : p.team === "TeamB" ? 2 : null;
    if (teamOffset === null) continue;
    // API sends 1-indexed positionInTeam; convert to 0-indexed
    const pos = (p.positionInTeam ?? 1) - 1;
    const idx = teamOffset + pos;
    if (idx >= 0 && idx < 4) {
      slots[idx] = { name: p.name || p.email, email: p.email, userId: p.userId };
    }
  }

  for (const g of guests) {
    const teamOffset = g.team === "TeamA" ? 0 : g.team === "TeamB" ? 2 : null;
    if (teamOffset === null) continue;
    const pos = (g.positionInTeam ?? 1) - 1;
    const idx = teamOffset + pos;
    if (idx >= 0 && idx < 4 && slots[idx] === null) {
      slots[idx] = { name: g.name, email: g.email ?? "" };
    }
  }

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
  const { getToken } = useAuth();
  const api = useMemo(() => createApiClient(async (opts) => getToken(opts)), []); // eslint-disable-line react-hooks/exhaustive-deps
  const queryClient = useQueryClient();

  const { data: detail, isLoading } = useQuery({
    queryKey: ["booking", booking.bookingId],
    queryFn: () => api.getBooking(booking.bookingId),
    staleTime: 30_000,
  });

  const [slots, setSlots] = useState<[TeamSlot, TeamSlot, TeamSlot, TeamSlot]>([null, null, null, null]);
  // Tracks the original userId per slot index (from API load) to know who to DELETE
  const originalUserIds = useRef<(string | undefined)[]>([undefined, undefined, undefined, undefined]);

  const [selectorOpen, setSelectorOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (detail) {
      const built = buildSlots(detail.participants, detail.guests);
      setSlots(built);
      originalUserIds.current = built.map((s) => s?.userId);
    }
  }, [detail]);

  const startFmt = format(new Date(startSlot.startTime), "p", { locale });
  const endFmt = format(new Date(endSlot.endTime), "p", { locale });

  const { mutate: confirmChanges, isPending } = useMutation({
    mutationFn: async () => {
      for (let i = 0; i < 4; i++) {
        const newUserId = slots[i]?.userId;
        const oldUserId = originalUserIds.current[i];

        // Nothing changed for this slot
        if (newUserId === oldUserId) continue;

        // Remove old participant first
        if (oldUserId) {
          await api.removeParticipant(booking.bookingId, oldUserId);
        }

        // Add new participant (only registered users have userId; guests are skipped)
        if (newUserId) {
          await api.addParticipant(booking.bookingId, {
            userId: newUserId,
            team: i < 2 ? "TeamA" : "TeamB",
            positionInTeam: (i % 2) + 1, // API expects 1-indexed
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club-schedule"] });
      queryClient.invalidateQueries({ queryKey: ["booking", booking.bookingId] });
      onClose();
    },
  });

  function handleAvatarClick(index: number) {
    setEditingIndex(index);
    setSelectorOpen(true);
  }

  function handlePlayerSelect({ name, email, userId }: { name: string; email: string; userId?: string }) {
    if (editingIndex === null) return;
    setSlots((prev) => {
      const next = [...prev] as [TeamSlot, TeamSlot, TeamSlot, TeamSlot];
      next[editingIndex] = { name, email, userId };
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
        {isLoading ? (
          <div className="flex w-full items-center justify-center py-6">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-[#8CC63F]" />
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>

      {/* Info */}
      <div className="border-t border-slate-100 px-4 py-3">
        <p className="text-xs text-slate-400">
          {booking.participantsCount} / {booking.capacity} participants
        </p>
        {booking.description && (
          <p className="mt-1 text-xs text-slate-500">{booking.description}</p>
        )}
      </div>

      {/* Actions */}
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
          onClick={() => confirmChanges()}
          className="flex-1 rounded-lg bg-[#8CC63F] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#7AB534] disabled:cursor-not-allowed disabled:opacity-60"
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
