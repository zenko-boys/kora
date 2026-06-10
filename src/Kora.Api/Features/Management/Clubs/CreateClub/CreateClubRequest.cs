namespace Kora.Features.Management.Clubs.CreateClub;

public record CreateClubRequest(
    string Name,
    string TimeZoneId,
    int SlotCellDurationMinutes,
    int MinimumBookingDurationMinutes,
    List<CreateClubOperatingHoursRequest> OperatingHours
);

public record CreateClubOperatingHoursRequest(
    DayOfWeek DayOfWeek,
    TimeOnly OpenTime,
    TimeOnly CloseTime
);
