using Kora.Common.Errors;
using Kora.Common.Handlers;
using Kora.Domain.Courts;
using Kora.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Kora.Features.Management.Courts.BlockCourt;

public class BlockCourtHandler : IHandler
{
    private readonly AppDbContext _db;

    public BlockCourtHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<BlockCourtResponse> Handle(Guid clubId, Guid courtId, BlockCourtRequest request, CancellationToken ct)
    {
        var court = await _db.Courts.FirstOrDefaultAsync(c => c.Id == courtId && c.ClubId == clubId, ct);
        if (court is null)
            throw new NotFoundException("Court not found.");

        var block = new CourtBlock
        {
            Id = Guid.NewGuid(),
            CourtId = courtId,
            StartsAt = request.StartsAt.UtcDateTime,
            EndsAt = request.EndsAt.UtcDateTime,
            Reason = request.Reason
        };

        _db.CourtBlocks.Add(block);
        await _db.SaveChangesAsync(ct);

        return new BlockCourtResponse(block.Id);
    }
}
