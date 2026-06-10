using Kora.Common.Errors;
using Kora.Common.Handlers;
using Kora.Domain.Courts;
using Kora.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Kora.Features.Management.Courts.CreateCourt;

public class CreateCourtHandler : IHandler
{
    private readonly AppDbContext _db;

    public CreateCourtHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<CreateCourtResponse> Handle(Guid clubId, CreateCourtRequest request, CancellationToken ct)
    {
        var clubExists = await _db.Clubs.AnyAsync(c => c.Id == clubId, ct);
        if (!clubExists)
            throw new NotFoundException("Club not found.");

        var court = new Court
        {
            Id = Guid.NewGuid(),
            ClubId = clubId,
            Name = request.Name,
            CreatedAt = DateTime.UtcNow
        };

        _db.Courts.Add(court);
        await _db.SaveChangesAsync(ct);

        return new CreateCourtResponse(court.Id);
    }
}
