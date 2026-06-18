"use client";

import { UserPlus } from "lucide-react";
import type { TeamSlot } from "./types";

export function AvatarSlot({
  slot,
  onClick,
  addLabel,
}: {
  slot: TeamSlot;
  onClick: () => void;
  addLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center gap-1.5"
    >
      {slot ? (
        <>
          <div className="relative">
            <img
              src={`https://picsum.photos/seed/${encodeURIComponent(slot.name)}/48/48`}
              alt={slot.name}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-transparent transition-all group-hover:ring-[#8CC63F]"
            />
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-all group-hover:bg-black/20">
              <UserPlus className="h-4 w-4 text-white opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </div>
          <span className="max-w-15 truncate text-center text-[10px] text-slate-500">
            {slot.name.split(" ")[0]}
          </span>
        </>
      ) : (
        <>
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-slate-300 transition-colors group-hover:border-[#8CC63F]/60 group-hover:bg-[#8CC63F]/5">
            <UserPlus className="h-4 w-4 text-slate-400 transition-colors group-hover:text-[#8CC63F]" />
          </div>
          <span className="max-w-15 text-center text-[10px] text-slate-400">
            {addLabel}
          </span>
        </>
      )}
    </button>
  );
}
