"use client";

import { useState, useEffect } from "react";
import { Search, UserPlus, UserRound } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { createApiClient } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SelectedPlayer {
  name: string;
  email: string;
}

function displayName(user: { firstName: string | null; lastName: string | null; email: string }) {
  const full = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return full || user.email;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function PlayerSelectorDialog({
  open,
  onOpenChange,
  onSelect,
  titleLabel,
  searchLabel,
  guestLabel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (player: SelectedPlayer) => void;
  titleLabel: string;
  searchLabel: string;
  guestLabel: string;
}) {
  const { getToken } = useAuth();
  const api = createApiClient(async (opts) => getToken(opts));

  const [email, setEmail] = useState("");
  const [debouncedEmail, setDebouncedEmail] = useState("");

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setEmail("");
      setDebouncedEmail("");
    }
  }, [open]);

  // Debounce — only trigger query if looks like a valid email
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedEmail(isValidEmail(email) ? email : "");
    }, 500);
    return () => clearTimeout(timer);
  }, [email]);

  const { data: user, isLoading, isFetched } = useQuery({
    queryKey: ["user-by-email", debouncedEmail],
    queryFn: () => api.findUserByEmail(debouncedEmail),
    enabled: !!debouncedEmail,
    staleTime: 60_000,
    retry: false,
  });

  function handleSelect(player: SelectedPlayer) {
    onSelect(player);
  }

  const showNotFound = isFetched && debouncedEmail && user === null;
  const showUser = !!user;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{titleLabel}</DialogTitle>
        </DialogHeader>

        {/* Email input */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            autoFocus
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={searchLabel}
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#8CC63F] focus:ring-2 focus:ring-[#8CC63F]/20"
          />
        </div>

        <div className="space-y-1">
          {/* Loading skeleton */}
          {isLoading && (
            <div className="flex items-center gap-3 rounded-lg px-2 py-2">
              <div className="h-9 w-9 rounded-full bg-slate-100 animate-pulse shrink-0" />
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="h-3 w-32 rounded bg-slate-100 animate-pulse" />
                <div className="h-2.5 w-24 rounded bg-slate-100 animate-pulse" />
              </div>
            </div>
          )}

          {/* Found user */}
          {showUser && !isLoading && (
            <button
              type="button"
              onClick={() => handleSelect({ name: displayName(user!), email: user!.email })}
              className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-slate-50 active:scale-[0.98]"
            >
              <img
                src={`https://picsum.photos/seed/${encodeURIComponent(user!.id)}/36/36`}
                alt=""
                className="h-9 w-9 rounded-full object-cover shrink-0"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">
                  {displayName(user!)}
                </p>
                <p className="truncate text-xs text-slate-400">{user!.email}</p>
              </div>
            </button>
          )}

          {/* Not found */}
          {showNotFound && !isLoading && (
            <div className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-400">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100">
                <UserRound className="h-4 w-4 text-slate-300" />
              </div>
              Nenhum usuário encontrado
            </div>
          )}

          {/* Divider when user found */}
          {showUser && !isLoading && (
            <div className="h-px bg-slate-100 my-1" />
          )}

          {/* Guest option */}
          <button
            type="button"
            onClick={() => handleSelect({ name: guestLabel, email: "" })}
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm text-slate-500 transition-colors hover:bg-slate-50"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100">
              <UserPlus className="h-4 w-4 text-slate-400" />
            </div>
            {guestLabel}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
