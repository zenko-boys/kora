"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { useDateLocale } from "@/lib/useDateLocale";
import { CalendarDays } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { createApiClient } from "@/lib/api";
import type { CourtSummary } from "@/lib/types";
import { MANAGEMENT_ROLES } from "@/lib/constants";
import { START_HOUR } from "./constants";
import { formatSlotTime } from "./helpers";
import type { SlotKey } from "./types";

export function NewBookingDialog({
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
  const dateLocale = useDateLocale();
  const { getToken } = useAuth();
  const api = createApiClient(async (opts) => getToken(opts));

  const [clubId, setClubId] = useState("");
  const [courtId, setCourtId] = useState("");
  const [bookingDate, setBookingDate] = useState(currentDate);
  const [bookingType, setBookingType] = useState("game");
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const { data: clubsData } = useQuery({
    queryKey: ["my-clubs"],
    queryFn: () => api.getMyClubs(),
  });
  const managedClubs = (clubsData?.clubs ?? []).filter((c) =>
    MANAGEMENT_ROLES.includes(c.role)
  );

  const { data: courtsData, isLoading: courtsLoading } = useQuery({
    queryKey: ["courts", clubId],
    queryFn: () => api.getCourts(clubId),
    enabled: !!clubId,
  });
  const availableCourts: CourtSummary[] = courtsData?.courts ?? [];

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

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              {t("calendar.date")}
            </Label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger className="flex w-full items-center gap-2 rounded-lg border border-input bg-transparent px-2.5 py-2 text-left text-sm transition-colors hover:bg-accent">
                <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
                {format(bookingDate, "PPP", { locale: dateLocale })}
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

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              {t("calendar.type")}
            </Label>
            <Select
              value={bookingType}
              onValueChange={(v) => setBookingType(v ?? "game")}
            >
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
