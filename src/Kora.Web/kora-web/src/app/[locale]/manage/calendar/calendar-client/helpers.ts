import { format, setHours, setMinutes, startOfDay } from "date-fns";
import type { Locale } from "date-fns";
import { START_HOUR } from "./constants";

export function timeToSlotIndex(isoStr: string, startHour = START_HOUR): number {
  const d = new Date(isoStr);
  return (d.getHours() - startHour) * 2 + Math.floor(d.getMinutes() / 30);
}

export function formatSlotTime(hour: number, half: boolean, locale?: Locale): string {
  const d = setMinutes(setHours(startOfDay(new Date()), hour), half ? 30 : 0);
  return format(d, "p", { locale });
}
