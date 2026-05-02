export type BookingType = "Game" | "DayUse";

export interface BookingCard {
    bookingId: string;
    clubId: string;
    clubName: string;
    courtName: string;
    type: BookingType;
    startsAtUtc: string;
    endsAtUtc: string;
    participantsCount: number;
    capacity: number;
    spotsOpen: number;
    amIIn: boolean;
}

export interface BookingsResponse {
    bookings: BookingCard[];
}

export interface BookingsFilter {
    clubId?: string;
    type?: BookingType;
    open?: boolean;
    fromUtc?: string;
    toUtc?: string;
}

export interface CreateBookingRequest {
    type: BookingType;
    startsAt: string;
    durationMinutes: number;
    courtsToOccupy?: number;
    capacity?: number;
}

export interface JoinBookingResponse {
    bookingId: string;
    userId: string;
    participantsCount: number;
    capacity: number;
}

export interface CreateBookingResponse {
    bookingId: string;
}

export interface LeaveBookingResponse {
    bookingId: string;
    participantsCount: number;
    capacity: number;
}
