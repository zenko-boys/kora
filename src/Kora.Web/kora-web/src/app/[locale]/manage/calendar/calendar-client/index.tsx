"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { format, addDays, subDays, startOfWeek, endOfWeek } from "date-fns";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { createApiClient } from "@/lib/api";
import { MANAGEMENT_ROLES } from "@/lib/constants";
import type { CourtSummary, ClubSlotInfo } from "@/lib/types";
import { SLOT_HEIGHT, SLOTS, START_HOUR } from "./constants";
import { timeToSlotIndex, formatSlotTime } from "./helpers";
import { BookingPanel, type BookingFormData } from "./BookingPanel";
import type { SlotKey } from "./types";

export function CalendarClient({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const t = useTranslations("manage");
  const { getToken } = useAuth();
  const api = useMemo(
    () => createApiClient(async (opts) => getToken(opts)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // ── Date ──────────────────────────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekLabel = `${format(weekStart, "MMM d")} – ${format(weekEnd, "d, yyyy")}`;
  const dayLabel = format(selectedDate, "EEEE, MMM d, yyyy");
  const dateStr = format(selectedDate, "yyyy-MM-dd");

  // ── Club ──────────────────────────────────────────────────────────────────────
  const [selectedClubId, setSelectedClubId] = useState("");

  const { data: clubsData } = useQuery({
    queryKey: ["my-clubs"],
    queryFn: () => api.getMyClubs(),
  });
  const managedClubs = (clubsData?.clubs ?? []).filter((c) =>
    MANAGEMENT_ROLES.includes(c.role)
  );

  // ── Courts ────────────────────────────────────────────────────────────────────
  const { data: courtsData, isLoading: courtsLoading } = useQuery({
    queryKey: ["courts", selectedClubId],
    queryFn: () => api.getCourts(selectedClubId),
    enabled: !!selectedClubId,
  });
  const courts: CourtSummary[] = courtsData?.courts ?? [];

  // ── Slots ─────────────────────────────────────────────────────────────────────
  const { data: slotsData, isLoading: slotsLoading } = useQuery({
    queryKey: ["club-slots", selectedClubId, dateStr],
    queryFn: () => api.getClubSlots(selectedClubId, dateStr),
    enabled: !!selectedClubId,
  });

  const isLoading = courtsLoading || slotsLoading;

  const scheduleStartHour = useMemo(() => {
    const first = slotsData?.slots[0];
    if (!first) return START_HOUR;
    return new Date(first.startTime).getHours();
  }, [slotsData]);

  const scheduleSlotCount = slotsData?.slots.length ?? SLOTS;

  // slotIndex → ClubSlotInfo (club-wide, same for every court column)
  const slotMap = useMemo(() => {
    const map = new Map<number, ClubSlotInfo>();
    for (const slot of slotsData?.slots ?? []) {
      map.set(timeToSlotIndex(slot.startTime, scheduleStartHour), slot);
    }
    return map;
  }, [slotsData, scheduleStartHour]);

  // ── Selection ─────────────────────────────────────────────────────────────────
  const [selectionStart, setSelectionStart] = useState<SlotKey | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<SlotKey | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showBookingPanel, setShowBookingPanel] = useState(false);

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

  useEffect(() => {
    const handler = () => {
      if (!isDragging) return;
      setIsDragging(false);
      if (
        selectionStart &&
        selectionEnd &&
        selectionStart.courtId === selectionEnd.courtId
      ) {
        setShowBookingPanel(true);
      }
    };
    document.addEventListener("mouseup", handler);
    return () => document.removeEventListener("mouseup", handler);
  }, [isDragging, selectionStart, selectionEnd]);

  const handleCellMouseDown = useCallback(
    (courtId: string, slotIndex: number, e: React.MouseEvent) => {
      e.preventDefault();
      setSelectionStart({ courtId, slotIndex });
      setSelectionEnd({ courtId, slotIndex });
      setIsDragging(true);
      setShowBookingPanel(false);
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

  function handleBookingPanelClose() {
    setShowBookingPanel(false);
    clearSelection();
  }

  function handleBookingConfirm(_data: BookingFormData) {
    // TODO: call api.createBooking
    handleBookingPanelClose();
  }

  // ── Dynamic slot height ───────────────────────────────────────────────────────
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [slotHeight, setSlotHeight] = useState(SLOT_HEIGHT);

  const computeSlotHeight = useCallback(() => {
    const el = gridContainerRef.current;
    if (!el) return;
    const header = el.querySelector<HTMLElement>("[data-header]");
    const headerH = header?.offsetHeight ?? 40;
    setSlotHeight(
      Math.max(20, Math.floor((el.clientHeight - headerH) / scheduleSlotCount))
    );
  }, [scheduleSlotCount]);

  useEffect(() => {
    computeSlotHeight();
    const el = gridContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(computeSlotHeight);
    ro.observe(el);
    return () => ro.disconnect();
  }, [computeSlotHeight]);

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full flex-col space-y-4">
      {/* Page header + club selector */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <Select
          value={selectedClubId}
          onValueChange={(v) => {
            setSelectedClubId(v ?? "");
            clearSelection();
            setShowBookingPanel(false);
          }}
        >
          <SelectTrigger className="w-52">
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

      {/* Calendar + booking panel */}
      <div className="flex min-h-0 flex-1 gap-4">
        {/* Grid container */}
        <div
          ref={gridContainerRef}
          className="flex-1 overflow-x-auto overflow-y-hidden rounded-xl border border-slate-200 bg-white"
        >
          {/* No club selected */}
          {!selectedClubId && (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
              <CalendarDays className="h-8 w-8" />
              <p className="text-sm">{t("calendar.selectClubToView")}</p>
            </div>
          )}

          {/* Loading */}
          {selectedClubId && isLoading && (
            <div className="flex h-full items-center justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-[#8CC63F]" />
            </div>
          )}

          {/* No courts */}
          {selectedClubId && !isLoading && courts.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
              <CalendarDays className="h-8 w-8" />
              <p className="text-sm">{t("calendar.noBookings")}</p>
            </div>
          )}

          {/* Grid */}
          {courts.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `72px repeat(${courts.length}, minmax(128px, 1fr))`,
                minWidth: `${72 + courts.length * 128}px`,
              }}
            >
              {/* Corner */}
              <div
                data-header
                className="sticky left-0 top-0 z-25 border-b border-slate-200 bg-white"
              />

              {/* Court headers */}
              {courts.map((court) => (
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
              {Array.from({ length: scheduleSlotCount }, (_, slotIndex) => {
                const hour = scheduleStartHour + Math.floor(slotIndex / 2);
                const half = slotIndex % 2 === 1;
                const slotInfo = slotMap.get(slotIndex);
                const isOccupied = slotInfo ? !slotInfo.available : false;
                const isOutsideHours = !slotInfo;

                return (
                  <React.Fragment key={slotIndex}>
                    {/* Time label */}
                    <div
                      className="sticky left-0 z-15 border-b border-slate-100 bg-white pr-3 pt-1 text-right"
                      style={{ height: slotHeight }}
                    >
                      {!half && (
                        <span className="text-[11px] leading-none text-slate-400">
                          {formatSlotTime(hour, false)}
                        </span>
                      )}
                    </div>

                    {/* Court cells */}
                    {courts.map((court) => {
                      const selected = isSlotSelected(court.id, slotIndex);

                      return (
                        <div
                          key={`${court.id}-${slotIndex}`}
                          className={[
                            "relative select-none border-b border-l border-slate-100 transition-colors",
                            isOutsideHours
                              ? "bg-slate-50/60"
                              : isOccupied
                                ? "bg-slate-100/80"
                                : "cursor-pointer",
                            selected
                              ? "bg-[#8CC63F]/20 ring-1 ring-inset ring-[#8CC63F]/50"
                              : !isOccupied && !isOutsideHours
                                ? "hover:bg-[#8CC63F]/10"
                                : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          style={{ height: slotHeight }}
                          onMouseDown={
                            isOccupied || isOutsideHours
                              ? undefined
                              : (e) =>
                                  handleCellMouseDown(court.id, slotIndex, e)
                          }
                          onMouseEnter={() =>
                            handleCellMouseEnter(court.id, slotIndex)
                          }
                        />
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>

        {/* Booking panel */}
        {showBookingPanel && (
          <BookingPanel
            selection={selection}
            courts={courts}
            selectedDate={selectedDate}
            startHour={scheduleStartHour}
            onClose={handleBookingPanelClose}
            onConfirm={handleBookingConfirm}
          />
        )}
      </div>
    </div>
  );
}
