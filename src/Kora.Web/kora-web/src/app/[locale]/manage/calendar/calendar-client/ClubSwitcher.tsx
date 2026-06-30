"use client";

import { useState } from "react";
import { Building2, ChevronDown, Star } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { MyClubSummary } from "@/lib/types";

function ClubAvatar({
  club,
  size,
}: {
  club?: MyClubSummary;
  size: number;
}) {
  const style = { width: size, height: size };
  if (club?.imageUrl) {
    return (
      <img
        src={club.imageUrl}
        alt=""
        style={style}
        className="shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <div
      style={style}
      className="flex shrink-0 items-center justify-center rounded-full bg-[#1C2E40]"
    >
      <Building2 className="h-1/2 w-1/2 text-[#8CC63F]" />
    </div>
  );
}

export function ClubSwitcher({
  clubs,
  selectedClubId,
  onSelect,
  placeholder,
  formatCourtsCount,
}: {
  clubs: MyClubSummary[];
  selectedClubId: string;
  onSelect: (clubId: string) => void;
  placeholder: string;
  formatCourtsCount: (count: number) => string;
}) {
  const [open, setOpen] = useState(false);
  const selected = clubs.find((c) => c.clubId === selectedClubId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
      >
        <ClubAvatar club={selected} size={24} />
        <span className="max-w-40 truncate">
          {selected?.name ?? placeholder}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </PopoverTrigger>

      <PopoverContent align="start" className="w-72 p-1.5">
        <div className="flex flex-col gap-0.5">
          {clubs.map((c) => {
            const isSelected = c.clubId === selectedClubId;
            const stars = c.rating ?? 0;
            return (
              <button
                key={c.clubId}
                type="button"
                onClick={() => {
                  onSelect(c.clubId);
                  setOpen(false);
                }}
                className={[
                  "flex items-center gap-3 rounded-lg p-2 text-left transition-colors",
                  isSelected ? "bg-[#8CC63F]/10" : "hover:bg-slate-50",
                ].join(" ")}
              >
                <ClubAvatar club={c} size={36} />
                <div className="min-w-0 flex-1">
                  <p
                    className={[
                      "truncate text-sm font-medium",
                      isSelected ? "text-[#8CC63F]" : "text-slate-700",
                    ].join(" ")}
                  >
                    {c.name}
                  </p>
                  {(c.courtsCount !== undefined || stars > 0) && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      {c.courtsCount !== undefined && (
                        <span>{formatCourtsCount(c.courtsCount)}</span>
                      )}
                      {stars > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                          {stars}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}