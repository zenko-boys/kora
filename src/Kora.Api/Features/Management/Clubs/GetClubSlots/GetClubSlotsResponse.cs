using Kora.Domain.Bookings;

namespace Kora.Features.Management.Clubs.GetClubSlots;

public record GetClubSlotsResponse(
    Guid ClubId,
    DateOnly Date,
    string TimeZoneId,
    int SlotCellDurationMinutes,
    List<CourtSchedule> Courts
);

public record CourtSchedule(
    Guid CourtId,
    string CourtName,
    List<ScheduleSlot> Slots
);

public record ScheduleSlot(
    DateTimeOffset StartTime,
    DateTimeOffset EndTime,
    bool Available,
    BookingInfo? Booking
);

public record BookingInfo(
    Guid BookingId,
    BookingType Type,
    int ParticipantsCount,
    int Capacity,
    bool IsPrivate,
    string? Description,
    List<BookingParticipantInfo> Participants
);

public record BookingParticipantInfo(Guid UserId, Team? Team);
