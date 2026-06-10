using Kora.Common.Handlers;
using Kora.Domain.Clubs;
using Kora.Infrastructure.Data;

namespace Kora.Features.Management.Clubs.CreateClub;

public class CreateClubHandler : IHandler
{
    private readonly AppDbContext _db;

    public CreateClubHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<CreateClubResponse> Handle(CreateClubRequest request, CancellationToken ct)
    {
        var club = new Club
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            TimeZoneId = request.TimeZoneId,
            SlotCellDurationMinutes = request.SlotCellDurationMinutes,
            MinimumBookingDurationMinutes = request.MinimumBookingDurationMinutes,
            CreatedAt = DateTime.UtcNow,
            OperatingHours = request.OperatingHours
                .Select(h => new ClubOperatingHours
                {
                    Id = Guid.NewGuid(),
                    DayOfWeek = h.DayOfWeek,
                    OpenTime = h.OpenTime,
                    CloseTime = h.CloseTime
                })
                .ToList()
        };

        _db.Clubs.Add(club);
        await _db.SaveChangesAsync(ct);

        return new CreateClubResponse(club.Id);
    }
}
