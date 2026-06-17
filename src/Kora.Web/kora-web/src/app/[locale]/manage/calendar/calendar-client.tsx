"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  format,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  isSameDay,
} from "date-fns";
import { useTranslations } from "next-intl";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  UserPlus,
  Search,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { createApiClient } from "@/lib/api";
import type { CourtSummary } from "@/lib/types";
import { MANAGEMENT_ROLES } from "@/lib/constants";

// ── Types ──────────────────────────────────────────────────────────────────────

type Court = { id: string; name: string };
type TeamSlot = { name: string } | null;
type Booking = {
  id: string;
  courtId: string;
  startTime: string;
  endTime: string;
  status: "confirmed" | "pending";
  teamA: [TeamSlot, TeamSlot];
  teamB: [TeamSlot, TeamSlot];
};
type SlotKey = { courtId: string; slotIndex: number };

// ── Constants ─────────────────────────────────────────────────────────────────

const COURTS: Court[] = [
  { id: "c1", name: "Padel 1" },
  { id: "c2", name: "Padel 2" },
  { id: "c3", name: "Padel 3" },
  { id: "c4", name: "Padel 4" },
  { id: "c5", name: "Padel 5" },
  { id: "c6", name: "Padel 6" },
];

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

const START_HOUR = 8;
const END_HOUR = 22;
const SLOT_HEIGHT = 56;
const SLOTS = (END_HOUR - START_HOUR) * 2;

// Compute mock timestamps once at module level so dates are stable
const _ref = new Date();
function _off(n: number) {
  const d = new Date(_ref);
  d.setDate(d.getDate() + n);
  return d;
}
function _ts(date: Date, h: number, m = 0) {
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d.toISOString().slice(0, 19);
}

const MOCK_BOOKINGS: Booking[] = [
  {
    id: "b1",
    courtId: "c1",
    startTime: _ts(_off(0), 9),
    endTime: _ts(_off(0), 10, 30),
    status: "confirmed",
    teamA: [{ name: "Rafaela Monteiro" }, { name: "Bruno Cavalcante" }],
    teamB: [{ name: "Letícia Drummond" }, null],
  },
  {
    id: "b2",
    courtId: "c3",
    startTime: _ts(_off(0), 11),
    endTime: _ts(_off(0), 12),
    status: "confirmed",
    teamA: [{ name: "Caio Ferreira" }, { name: "Viviane Assis" }],
    teamB: [null, null],
  },
  {
    id: "b3",
    courtId: "c2",
    startTime: _ts(_off(0), 13, 30),
    endTime: _ts(_off(0), 15),
    status: "pending",
    teamA: [{ name: "Marcos Teixeira" }, { name: "Isadora Leal" }],
    teamB: [{ name: "Henrique Nogueira" }, null],
  },
  {
    id: "b4",
    courtId: "c5",
    startTime: _ts(_off(0), 16),
    endTime: _ts(_off(0), 17, 30),
    status: "confirmed",
    teamA: [{ name: "Priya Mendes" }, { name: "Rodrigo Bittencourt" }],
    teamB: [null, null],
  },
  {
    id: "b5",
    courtId: "c4",
    startTime: _ts(_off(1), 10),
    endTime: _ts(_off(1), 11, 30),
    status: "pending",
    teamA: [{ name: "Camila Zanetti" }, null],
    teamB: [{ name: "Felipe Guimarães" }, null],
  },
  {
    id: "b6",
    courtId: "c6",
    startTime: _ts(_off(-1), 14),
    endTime: _ts(_off(-1), 16),
    status: "confirmed",
    teamA: [{ name: "Tatiane Ramos" }, { name: "André Lustosa" }],
    teamB: [{ name: "Nathalia Vaz" }, { name: "Claudio Pires" }],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeToSlotIndex(isoStr: string): number {
  const d = new Date(isoStr);
  return (d.getHours() - START_HOUR) * 2 + Math.floor(d.getMinutes() / 30);
}

function formatSlotTime(hour: number, half: boolean): string {
  const m = half ? 30 : 0;
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const period = hour < 12 ? "AM" : "PM";
  return `${h12}:${m === 0 ? "00" : "30"} ${period}`;
}

// ── AvatarSlot ────────────────────────────────────────────────────────────────

function AvatarSlot({
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

// ── PlayerSelectorDialog ──────────────────────────────────────────────────────

function PlayerSelectorDialog({
  open,
  onOpenChange,
  onSelect,
  titleLabel,
  searchLabel,
  guestLabel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (name: string) => void;
  titleLabel: string;
  searchLabel: string;
  guestLabel: string;
}) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () =>
      MOCK_PLAYERS.filter((p) =>
        p.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
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

// ── TeamCardDialog ────────────────────────────────────────────────────────────

function TeamCardDialog({
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
            {/* Team A */}
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

            {/* Team B */}
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

// ── NewBookingDialog ──────────────────────────────────────────────────────────

function NewBookingDialog({
  open,
  onClose,
  selection,
  currentDate,
}: {
  open: boolean;
  onClose: () => void;
  selection: SlotKey[];
  currentDate: Date;
}) {
  const t = useTranslations("manage");
  const { getToken } = useAuth();
  const api = createApiClient(async (opts) => getToken(opts));

  const [clubId, setClubId] = useState("");
  const [courtId, setCourtId] = useState("");
  const [bookingDate, setBookingDate] = useState(currentDate);
  const [bookingType, setBookingType] = useState("game");
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Clubs — fetched once and cached; filtered to management roles
  const { data: clubsData } = useQuery({
    queryKey: ["my-clubs"],
    queryFn: () => api.getMyClubs(),
  });
  const managedClubs = (clubsData?.clubs ?? []).filter((c) =>
    MANAGEMENT_ROLES.includes(c.role)
  );

  // Courts — only fetched after a club is chosen
  const { data: courtsData, isLoading: courtsLoading } = useQuery({
    queryKey: ["courts", clubId],
    queryFn: () => api.getCourts(clubId),
    enabled: !!clubId,
  });
  const availableCourts: CourtSummary[] = courtsData?.courts ?? [];

  // Reset form whenever the dialog opens
  useEffect(() => {
    if (open) {
      setClubId("");
      setCourtId("");
      setBookingDate(currentDate);
      setBookingType("game");
      setDatePickerOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const slotIdx = selection[0]?.slotIndex ?? 0;
  const startHour = START_HOUR + Math.floor(slotIdx / 2);
  const startHalf = slotIdx % 2 === 1;
  const durationMin = Math.max(selection.length, 1) * 30;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("calendar.newBooking")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Club */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              {t("calendar.club")}
            </Label>
            <Select
              value={clubId}
              onValueChange={(v) => {
                setClubId(v ?? "");
                setCourtId("");
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("calendar.selectClub")} />
              </SelectTrigger>
              <SelectContent>
                {managedClubs.map((c) => (
                  <SelectItem key={c.clubId} value={c.clubId}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Court — loads from API once a club is chosen */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              {t("calendar.court")}
            </Label>
            <Select
              value={courtId}
              onValueChange={(v) => setCourtId(v ?? "")}
              disabled={!clubId || courtsLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    courtsLoading ? "..." : t("calendar.selectCourt")
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableCourts.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date — floating Popover */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              {t("calendar.date")}
            </Label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger className="flex w-full items-center gap-2 rounded-lg border border-input bg-transparent px-2.5 py-2 text-left text-sm transition-colors hover:bg-accent">
                <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
                {format(bookingDate, "PPP")}
              </PopoverTrigger>
              <PopoverContent side="bottom" align="start" className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={bookingDate}
                  onSelect={(d) => {
                    if (d) {
                      setBookingDate(d);
                      setDatePickerOpen(false);
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Start time + Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                {t("calendar.startTime")}
              </Label>
              <div className="flex h-8 items-center rounded-lg border border-input bg-muted/40 px-2.5 text-sm text-foreground">
                {formatSlotTime(startHour, startHalf)}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                {t("calendar.duration")}
              </Label>
              <div className="flex h-8 items-center rounded-lg border border-input bg-muted/40 px-2.5 text-sm text-foreground">
                {durationMin} min
              </div>
            </div>
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              {t("calendar.type")}
            </Label>
            <Select value={bookingType} onValueChange={(v) => setBookingType(v ?? "game")}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="game">{t("calendar.game")}</SelectItem>
                <SelectItem value="day_use">
                  {t("calendar.dayUse")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <DialogClose
            render={
              <button
                type="button"
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 active:scale-[0.98]"
              />
            }
          >
            {t("calendar.cancel")}
          </DialogClose>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg bg-[#8CC63F] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#7AB534] active:scale-[0.98]"
          >
            {t("calendar.confirm")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── CalendarClient ────────────────────────────────────────────────────────────

export function CalendarClient({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const t = useTranslations("manage");

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectionStart, setSelectionStart] = useState<SlotKey | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<SlotKey | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekLabel = `${format(weekStart, "MMM d")} – ${format(weekEnd, "d, yyyy")}`;
  const dayLabel = format(selectedDate, "EEEE, MMM d, yyyy");

  const dayBookings = useMemo(
    () =>
      MOCK_BOOKINGS.filter((b) =>
        isSameDay(new Date(b.startTime), selectedDate)
      ),
    [selectedDate]
  );

  const selection = useMemo<SlotKey[]>(() => {
    if (!selectionStart || !selectionEnd) return [];
    if (selectionStart.courtId !== selectionEnd.courtId) return [];
    const min = Math.min(selectionStart.slotIndex, selectionEnd.slotIndex);
    const max = Math.max(selectionStart.slotIndex, selectionEnd.slotIndex);
    return Array.from({ length: max - min + 1 }, (_, i) => ({
      courtId: selectionStart.courtId,
      slotIndex: min + i,
    }));
  }, [selectionStart, selectionEnd]);

  const clearSelection = useCallback(() => {
    setSelectionStart(null);
    setSelectionEnd(null);
  }, []);

  // Finalise drag on global mouseup so it works even when mouse leaves the grid
  useEffect(() => {
    const handler = () => {
      if (!isDragging) return;
      setIsDragging(false);
      if (
        selectionStart &&
        selectionEnd &&
        selectionStart.courtId === selectionEnd.courtId
      ) {
        setShowNewBooking(true);
      }
    };
    document.addEventListener("mouseup", handler);
    return () => document.removeEventListener("mouseup", handler);
  }, [isDragging, selectionStart, selectionEnd]);

  const handleCellMouseDown = useCallback(
    (courtId: string, slotIndex: number, e: React.MouseEvent) => {
      e.preventDefault(); // prevent text selection during drag
      setSelectionStart({ courtId, slotIndex });
      setSelectionEnd({ courtId, slotIndex });
      setIsDragging(true);
    },
    []
  );

  const handleCellMouseEnter = useCallback(
    (courtId: string, slotIndex: number) => {
      if (!isDragging || !selectionStart) return;
      if (selectionStart.courtId !== courtId) return;
      setSelectionEnd({ courtId, slotIndex });
    },
    [isDragging, selectionStart]
  );

  const isSlotSelected = useCallback(
    (courtId: string, slotIndex: number) =>
      selection.some(
        (s) => s.courtId === courtId && s.slotIndex === slotIndex
      ),
    [selection]
  );

  function handleNewBookingClose() {
    setShowNewBooking(false);
    clearSelection();
  }

  return (
    <div className="flex h-full flex-col space-y-5">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      {/* Date navigation */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setSelectedDate((d) => subDays(d, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800 active:scale-[0.96]"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="min-w-0 text-center">
          <p className="text-sm font-semibold leading-tight tracking-tight text-slate-800">
            {dayLabel}
          </p>
          <p className="text-[11px] leading-tight text-slate-400">
            {t("calendar.weekOf")} {weekLabel}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSelectedDate((d) => addDays(d, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800 active:scale-[0.96]"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => setSelectedDate(new Date())}
          className="ml-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 active:scale-[0.97]"
        >
          {t("calendar.today")}
        </button>
      </div>

      {/* Calendar grid — overflow: auto on both axes enables sticky on both axes */}
      <div
        className="flex-1 overflow-auto rounded-xl border border-slate-200 bg-white"
        style={{ maxHeight: "calc(100vh - 264px)" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `72px repeat(${COURTS.length}, minmax(128px, 1fr))`,
            minWidth: `${72 + COURTS.length * 128}px`,
          }}
        >
          {/* Corner cell: sticky on both axes */}
          <div className="sticky left-0 top-0 z-25 border-b border-slate-200 bg-white" />

          {/* Court header cells: sticky top */}
          {COURTS.map((court) => (
            <div
              key={court.id}
              className="sticky top-0 z-20 border-b border-l border-slate-200 bg-white px-3 py-3 text-center"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {court.name}
              </span>
            </div>
          ))}

          {/* Time rows */}
          {Array.from({ length: SLOTS }, (_, slotIndex) => {
            const hour = START_HOUR + Math.floor(slotIndex / 2);
            const half = slotIndex % 2 === 1;

            return (
              <React.Fragment key={slotIndex}>
                {/* Time label cell: sticky left */}
                <div
                  className="sticky left-0 z-15 border-b border-slate-100 bg-white pr-3 pt-1 text-right"
                  style={{ height: SLOT_HEIGHT }}
                >
                  {!half && (
                    <span className="text-[11px] leading-none text-slate-400">
                      {formatSlotTime(hour, false)}
                    </span>
                  )}
                </div>

                {/* Court cells */}
                {COURTS.map((court) => {
                  const booking = dayBookings.find(
                    (b) =>
                      b.courtId === court.id &&
                      timeToSlotIndex(b.startTime) === slotIndex
                  );
                  const isOccupied = dayBookings.some((b) => {
                    if (b.courtId !== court.id) return false;
                    const s = timeToSlotIndex(b.startTime);
                    const e = timeToSlotIndex(b.endTime);
                    return slotIndex >= s && slotIndex < e;
                  });
                  const selected = isSlotSelected(court.id, slotIndex);

                  return (
                    <div
                      key={`${court.id}-${slotIndex}`}
                      className={[
                        "relative select-none border-b border-l border-slate-100 transition-colors",
                        !isOccupied && "cursor-pointer",
                        selected
                          ? "bg-[#8CC63F]/20 ring-1 ring-inset ring-[#8CC63F]/50"
                          : !isOccupied
                            ? "hover:bg-[#8CC63F]/10"
                            : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      style={{ height: SLOT_HEIGHT }}
                      onMouseDown={
                        isOccupied
                          ? undefined
                          : (e) => handleCellMouseDown(court.id, slotIndex, e)
                      }
                      onMouseEnter={() =>
                        handleCellMouseEnter(court.id, slotIndex)
                      }
                    >
                      {booking &&
                        (() => {
                          const startIdx = timeToSlotIndex(booking.startTime);
                          const endIdx = timeToSlotIndex(booking.endTime);
                          const spanSlots = endIdx - startIdx;
                          const confirmed = booking.status === "confirmed";
                          const lead = booking.teamA[0]?.name ?? "";

                          return (
                            <button
                              type="button"
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBooking(booking);
                              }}
                              className={[
                                "absolute inset-x-1 rounded-lg border px-2 py-1.5 text-left transition-opacity hover:opacity-80 active:scale-[0.98]",
                                confirmed
                                  ? "border-green-300 bg-green-100"
                                  : "border-yellow-300 bg-yellow-100",
                              ].join(" ")}
                              style={{
                                top: 2,
                                height: spanSlots * SLOT_HEIGHT - 4,
                                zIndex: 10,
                              }}
                            >
                              <span
                                className={[
                                  "block truncate text-[11px] font-semibold leading-tight",
                                  confirmed ? "text-green-800" : "text-yellow-800",
                                ].join(" ")}
                              >
                                {lead.split(" ")[0] || "—"}
                              </span>
                              {spanSlots > 1 && (
                                <span
                                  className={[
                                    "block text-[10px] leading-tight",
                                    confirmed
                                      ? "text-green-600"
                                      : "text-yellow-600",
                                  ].join(" ")}
                                >
                                  {format(
                                    new Date(booking.startTime),
                                    "h:mm a"
                                  )}{" "}
                                  –{" "}
                                  {format(new Date(booking.endTime), "h:mm a")}
                                </span>
                              )}
                            </button>
                          );
                        })()}
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Empty state */}
      {dayBookings.length === 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
          <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
          <p className="text-sm text-slate-500">{t("calendar.noBookings")}</p>
        </div>
      )}

      {/* Dialogs */}
      <NewBookingDialog
        open={showNewBooking}
        onClose={handleNewBookingClose}
        selection={selection}
        currentDate={selectedDate}
      />
      <TeamCardDialog
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />
    </div>
  );
}
