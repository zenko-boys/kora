namespace Kora.Features.Management.Bookings.RemoveParticipant;

public record RemoveParticipantResponse(
    Guid BookingId,
    Guid UserId,
    int ParticipantCount,
    int Capacity);
