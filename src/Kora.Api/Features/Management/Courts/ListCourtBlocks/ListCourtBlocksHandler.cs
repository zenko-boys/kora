using Kora.Common.Handlers;
using Kora.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Kora.Features.Management.Courts.ListCourtBlocks;

public class ListCourtBlocksHandler : IHandler
{
    private readonly AppDbContext _db;

    public ListCourtBlocksHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ListCourtBlocksResponse> Handle(Guid clubId, Guid courtId, CancellationToken ct)
    {
        var blocks = await _db.CourtBlocks
            .Where(b => b.CourtId == courtId && b.Court!.ClubId == clubId)
            .OrderBy(b => b.StartsAt)
            .Select(b => new CourtBlockItem(
                b.Id,
                b.CourtId,
                new DateTimeOffset(b.StartsAt, TimeSpan.Zero),
                new DateTimeOffset(b.EndsAt, TimeSpan.Zero),
                b.Reason))
            .ToListAsync(ct);

        return new ListCourtBlocksResponse(blocks);
    }
}
