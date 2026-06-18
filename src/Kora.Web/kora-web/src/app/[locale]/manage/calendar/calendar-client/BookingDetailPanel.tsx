"use client";

import { format, type Locale } from "date-fns";
import { X, UserRound } from "lucide-react";
import type { ScheduleBookingInfo, ScheduleSlot } from "@/lib/types";

interface BookingDetailPanelProps {
  booking: ScheduleBookingInfo;
  courtName: string;
  startSlot: ScheduleSlot;
  endSlot: ScheduleSlot;
  locale?: Locale;
  onClose: () => void;
}

function ParticipantAvatar({ userId }: { userId: string }) {
  return (
    <img
      src={`https://picsum.photos/seed/${encodeURIComponent(userId)}/48/48`}
      alt=""
      className="h-12 w-12 rounded-full object-cover shadow ring-2 ring-white"
    />
  );
}

function EmptySlot() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-slate-200 bg-slate-50">
      <UserRound className="h-4 w-4 text-slate-300" />
    </div>
  );
}

function TeamColumn({
  label,
  participants,
}: {
  label: string;
  participants: { userId: string }[];
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <div className="flex gap-3">
        {[0, 1].map((i) =>
          participants[i] ? (
            <ParticipantAvatar key={participants[i].userId} userId={participants[i].userId} />
          ) : (
            <EmptySlot key={i} />
          )
        )}
      </div>
    </div>
  );
}

export function BookingDetailPanel({
  booking,
  courtName,
  startSlot,
  endSlot,
  locale,
  onClose,
}: BookingDetailPanelProps) {
  const teamA = booking.participants.filter((p) => p.team === "TeamA");
  const teamB = booking.participants.filter((p) => p.team === "TeamB");
  const startFmt = format(new Date(startSlot.startTime), "p", { locale });
  const endFmt = format(new Date(endSlot.endTime), "p", { locale });

  return (
    <div className="flex w-80 shrink-0 flex-col rounded-xl border border-slate-200 bg-white">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-100 px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800">{courtName}</p>
          <p className="text-xs text-slate-400">
            {startFmt} – {endFmt}
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
        <TeamColumn label="Team A" participants={teamA} />

        <div className="flex flex-col items-center pt-8">
          <span className="text-xs font-bold text-slate-300">VS</span>
        </div>

        <TeamColumn label="Team B" participants={teamB} />
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
    </div>
  );
}
