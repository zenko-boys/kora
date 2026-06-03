using Kora.Common.Errors;
using Kora.Common.Handlers;
using Kora.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Kora.Features.Clubs.GetClubSlots;

public class GetClubSlotsHandler : IHandler
{
    private readonly AppDbContext _db;

    public GetClubSlotsHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<GetClubSlotsResponse> Handle(Guid clubId, DateOnly date, CancellationToken ct)
    {
        var club = await _db.Clubs
            .Include(c => c.OperatingHours)
            .Include(c => c.Courts)
            .FirstOrDefaultAsync(c => c.Id == clubId, ct);

        if (club is null)
        {
            throw new NotFoundException("Club not found.");
        }

        var tz = TimeZoneInfo.FindSystemTimeZoneById(club.TimeZoneId);
        var todayLocal = DateOnly.FromDateTime(TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, tz));

        if (date < todayLocal)
        {
            throw new DomainException("Cannot query slots for a past date.");
        }

        var hours = club.OperatingHours.FirstOrDefault(h => h.DayOfWeek == date.DayOfWeek);
        if (hours is null)
        {
            return new GetClubSlotsResponse(
                club.Id,
                date,
                club.TimeZoneId,
                club.SlotCellDurationMinutes,
                club.MinimumBookingDurationMinutes,
                []);
        }

        var dayStartUtc = TimeZoneInfo.ConvertTimeToUtc(date.ToDateTime(TimeOnly.MinValue), tz);
        var dayEndUtc = TimeZoneInfo.ConvertTimeToUtc(date.ToDateTime(TimeOnly.MaxValue), tz);

        var courtIds = club.Courts.Select(c => c.Id).ToList();
        var totalCourts = courtIds.Count;

        var reservations = await _db.Reservations
            .Where(r => courtIds.Contains(r.CourtId)
                && r.StartsAt < dayEndUtc
                && r.EndsAt > dayStartUtc)
            .Select(r => new { r.CourtId, r.StartsAt, r.EndsAt })
            .ToListAsync(ct);

        var cellTicks = TimeSpan.FromMinutes(club.SlotCellDurationMinutes).Ticks;
        var slots = new List<SlotInfo>();

        for (var startTicks = hours.OpenTime.Ticks;
             startTicks + cellTicks <= hours.CloseTime.Ticks;
             startTicks += cellTicks)
        {
            var cellStart = new TimeOnly(startTicks);
            var cellEnd = new TimeOnly(startTicks + cellTicks);

            var cellStartLocal = date.ToDateTime(cellStart);
            var cellEndLocal = date.ToDateTime(cellEnd);
            var cellStartUtc = TimeZoneInfo.ConvertTimeToUtc(cellStartLocal, tz);
            var cellEndUtc = TimeZoneInfo.ConvertTimeToUtc(cellEndLocal, tz);

            var busyCourts = reservations
                .Where(r => r.StartsAt < cellEndUtc && r.EndsAt > cellStartUtc)
                .Select(r => r.CourtId)
                .Distinct()
                .Count();

            var availableCourts = totalCourts - busyCourts;
            var startOffset = new DateTimeOffset(cellStartLocal, tz.GetUtcOffset(cellStartLocal));
            var endOffset = new DateTimeOffset(cellEndLocal, tz.GetUtcOffset(cellEndLocal));
            slots.Add(new SlotInfo(startOffset, endOffset, availableCourts > 0, availableCourts));
        }

        return new GetClubSlotsResponse(
            club.Id,
            date,
            club.TimeZoneId,
            club.SlotCellDurationMinutes,
            club.MinimumBookingDurationMinutes,
            slots);
    }
}
