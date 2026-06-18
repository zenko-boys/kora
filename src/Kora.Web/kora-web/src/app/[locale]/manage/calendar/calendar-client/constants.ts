import type { Court } from "./types";

export const COURTS: Court[] = [
  { id: "c1", name: "Padel 1" },
  { id: "c2", name: "Padel 2" },
  { id: "c3", name: "Padel 3" },
  { id: "c4", name: "Padel 4" },
  { id: "c5", name: "Padel 5" },
  { id: "c6", name: "Padel 6" },
];

export const START_HOUR = 8;
export const END_HOUR = 22;
export const SLOT_HEIGHT = 56;
export const SLOTS = (END_HOUR - START_HOUR) * 2;
