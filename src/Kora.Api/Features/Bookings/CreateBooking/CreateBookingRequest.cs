using Kora.Domain.Bookings;

namespace Kora.Features.Bookings.CreateBooking;

public record CreateBookingRequest(
    Guid ClubId,
    BookingType Type,
    DateTimeOffset[] Slots,
    int? CourtsToOccupy,
    int? Capacity,
    bool IsPrivate,
    string? Description
);
