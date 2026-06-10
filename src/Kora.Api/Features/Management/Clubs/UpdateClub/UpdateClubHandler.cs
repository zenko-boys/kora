using Kora.Common.Errors;
using Kora.Common.Handlers;
using Kora.Domain.Clubs;
using Kora.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Kora.Features.Management.Clubs.UpdateClub;

public class UpdateClubHandler : IHandler
{
    private readonly AppDbContext _db;

    public UpdateClubHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<UpdateClubResponse> Handle(Guid clubId, UpdateClubRequest request, CancellationToken ct)
    {
        var club = await _db.Clubs
            .Include(c => c.OperatingHours)
            .FirstOrDefaultAsync(c => c.Id == clubId, ct);

        if (club is null)
            throw new NotFoundException("Club not found.");

        club.Name = request.Name;

        _db.ClubOperatingHours.RemoveRange(club.OperatingHours);
        club.OperatingHours = request.OperatingHours
            .Select(h => new ClubOperatingHours
            {
                Id = Guid.NewGuid(),
                DayOfWeek = h.DayOfWeek,
                OpenTime = h.OpenTime,
                CloseTime = h.CloseTime
            })
            .ToList();

        await _db.SaveChangesAsync(ct);

        return new UpdateClubResponse(club.Id);
    }
}
