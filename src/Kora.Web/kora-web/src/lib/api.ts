import type {
    BookingsFilter,
    BookingsResponse,
    CreateBookingRequest,
    CreateBookingResponse,
    JoinBookingResponse,
    LeaveBookingResponse,
    ListMyClubsResponse,
    CreateClubRequest,
    CreateClubResponse,
    UpdateClubRequest,
    UpdateClubResponse,
    ListCourtsResponse,
    CreateCourtRequest,
    CreateCourtResponse,
    UpdateCourtRequest,
    UpdateCourtResponse,
} from "./types";
import { MOCK_BOOKINGS } from "./mock-data";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";
const API_V1 = `${API_BASE}/api/v1`;
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

async function apiFetch<T>(
    path: string,
    getToken: () => Promise<string | null>,
    options: RequestInit = {}
): Promise<T> {
    const token = await getToken({ template: "dev" });
    const res = await fetch(`${API_V1}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers ?? {}),
        },
    });

    if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(`API error ${res.status}: ${text}`);
    }

    if (res.status === 204 || res.headers.get("content-length") === "0") {
        return undefined as T;
    }

    return res.json() as Promise<T>;
}

export function createApiClient(getToken: () => Promise<string | null>) {
    return {
        getBookings: async (filters?: BookingsFilter): Promise<BookingsResponse> => {
            if (USE_MOCK) {
                await new Promise((r) => setTimeout(r, 500));
                let bookings = [...MOCK_BOOKINGS.bookings];
                if (filters?.type) bookings = bookings.filter((b) => b.type === filters.type);
                if (filters?.open) bookings = bookings.filter((b) => b.spotsOpen > 0);
                if (filters?.clubId) bookings = bookings.filter((b) => b.clubId === filters.clubId);
                return { bookings };
            }
            const BOOKING_TYPE_INT: Record<string, string> = { Game: "1", DayUse: "2" };
            const params = new URLSearchParams();
            if (filters?.clubId) params.set("clubId", filters.clubId);
            if (filters?.type) params.set("type", BOOKING_TYPE_INT[filters.type]);
            if (filters?.open !== undefined) params.set("open", String(filters.open));
            if (filters?.fromUtc) params.set("fromUtc", filters.fromUtc);
            if (filters?.toUtc) params.set("toUtc", filters.toUtc);
            const qs = params.toString();
            return apiFetch<BookingsResponse>(
                `/bookings${qs ? `?${qs}` : ""}`,

                getToken
            );
        },

        joinBooking: async (bookingId: string): Promise<JoinBookingResponse> => {
            if (USE_MOCK) {
                await new Promise((r) => setTimeout(r, 400));
                const booking = MOCK_BOOKINGS.bookings.find((b) => b.bookingId === bookingId);
                if (!booking) throw new Error("Booking not found");
                booking.amIIn = true;
                booking.participantsCount += 1;
                booking.spotsOpen = Math.max(0, booking.spotsOpen - 1);
                return {
                    bookingId,
                    userId: "mock-user",
                    participantsCount: booking.participantsCount,
                    capacity: booking.capacity,
                };
            }
            return apiFetch<JoinBookingResponse>(
                `/bookings/${bookingId}/join`,
                getToken,
                { method: "POST" }
            );
        },

        leaveBooking: async (bookingId: string): Promise<LeaveBookingResponse> => {
            if (USE_MOCK) {
                await new Promise((r) => setTimeout(r, 400));
                const booking = MOCK_BOOKINGS.bookings.find((b) => b.bookingId === bookingId);
                if (!booking) throw new Error("Booking not found");
                booking.amIIn = false;
                booking.participantsCount = Math.max(0, booking.participantsCount - 1);
                booking.spotsOpen += 1;
                return {
                    bookingId,
                    participantsCount: booking.participantsCount,
                    capacity: booking.capacity,
                };
            }
            return apiFetch<LeaveBookingResponse>(
                `/bookings/${bookingId}/join`,
                getToken,
                { method: "DELETE" }
            );
        },

        createBooking: (clubId: string, body: CreateBookingRequest): Promise<CreateBookingResponse> => {
            if (USE_MOCK) {
                return Promise.resolve({ bookingId: crypto.randomUUID() });
            }
            const BOOKING_TYPE_INT: Record<string, number> = { Game: 1, DayUse: 2 };
            return apiFetch<CreateBookingResponse>(
                `/bookings`,
                getToken,
                { method: "POST", body: JSON.stringify({ ...body, clubId, type: BOOKING_TYPE_INT[body.type] }) }
            );
        },

        deleteBooking: (bookingId: string): Promise<void> => {
            if (USE_MOCK) return Promise.resolve();
            return apiFetch<void>(
                `/bookings/${bookingId}`,
                getToken,
                { method: "DELETE" }
            );
        },

        getMyClubs: (): Promise<ListMyClubsResponse> => {
            if (USE_MOCK) return Promise.resolve({ clubs: [] });
            return apiFetch<ListMyClubsResponse>("/me/clubs", getToken);
        },

        createClub: (body: CreateClubRequest): Promise<CreateClubResponse> => {
            if (USE_MOCK) return Promise.resolve({ id: crypto.randomUUID() });
            return apiFetch<CreateClubResponse>("/clubs", getToken, {
                method: "POST",
                body: JSON.stringify(body),
            });
        },

        updateClub: (clubId: string, body: UpdateClubRequest): Promise<UpdateClubResponse> => {
            if (USE_MOCK) return Promise.resolve({ id: clubId });
            return apiFetch<UpdateClubResponse>(`/clubs/${clubId}`, getToken, {
                method: "PUT",
                body: JSON.stringify(body),
            });
        },

        getCourts: (clubId: string): Promise<ListCourtsResponse> => {
            if (USE_MOCK) return Promise.resolve({ courts: [] });
            return apiFetch<ListCourtsResponse>(`/clubs/${clubId}/courts`, getToken);
        },

        createCourt: (clubId: string, body: CreateCourtRequest): Promise<CreateCourtResponse> => {
            if (USE_MOCK) return Promise.resolve({ id: crypto.randomUUID() });
            return apiFetch<CreateCourtResponse>(`/clubs/${clubId}/courts`, getToken, {
                method: "POST",
                body: JSON.stringify(body),
            });
        },

        updateCourt: (
            clubId: string,
            courtId: string,
            body: UpdateCourtRequest
        ): Promise<UpdateCourtResponse> => {
            if (USE_MOCK) return Promise.resolve({ id: courtId, name: body.name });
            return apiFetch<UpdateCourtResponse>(
                `/clubs/${clubId}/courts/${courtId}`,
                getToken,
                { method: "PUT", body: JSON.stringify(body) }
            );
        },
    };
}
