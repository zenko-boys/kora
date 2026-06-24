using Kora.Domain.Bookings;

namespace Kora.Features.Management.Bookings.AddParticipant;

public record AddParticipantResponse(
    Guid BookingId,
    Guid UserId,
    int ParticipantCount,
    int Capacity,
    Team? Team,
    int? PositionInTeam);
