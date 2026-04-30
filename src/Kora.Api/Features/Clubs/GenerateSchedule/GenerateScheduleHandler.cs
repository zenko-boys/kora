using FluentValidation;
using Kora.Common.Handlers;
using Kora.Domain.Slots;
using Kora.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Kora.Features.Clubs.GenerateSchedule;

public class GenerateScheduleHandler : IHandler
{
    private readonly AppDbContext _db;
    private readonly IValidator<GenerateScheduleRequest> _validator;

    public GenerateScheduleHandler(
        AppDbContext db,
        IValidator<GenerateScheduleRequest> validator)
    {
        _db = db;
        _validator = validator;
    }

    public async Task<GenerateScheduleResponse> Handle(
        Guid clubId,
        GenerateScheduleRequest request,
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

        var courtCount = await _db.Courts.CountAsync(c => c.ClubId == clubId, ct);
        if (courtCount == 0)
        {
            throw new InvalidOperationException("Club has no courts.");
        }

        var cellDuration = TimeSpan.FromMinutes(club.SlotCellDurationMinutes);
        var startDate = DateOnly.FromDateTime(DateTime.UtcNow);
        var endDate = startDate.AddDays(request.DaysAhead);

        var rangeStart = startDate.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
        var rangeEnd = endDate.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);

        var existingCounts = await _db.Slots
            .Where(s => s.ClubId == clubId
                     && s.StartsAt >= rangeStart
                     && s.StartsAt < rangeEnd)
            .GroupBy(s => s.StartsAt)
            .Select(g => new { StartsAt = g.Key, Count = g.Count() })
            .ToListAsync(ct);

        var existingMap = existingCounts.ToDictionary(x => x.StartsAt, x => x.Count);

        var newSlots = new List<Slot>();

        for (var date = startDate; date < endDate; date = date.AddDays(1))
        {
            var hoursForDay = club.OperatingHours
                .Where(h => h.DayOfWeek == date.DayOfWeek);

            foreach (var hours in hoursForDay)
            {
                var openDateTime = date.ToDateTime(hours.OpenTime, DateTimeKind.Utc);
                var closeDateTime = date.ToDateTime(hours.CloseTime, DateTimeKind.Utc);

                for (var startsAt = openDateTime;
                     startsAt + cellDuration <= closeDateTime;
                     startsAt += cellDuration)
                {
                    var endsAt = startsAt + cellDuration;
                    existingMap.TryGetValue(startsAt, out var existing);

                    var toCreate = courtCount - existing;
                    for (var i = 0; i < toCreate; i++)
                    {
                        newSlots.Add(new Slot
                        {
                            Id = Guid.NewGuid(),
                            ClubId = clubId,
                            StartsAt = startsAt,
                            EndsAt = endsAt,
                            IsPublished = false
                        });
                    }
                }
            }
        }

        if (newSlots.Count > 0)
        {
            _db.Slots.AddRange(newSlots);
            await _db.SaveChangesAsync(ct);
        }

        return new GenerateScheduleResponse(newSlots.Count);
    }
}
