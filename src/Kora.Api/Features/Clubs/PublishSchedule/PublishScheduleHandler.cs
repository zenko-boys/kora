using Kora.Common.Handlers;
using Kora.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Kora.Features.Clubs.PublishSchedule;

public class PublishScheduleHandler : IHandler
{
    private readonly AppDbContext _db;

    public PublishScheduleHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PublishScheduleResponse> Handle(
        Guid clubId,
        CancellationToken ct)
    {
        var clubExists = await _db.Clubs.AnyAsync(c => c.Id == clubId, ct);
        if (!clubExists)
        {
            throw new InvalidOperationException("Club not found.");
        }

        var publishedCount = await _db.Slots
            .Where(s => s.ClubId == clubId && !s.IsPublished)
            .ExecuteUpdateAsync(s => s.SetProperty(x => x.IsPublished, true), ct);

        return new PublishScheduleResponse(publishedCount);
    }
}
