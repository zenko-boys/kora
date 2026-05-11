using Kora.Domain.Bookings;

namespace Kora.Features.Bookings.CreateBooking;

public record CreateBookingRequest(
    Guid ClubId,
    BookingType Type,
    DateTime[] Slots,
    int? CourtsToOccupy,
    int? Capacity
);
