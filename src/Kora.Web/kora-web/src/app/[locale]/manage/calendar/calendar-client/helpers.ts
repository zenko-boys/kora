import { START_HOUR } from "./constants";

export function timeToSlotIndex(isoStr: string): number {
  const d = new Date(isoStr);
  return (d.getHours() - START_HOUR) * 2 + Math.floor(d.getMinutes() / 30);
}

export function formatSlotTime(hour: number, half: boolean): string {
  const m = half ? 30 : 0;
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const period = hour < 12 ? "AM" : "PM";
  return `${h12}:${m === 0 ? "00" : "30"} ${period}`;
}
