using FluentValidation;
using Kora.Common.Handlers;
using Kora.Domain.Clubs;
using Kora.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Kora.Features.Clubs.UpdateClub;

public class UpdateClubHandler : IHandler
{
    private readonly AppDbContext _db;
    private readonly IValidator<UpdateClubRequest> _validator;

    public UpdateClubHandler(AppDbContext db, IValidator<UpdateClubRequest> validator)
    {
        _db = db;
        _validator = validator;
    }

    public async Task<UpdateClubResponse> Handle(
        Guid clubId,
        UpdateClubRequest request,
        CancellationToken ct)
    {
        await _validator.ValidateAndThrowAsync(request, ct);

        var club = await _db.Clubs
            .Include(c => c.OperatingHours)
            .FirstOrDefaultAsync(c => c.Id == clubId, ct);

        if (club is null)
        {
            throw new InvalidOperationException("Club not found.");
        }

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
