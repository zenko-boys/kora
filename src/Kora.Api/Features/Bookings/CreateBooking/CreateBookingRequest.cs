using Kora.Domain.Bookings;

namespace Kora.Features.Bookings.CreateBooking;

public record GuestInput(string Name, string? Email, Team? Team, int? PositionInTeam);

public record ParticipantInput(Guid UserId, Team? Team, int? PositionInTeam);

public record CreateBookingRequest(
    Guid ClubId,
    BookingType Type,
    DateTimeOffset[] Slots,
    int? CourtsToOccupy,
    int? Capacity,
    bool IsPrivate,
    string? Description,
    Guid? CourtId,
    GuestInput[]? Guests,
    ParticipantInput[]? Participants
);
