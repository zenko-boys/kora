namespace Kora.Features.Bookings.LeaveBooking;

public record LeaveBookingResponse(
    Guid BookingId,
    int ParticipantsCount,
    int Capacity
);
