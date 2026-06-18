export type BookingType = "Game" | "DayUse";

export interface BookingCard {
    bookingId: string;
    clubId: string;
    clubName: string;
    courtName: string;
    type: BookingType;
    startsAt: string;
    endsAt: string;
    timeZoneId: string;
    isPrivate: boolean;
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

export type BookingTeam = "TeamA" | "TeamB";

export interface BookingGuestRequest {
    name: string;
    email: string;
    team: BookingTeam;
    positionInTeam: number;
}

export interface CreateBookingRequest {
    type: BookingType;
    slots: string[];
    courtId?: string;
    courtsToOccupy?: number;
    capacity?: number;
    isPrivate?: boolean;
    description?: string;
    guests?: BookingGuestRequest[];
}

export interface JoinBookingResponse {
    bookingId: string;
    userId: string;
    participantsCount: number;
    capacity: number;
    team: "TeamA" | "TeamB" | null;
    positionInTeam: number | null;
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
    courtsCount?: number;
    rating?: number;
    imageUrl?: string;
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

// ---- Home / Player Stats ----

export interface Medal {
    id: string;
    name: string;
    description: string;
    iconUrl?: string;
    earnedAt: string;
}

export interface PlayerStats {
    gamesPlayed: number;
    gamesWon: number;
    gamesLost: number;
    rating: number;
    rank: string;
    rankPoints: number;
    rankPointsToNext: number;
    medals: Medal[];
}

export interface PlayerStatsResponse {
    stats: PlayerStats;
}

export interface UpcomingGame {
    bookingId: string;
    clubName: string;
    clubImageUrl?: string;
    courtName: string;
    type: BookingType;
    startsAt: string;
    endsAt: string;
    participantsCount: number;
    capacity: number;
}

export interface UpcomingGamesResponse {
    games: UpcomingGame[];
}

// ---- Feed ----

export type FeedItemType = "event" | "championship" | "post" | "photo" | "result";

export interface FeedItem {
    id: string;
    type: FeedItemType;
    title: string;
    body?: string;
    imageUrl?: string;
    clubName?: string;
    clubId?: string;
    publishedAt: string;
    linkUrl?: string;
    tags?: string[];
}

export interface FeedResponse {
    items: FeedItem[];
    nextCursor?: string;
}

// ---- Club Slots ----

export interface ClubSlotInfo {
    startTime: string; // ISO 8601 with club timezone offset, e.g. "2026-05-22T06:00:00-03:00"
    endTime: string;   // ISO 8601 with club timezone offset, e.g. "2026-05-22T06:30:00-03:00"
    available: boolean;
    availableCourts: number;
}

export interface GetClubSlotsResponse {
    clubId: string;
    date: string;
    timeZoneId: string;
    slotCellDurationMinutes: number;
    minimumBookingDurationMinutes: number;
    slots: ClubSlotInfo[];
}

// ---- Club Schedule (staff view) ----

export interface ScheduleBookingParticipant {
    userId: string;
    teamNumber: number | null;
}

export interface ScheduleBookingInfo {
    bookingId: string;
    type: BookingType;
    participantsCount: number;
    capacity: number;
    isPrivate: boolean;
    description: string | null;
    participants: ScheduleBookingParticipant[];
}

export interface ScheduleSlot {
    startTime: string; // ISO 8601 with club timezone offset
    endTime: string;
    available: boolean;
    booking: ScheduleBookingInfo | null;
}

export interface CourtSchedule {
    courtId: string;
    courtName: string;
    slots: ScheduleSlot[];
}

export interface GetClubScheduleResponse {
    clubId: string;
    date: string;
    timeZoneId: string;
    slotCellDurationMinutes: number;
    courts: CourtSchedule[];
}
