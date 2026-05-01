using Kora.Domain.Bookings;

namespace Kora.Features.Bookings.CreateBooking;

public record CreateBookingRequest(
    BookingType Type,
    DateTime StartsAt,
    int DurationMinutes,
    int? CourtsToOccupy,
    int? Capacity
);
