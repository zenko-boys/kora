using Kora.Common.Errors;
using Kora.Common.Handlers;
using Kora.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Kora.Features.Management.Courts.UnblockCourt;

public class UnblockCourtHandler : IHandler
{
    private readonly AppDbContext _db;

    public UnblockCourtHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task Handle(Guid clubId, Guid courtId, Guid blockId, CancellationToken ct)
    {
        var block = await _db.CourtBlocks
            .FirstOrDefaultAsync(b => b.Id == blockId && b.CourtId == courtId && b.Court!.ClubId == clubId, ct);

        if (block is null)
            throw new NotFoundException("Block not found.");

        _db.CourtBlocks.Remove(block);
        await _db.SaveChangesAsync(ct);
    }
}
