using Kora.Domain.Bookings;

namespace Kora.Features.Bookings.GetBooking;

public record GetBookingResponse(
    Guid BookingId,
    Guid ClubId,
    string ClubName,
    string TimeZoneId,
    List<string> CourtNames,
    BookingType Type,
    bool IsPrivate,
    string? Description,
    DateTimeOffset StartsAt,
    DateTimeOffset EndsAt,
    int Capacity,
    int SpotsOpen,
    bool AmIIn,
    List<BookingParticipantDto> Participants,
    List<BookingGuestDto> Guests
);

public record BookingParticipantDto(Guid UserId, string Name, string Email, Team? Team, int? PositionInTeam);

public record BookingGuestDto(Guid Id, string Name, string? Email, Team? Team, int? PositionInTeam);
