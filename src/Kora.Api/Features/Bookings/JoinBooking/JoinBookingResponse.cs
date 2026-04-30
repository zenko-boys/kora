namespace Kora.Features.Bookings.JoinBooking;

public record JoinBookingResponse(
    Guid BookingId,
    Guid UserId,
    int ParticipantsCount,
    int Capacity
);
