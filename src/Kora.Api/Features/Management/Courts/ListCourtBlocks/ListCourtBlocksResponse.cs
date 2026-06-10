namespace Kora.Features.Management.Courts.ListCourtBlocks;

public record CourtBlockItem(Guid Id, Guid CourtId, DateTimeOffset StartsAt, DateTimeOffset EndsAt, string? Reason);

public record ListCourtBlocksResponse(List<CourtBlockItem> Blocks);
