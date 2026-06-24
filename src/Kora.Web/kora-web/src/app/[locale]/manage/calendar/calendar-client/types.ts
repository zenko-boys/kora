export type Court = { id: string; name: string };
export type TeamSlot = { name: string; email: string } | null;
export type Booking = {
  id: string;
  courtId: string;
  startTime: string;
  endTime: string;
  status: "confirmed" | "pending";
  teamA: [TeamSlot, TeamSlot];
  teamB: [TeamSlot, TeamSlot];
};
export type SlotKey = { courtId: string; slotIndex: number };
