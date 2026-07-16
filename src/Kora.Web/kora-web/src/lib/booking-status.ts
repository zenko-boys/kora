export type BookingStatus = "upcoming" | "inProgress" | "finished";

export function getBookingStatus(booking: { startsAt: string; endsAt: string }): BookingStatus {
    const now = Date.now();
    const start = new Date(booking.startsAt).getTime();
    const end = new Date(booking.endsAt).getTime();
    if (now >= end) return "finished";
    if (now >= start) return "inProgress";
    return "upcoming";
}
