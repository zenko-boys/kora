using Kora.Common.Handlers;
using Kora.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Kora.Features.Courts.ListCourts;

public class ListCourtsHandler : IHandler
{
    private readonly AppDbContext _db;

    public ListCourtsHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ListCourtsResponse> Handle(Guid clubId, CancellationToken ct)
    {
        var clubExists = await _db.Clubs.AnyAsync(c => c.Id == clubId, ct);
        if (!clubExists)
        {
            throw new InvalidOperationException("Club not found.");
        }

        var courts = await _db.Courts
            .Where(c => c.ClubId == clubId)
            .OrderBy(c => c.Name)
            .Select(c => new CourtSummary(c.Id, c.Name, c.CreatedAt))
            .ToListAsync(ct);

        return new ListCourtsResponse(courts);
    }
}
