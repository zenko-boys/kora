namespace Kora.Features.Courts.ListCourts;

public record ListCourtsResponse(List<CourtSummary> Courts);

public record CourtSummary(
    Guid Id,
    string Name,
    DateTime CreatedAt
);
