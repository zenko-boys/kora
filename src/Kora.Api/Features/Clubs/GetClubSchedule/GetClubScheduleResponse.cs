using Kora.Domain.Bookings;

namespace Kora.Features.Clubs.GetClubSchedule;

public record GetClubScheduleResponse(
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
    string? Description
);
