using Kora.Domain.Bookings;

namespace Kora.Features.Management.Bookings.AddParticipant;

public record AddParticipantRequest(Guid UserId, Team? Team, int? PositionInTeam);
