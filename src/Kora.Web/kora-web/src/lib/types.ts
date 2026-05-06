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

// ---- Clubs ----

export interface MyClubSummary {
    clubId: string;
    name: string;
    timeZoneId: string;
    role: string;
}

export interface ListMyClubsResponse {
    clubs: MyClubSummary[];
}

export interface OperatingHoursRequest {
    dayOfWeek: number; // 0=Sunday … 6=Saturday
    openTime: string;  // "HH:mm:ss"
    closeTime: string; // "HH:mm:ss"
}

export interface CreateClubRequest {
    name: string;
    timeZoneId: string;
    slotCellDurationMinutes: number;
    minimumBookingDurationMinutes: number;
    operatingHours: OperatingHoursRequest[];
}

export interface CreateClubResponse {
    id: string;
}

export interface UpdateClubRequest {
    name: string;
    operatingHours: OperatingHoursRequest[];
}

export interface UpdateClubResponse {
    id: string;
}

// ---- Courts ----

export interface CourtSummary {
    id: string;
    name: string;
    createdAt: string;
}

export interface ListCourtsResponse {
    courts: CourtSummary[];
}

export interface CreateCourtRequest {
    name: string;
}

export interface CreateCourtResponse {
    id: string;
}

export interface UpdateCourtRequest {
    name: string;
}

export interface UpdateCourtResponse {
    id: string;
    name: string;
}
