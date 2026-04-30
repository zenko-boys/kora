using Kora.Domain.Bookings;

namespace Kora.Features.Bookings.ListBookings;

public record ListBookingsResponse(List<BookingSummary> Bookings);

public record BookingSummary(
    Guid BookingId,
    Guid ClubId,
    string ClubName,
    string CourtName,
    BookingType Type,
    DateTime StartsAtUtc,
    DateTime EndsAtUtc,
    int ParticipantsCount,
    int Capacity,
    int SpotsOpen,
    bool AmIIn
);
