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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { createApiClient } from "@/lib/api";
import { MANAGEMENT_ROLES } from "@/lib/constants";
import { useDateLocale } from "@/lib/useDateLocale";
import { useIsMobile } from "@/lib/useIsMobile";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import type {
  CourtSchedule,
  ScheduleSlot,
  ScheduleBookingInfo,
  BookingTeam,
} from "@/lib/types";
import { SLOT_HEIGHT, SLOTS, START_HOUR } from "./constants";
import { timeToSlotIndex, formatSlotTime } from "./helpers";
import { BookingPanel, type BookingFormData } from "./BookingPanel";
import { SlotBookingCard } from "./SlotBookingCard";
import { BookingDetailPanel } from "./BookingDetailPanel";
import { ClubSwitcher } from "./ClubSwitcher";
import type { SlotKey } from "./types";

export function CalendarClient({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const t = useTranslations("manage");
  const dateLocale = useDateLocale();
  const isMobile = useIsMobile();
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
  const weekLabel = `${format(weekStart, "d MMM", { locale: dateLocale })} – ${format(weekEnd, "d MMM yyyy", { locale: dateLocale })}`;
  const dayLabel = format(selectedDate, "EEEE, d MMM yyyy", { locale: dateLocale });
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

  useEffect(() => {
    if (managedClubs.length > 0 && !selectedClubId) {
      setSelectedClubId(managedClubs[0].clubId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [managedClubs.length]);

  // ── Schedule ──────────────────────────────────────────────────────────────────
  const { data: scheduleData, isLoading } = useQuery({
    queryKey: ["club-schedule", selectedClubId, dateStr],
    queryFn: () => api.getClubSchedule(selectedClubId, dateStr),
    enabled: !!selectedClubId,
  });
  const courts: CourtSchedule[] = scheduleData?.courts ?? [];

  const scheduleStartHour = useMemo(() => {
    const firstSlot = courts[0]?.slots[0];
    if (!firstSlot) return START_HOUR;
    return new Date(firstSlot.startTime).getHours();
  }, [courts]);

  const now = useMemo(() => new Date(), [dateStr]);

  const scheduleSlotCount = courts[0]?.slots.length ?? SLOTS;

  // courtId → (slotIndex → ScheduleSlot)
  const scheduleMap = useMemo(() => {
    const map = new Map<string, Map<number, ScheduleSlot>>();
    for (const court of courts) {
      const courtMap = new Map<number, ScheduleSlot>();
      for (const slot of court.slots) {
        courtMap.set(timeToSlotIndex(slot.startTime, scheduleStartHour), slot);
      }
      map.set(court.courtId, courtMap);
    }
    return map;
  }, [courts, scheduleStartHour]);

  // slotIndex → startTime ISO string (from first court; all courts share same times)
  const slotTimeMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const slot of courts[0]?.slots ?? []) {
      map.set(timeToSlotIndex(slot.startTime, scheduleStartHour), slot.startTime);
    }
    return map;
  }, [courts, scheduleStartHour]);

  // Tracks "courtId:slotIndex" keys that are the first slot of a booking span
  const bookingStartSet = useMemo(() => {
    const set = new Set<string>();
    for (const court of courts) {
      let prevId: string | null = null;
      for (const slot of court.slots) {
        const idx = timeToSlotIndex(slot.startTime, scheduleStartHour);
        if (slot.booking && slot.booking.bookingId !== prevId) {
          set.add(`${court.courtId}:${idx}`);
        }
        prevId = slot.booking?.bookingId ?? null;
      }
    }
    return set;
  }, [courts, scheduleStartHour]);

  function getBookingSpan(
    courtId: string,
    startIdx: number,
    bookingId: string
  ): number {
    const courtMap = scheduleMap.get(courtId);
    if (!courtMap) return 1;
    let span = 0;
    let idx = startIdx;
    while (courtMap.get(idx)?.booking?.bookingId === bookingId) {
      span++;
      idx++;
    }
    return span || 1;
  }

  function getBookingEndSlot(
    courtId: string,
    startIdx: number,
    bookingId: string
  ): ScheduleSlot | null {
    const courtMap = scheduleMap.get(courtId);
    if (!courtMap) return null;
    let endSlot: ScheduleSlot | null = null;
    let idx = startIdx;
    while (true) {
      const s = courtMap.get(idx);
      if (!s || s.booking?.bookingId !== bookingId) break;
      endSlot = s;
      idx++;
    }
    return endSlot;
  }

  // ── Selection ─────────────────────────────────────────────────────────────────
  const [selectionStart, setSelectionStart] = useState<SlotKey | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<SlotKey | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showBookingPanel, setShowBookingPanel] = useState(false);

  // Refs so imperative touch handlers can read current state without stale closures
  const isDraggingRef = useRef(false);
  const selectionStartRef = useRef<SlotKey | null>(null);
  useEffect(() => { isDraggingRef.current = isDragging; }, [isDragging]);
  useEffect(() => { selectionStartRef.current = selectionStart; }, [selectionStart]);
  const [viewingBookings, setViewingBookings] = useState<
    {
      booking: ScheduleBookingInfo;
      courtId: string;
      courtName: string;
      startSlot: ScheduleSlot;
      endSlot: ScheduleSlot;
      slotKeys: SlotKey[];
    }[]
  >([]);

  const closeViewingBooking = useCallback((bookingId: string) => {
    setViewingBookings((prev) => prev.filter((b) => b.booking.bookingId !== bookingId));
  }, []);

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
    document.addEventListener("touchend", handler);
    return () => {
      document.removeEventListener("mouseup", handler);
      document.removeEventListener("touchend", handler);
    };
  }, [isDragging, selectionStart, selectionEnd]);

  const handleCellMouseDown = useCallback(
    (courtId: string, slotIndex: number, e: React.MouseEvent) => {
      e.preventDefault();
      setSelectionStart({ courtId, slotIndex });
      setSelectionEnd({ courtId, slotIndex });
      setIsDragging(true);
      setShowBookingPanel(false);
      setViewingBookings([]);
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

  const queryClient = useQueryClient();

  const { mutate: submitBooking, isPending: isCreating } = useMutation({
    mutationFn: (data: BookingFormData) => {
      const slots = data.slotKeys
        .map((key) => slotTimeMap.get(key.slotIndex))
        .filter((s): s is string => !!s);

      const teamEntries: [
        (typeof data.teamA)[number],
        BookingTeam,
        number,
      ][] = [
        [data.teamA[0], "TeamA", 0],
        [data.teamA[1], "TeamA", 1],
        [data.teamB[0], "TeamB", 0],
        [data.teamB[1], "TeamB", 1],
      ];

      const guests: { name: string; email?: string; team: BookingTeam; positionInTeam: number }[] = [];
      const participants: { userId: string; team: BookingTeam; positionInTeam: number }[] = [];

      for (const [slot, team, positionInTeam] of teamEntries) {
        if (!slot) continue;
        if (slot.userId) {
          participants.push({ userId: slot.userId, team, positionInTeam });
        } else {
          const guest: { name: string; email?: string; team: BookingTeam; positionInTeam: number } = {
            name: slot.name,
            team,
            positionInTeam,
          };
          if (slot.email) guest.email = slot.email;
          guests.push(guest);
        }
      }

      return api.createBooking(selectedClubId, {
        type: "Game",
        slots,
        courtId: data.courtId,
        courtsToOccupy: 1,
        isPrivate: false,
        guests: guests.length > 0 ? guests : undefined,
        participants: participants.length > 0 ? participants : undefined,
      });
    },
    onSuccess: () => {
      handleBookingPanelClose();
      queryClient.invalidateQueries({
        queryKey: ["club-schedule", selectedClubId, dateStr],
      });
    },
  });

  function handleBookingPanelClose() {
    setShowBookingPanel(false);
    clearSelection();
  }

  function handleBookingConfirm(data: BookingFormData) {
    submitBooking(data);
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

  // Touch start/move — non-passive so we can preventDefault and block scroll
  useEffect(() => {
    const el = gridContainerRef.current;
    if (!el) return;

    function onTouchStart(e: TouchEvent) {
      const touch = e.touches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      const cell = target?.closest("[data-slot-index]") as HTMLElement | null;
      if (!cell) return;
      const courtId = cell.getAttribute("data-court-id");
      const slotIndex = Number(cell.getAttribute("data-slot-index"));
      if (!courtId || isNaN(slotIndex)) return;
      e.preventDefault();
      setSelectionStart({ courtId, slotIndex });
      setSelectionEnd({ courtId, slotIndex });
      setIsDragging(true);
      setShowBookingPanel(false);
      setViewingBookings([]);
    }

    function onTouchMove(e: TouchEvent) {
      if (!isDraggingRef.current || !selectionStartRef.current) return;
      e.preventDefault();
      const touch = e.touches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      const cell = target?.closest("[data-slot-index]") as HTMLElement | null;
      if (!cell) return;
      const courtId = cell.getAttribute("data-court-id");
      const slotIndex = Number(cell.getAttribute("data-slot-index"));
      if (!courtId || isNaN(slotIndex)) return;
      if (courtId !== selectionStartRef.current.courtId) return;
      setSelectionEnd({ courtId, slotIndex });
    }

    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
    };
  // re-registers when the ref mounts (null → element)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridContainerRef.current]);

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full flex-col space-y-4">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      {/* Calendar + right panel */}
      <div className="flex min-h-0 flex-1 gap-4">
        {/* Toolbar + grid + viewing-bookings list — fused into a single card */}
        <div className="flex min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {/* Toolbar: club switcher + date navigation */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-2.5">
            <ClubSwitcher
              clubs={managedClubs}
              selectedClubId={selectedClubId}
              onSelect={(id) => {
                setSelectedClubId(id);
                clearSelection();
                setShowBookingPanel(false);
                setViewingBookings([]);
              }}
              placeholder={t("calendar.selectClub")}
              formatCourtsCount={(count) => t("clubs.courtsCount", { count })}
            />

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
          </div>

          {/* Grid container */}
          <div
            ref={gridContainerRef}
            className="flex-1 overflow-x-auto overflow-y-hidden"
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
                  key={court.courtId}
                  data-header
                  className="sticky top-0 z-20 border-b border-l border-slate-200 bg-white px-3 py-3 text-center"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {court.courtName}
                  </span>
                </div>
              ))}

              {/* Time rows */}
              {Array.from({ length: scheduleSlotCount }, (_, slotIndex) => {
                const hour =
                  scheduleStartHour + Math.floor(slotIndex / 2);
                const half = slotIndex % 2 === 1;

                return (
                  <React.Fragment key={slotIndex}>
                    {/* Time label — rendered only on full hours, spans 2 slot rows */}
                    {!half && (
                      <div
                        className="sticky left-0 z-15 border-b border-slate-200 bg-white pr-3 pt-2 text-right"
                        style={{ height: slotHeight * 2, gridRow: "span 2" }}
                      >
                        <span className="text-[11px] leading-none text-slate-400">
                          {formatSlotTime(hour, false, dateLocale)}
                        </span>
                      </div>
                    )}

                    {/* Court cells */}
                    {courts.map((court) => {
                      const slotInfo = scheduleMap
                        .get(court.courtId)
                        ?.get(slotIndex);
                      const isOutsideHours = !slotInfo;
                      const isBooked = !!slotInfo?.booking;
                      const isPast = !!slotInfo && new Date(slotInfo.startTime) < now;
                      const isDisabled = isOutsideHours || isBooked || isPast;
                      const isBookingStart = bookingStartSet.has(
                        `${court.courtId}:${slotIndex}`
                      );
                      const selected = isSlotSelected(
                        court.courtId,
                        slotIndex
                      );

                      return (
                        <div
                          key={`${court.courtId}-${slotIndex}`}
                          data-court-id={isDisabled ? undefined : court.courtId}
                          data-slot-index={isDisabled ? undefined : String(slotIndex)}
                          className={[
                            "relative select-none border-b border-l border-slate-100 transition-colors",
                            isOutsideHours
                              ? "bg-slate-100"
                              : isPast
                                ? "bg-slate-200"
                                : isBooked
                                  ? "bg-rose-50"
                                  : "cursor-pointer",
                            selected
                              ? "bg-[#8CC63F]/20 ring-1 ring-inset ring-[#8CC63F]/50"
                              : !isDisabled
                                ? "hover:bg-[#8CC63F]/10"
                                : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          style={{ height: slotHeight }}
                          onMouseDown={
                            isDisabled
                              ? undefined
                              : (e) =>
                                  handleCellMouseDown(
                                    court.courtId,
                                    slotIndex,
                                    e
                                  )
                          }
                          onMouseEnter={() =>
                            handleCellMouseEnter(court.courtId, slotIndex)
                          }
                        >
                          {(() => {
                            if (!isBookingStart || !slotInfo?.booking)
                              return null;
                            const booking = slotInfo.booking;
                            const span = getBookingSpan(
                              court.courtId,
                              slotIndex,
                              booking.bookingId
                            );
                            const endSlot = getBookingEndSlot(
                              court.courtId,
                              slotIndex,
                              booking.bookingId
                            );
                            if (!endSlot) return null;
                            return (
                              <SlotBookingCard
                                booking={booking}
                                courtName={court.courtName}
                                startSlot={slotInfo}
                                endSlot={endSlot}
                                span={span}
                                slotHeight={slotHeight}
                                locale={dateLocale}
                                onClick={() =>
                                  setViewingBookings((prev) => {
                                    if (prev.some((b) => b.booking.bookingId === booking.bookingId)) {
                                      return prev;
                                    }
                                    return [
                                      ...prev,
                                      {
                                        booking,
                                        courtId: court.courtId,
                                        courtName: court.courtName,
                                        startSlot: slotInfo,
                                        endSlot,
                                        slotKeys: Array.from({ length: span }, (_, i) => ({
                                          courtId: court.courtId,
                                          slotIndex: slotIndex + i,
                                        })),
                                      },
                                    ];
                                  })
                                }
                              />
                            );
                          })()}
                        </div>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </div>
          )}
          </div>
        </div>

        {/* Viewing-bookings list — fused right column, attached to the same card (desktop only) */}
        {!isMobile && viewingBookings.length > 0 && (
          <div className="flex min-h-0 w-80 shrink-0 flex-col border-l border-slate-200">
            <div className="shrink-0 border-b border-slate-200 px-4 py-2.5">
              <p className="text-sm font-semibold text-slate-700">
                {t("calendar.selectedGames")} ({viewingBookings.length})
              </p>
            </div>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
              {viewingBookings.map((vb) => (
                <div
                  key={vb.booking.bookingId}
                  className="rounded-lg border border-slate-200"
                >
                  <BookingDetailPanel
                    booking={vb.booking}
                    courtName={vb.courtName}
                    startSlot={vb.startSlot}
                    endSlot={vb.endSlot}
                    locale={dateLocale}
                    onClose={() => closeViewingBooking(vb.booking.bookingId)}
                    standalone={false}
                    showCloseButton
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        </div>

        {/* Mobile: dialogs for viewing a booking / creating a booking */}
        {isMobile && (
          <>
            <Dialog
              open={viewingBookings.length > 0}
              onOpenChange={(open) => !open && setViewingBookings([])}
            >
              <DialogContent className="max-w-sm p-0">
                {viewingBookings.length > 0 && (
                  <BookingDetailPanel
                    booking={viewingBookings[viewingBookings.length - 1].booking}
                    courtName={viewingBookings[viewingBookings.length - 1].courtName}
                    startSlot={viewingBookings[viewingBookings.length - 1].startSlot}
                    endSlot={viewingBookings[viewingBookings.length - 1].endSlot}
                    locale={dateLocale}
                    onClose={() => setViewingBookings([])}
                    standalone={false}
                  />
                )}
              </DialogContent>
            </Dialog>

            <Dialog
              open={showBookingPanel}
              onOpenChange={(open) => !open && handleBookingPanelClose()}
            >
              <DialogContent className="max-w-sm p-0">
                <BookingPanel
                  selection={selection}
                  courts={courts.map((c) => ({
                    id: c.courtId,
                    name: c.courtName,
                  }))}
                  selectedDate={selectedDate}
                  startHour={scheduleStartHour}
                  onClose={handleBookingPanelClose}
                  onConfirm={handleBookingConfirm}
                  isPending={isCreating}
                  standalone={false}
                />
              </DialogContent>
            </Dialog>
          </>
        )}

        {/* Desktop: booking-creation panel (separate floating card) */}
        {!isMobile && showBookingPanel && (
          <BookingPanel
            selection={selection}
            courts={courts.map((c) => ({
              id: c.courtId,
              name: c.courtName,
            }))}
            selectedDate={selectedDate}
            startHour={scheduleStartHour}
            onClose={handleBookingPanelClose}
            onConfirm={handleBookingConfirm}
            isPending={isCreating}
          />
        )}
      </div>
    </div>
  );
}
