import type { Court, Booking } from "./types";

export const COURTS: Court[] = [
  { id: "c1", name: "Padel 1" },
  { id: "c2", name: "Padel 2" },
  { id: "c3", name: "Padel 3" },
  { id: "c4", name: "Padel 4" },
  { id: "c5", name: "Padel 5" },
  { id: "c6", name: "Padel 6" },
];

export const MOCK_PLAYERS = [
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

export const START_HOUR = 8;
export const END_HOUR = 22;
export const SLOT_HEIGHT = 56;
export const SLOTS = (END_HOUR - START_HOUR) * 2;

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

export const MOCK_BOOKINGS: Booking[] = [
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
