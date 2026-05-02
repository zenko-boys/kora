import type {
    BookingsFilter,
    BookingsResponse,
    CreateBookingRequest,
    CreateBookingResponse,
    JoinBookingResponse,
    LeaveBookingResponse,
} from "./types";
import { MOCK_BOOKINGS } from "./mock-data";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

async function apiFetch<T>(
    path: string,
    getToken: () => Promise<string | null>,
    options: RequestInit = {}
): Promise<T> {
    const token = await getToken();
    const res = await fetch(`${API_BASE}${path}`, {
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
            const params = new URLSearchParams();
            if (filters?.clubId) params.set("clubId", filters.clubId);
            if (filters?.type) params.set("type", filters.type);
            if (filters?.open !== undefined) params.set("open", String(filters.open));
            if (filters?.fromUtc) params.set("fromUtc", filters.fromUtc);
            if (filters?.toUtc) params.set("toUtc", filters.toUtc);
            const qs = params.toString();
            return apiFetch<BookingsResponse>(
                `/api/bookings${qs ? `?${qs}` : ""}`,
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
                `/api/bookings/${bookingId}/join`,
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
                `/api/bookings/${bookingId}/join`,
                getToken,
                { method: "DELETE" }
            );
        },

        createBooking: (clubId: string, body: CreateBookingRequest): Promise<CreateBookingResponse> => {
            if (USE_MOCK) {
                return Promise.resolve({ bookingId: crypto.randomUUID() });
            }
            return apiFetch<CreateBookingResponse>(
                `/api/clubs/${clubId}/bookings`,
                getToken,
                { method: "POST", body: JSON.stringify(body) }
            );
        },
    };
}
