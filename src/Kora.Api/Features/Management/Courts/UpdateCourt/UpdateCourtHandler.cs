using Kora.Common.Errors;
using Kora.Common.Handlers;
using Kora.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Kora.Features.Management.Courts.UpdateCourt;

public class UpdateCourtHandler : IHandler
{
    private readonly AppDbContext _db;

    public UpdateCourtHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<UpdateCourtResponse> Handle(Guid clubId, Guid courtId, UpdateCourtRequest request, CancellationToken ct)
    {
        var court = await _db.Courts
            .FirstOrDefaultAsync(c => c.Id == courtId && c.ClubId == clubId, ct);

        if (court is null)
            throw new NotFoundException("Court not found.");

        court.Name = request.Name;
        await _db.SaveChangesAsync(ct);

        return new UpdateCourtResponse(court.Id, court.Name);
    }
}
