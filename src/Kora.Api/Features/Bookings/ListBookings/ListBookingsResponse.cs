using Kora.Domain.Bookings;

namespace Kora.Features.Bookings.ListBookings;

public record ListBookingsResponse(List<BookingSummary> Bookings);

public record BookingSummary(
    Guid BookingId,
    Guid ClubId,
    string ClubName,
    string TimeZoneId,
    string CourtName,
    BookingType Type,
    bool IsPrivate,
    DateTimeOffset StartsAt,
    DateTimeOffset EndsAt,
    int ParticipantsCount,
    int Capacity,
    int SpotsOpen,
    bool AmIIn
);
