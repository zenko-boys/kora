using FluentValidation;
using Kora.Common.Handlers;
using Kora.Domain.Clubs;
using Kora.Infrastructure.Data;

namespace Kora.Features.Clubs.CreateClub;

public class CreateClubHandler : IHandler
{
    private readonly AppDbContext _db;
    private readonly IValidator<CreateClubRequest> _validator;

    public CreateClubHandler(
        AppDbContext db,
        IValidator<CreateClubRequest> validator)
    {
        _db = db;
        _validator = validator;
    }

    public async Task<CreateClubResponse> Handle(
        CreateClubRequest request,
        CancellationToken ct)
    {
        await _validator.ValidateAndThrowAsync(request, ct);

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
