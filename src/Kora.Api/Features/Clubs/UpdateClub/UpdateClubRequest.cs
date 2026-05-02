namespace Kora.Features.Clubs.UpdateClub;

public record UpdateClubRequest(
    string Name,
    List<UpdateClubOperatingHoursRequest> OperatingHours
);

public record UpdateClubOperatingHoursRequest(
    DayOfWeek DayOfWeek,
    TimeOnly OpenTime,
    TimeOnly CloseTime
);
