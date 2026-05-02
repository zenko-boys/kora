namespace Kora.Features.Users.ListMyClubs;

public record ListMyClubsResponse(List<MyClubSummary> Clubs);

public record MyClubSummary(
    Guid ClubId,
    string Name,
    string TimeZoneId,
    string Role
);
