"use client";

import { useState, useMemo } from "react";
import { Search, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

export function PlayerSelectorDialog({
  open,
  onOpenChange,
  onSelect,
  players,
  titleLabel,
  searchLabel,
  guestLabel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (name: string) => void;
  players: string[];
  titleLabel: string;
  searchLabel: string;
  guestLabel: string;
}) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () =>
      players.filter((p) =>
        p.toLowerCase().includes(search.toLowerCase())
      ),
    [search, players]
  );

  function handleSelect(name: string) {
    onSelect(name);
    setSearch("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{titleLabel}</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            autoFocus
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchLabel}
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#8CC63F] focus:ring-2 focus:ring-[#8CC63F]/20"
          />
        </div>

        <div className="max-h-52 space-y-0.5 overflow-y-auto">
          {filtered.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => handleSelect(name)}
              className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 active:scale-[0.98]"
            >
              <img
                src={`https://picsum.photos/seed/${encodeURIComponent(name)}/32/32`}
                alt=""
                className="h-7 w-7 rounded-full object-cover"
              />
              {name}
            </button>
          ))}
          {filtered.length > 0 && <Separator className="my-1" />}
          <button
            type="button"
            onClick={() => handleSelect(guestLabel)}
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm text-slate-500 transition-colors hover:bg-slate-50"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100">
              <UserPlus className="h-3.5 w-3.5 text-slate-400" />
            </div>
            {guestLabel}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
