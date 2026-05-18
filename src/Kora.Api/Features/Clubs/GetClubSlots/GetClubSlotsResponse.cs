namespace Kora.Features.Clubs.GetClubSlots;

public record GetClubSlotsResponse(
    Guid ClubId,
    DateOnly Date,
    string TimeZoneId,
    int SlotCellDurationMinutes,
    int MinimumBookingDurationMinutes,
    List<SlotInfo> Slots
);

public record SlotInfo(
    DateTimeOffset StartTime,
    DateTimeOffset EndTime,
    bool Available,
    int AvailableCourts
);
