namespace Kora.Features.Clubs.CreateClub;

public record CreateClubRequest(
    string Name,
    int SlotCellDurationMinutes,
    int MinimumBookingDurationMinutes,
    List<CreateClubOperatingHoursRequest> OperatingHours
);

public record CreateClubOperatingHoursRequest(
    DayOfWeek DayOfWeek,
    TimeOnly OpenTime,
    TimeOnly CloseTime
);
