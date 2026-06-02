using Kora.Common.Errors;
using Kora.Common.Handlers;
using Kora.Domain.Users;
using Kora.Infrastructure.Auth;
using Kora.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Kora.Features.Clubs.GetClubSchedule;

public class GetClubScheduleHandler : IHandler
{
    private readonly AppDbContext _db;
    private readonly IUserContext _userContext;

    public GetClubScheduleHandler(AppDbContext db, IUserContext userContext)
    {
        _db = db;
        _userContext = userContext;
    }

    public async Task<GetClubScheduleResponse> Handle(Guid clubId, DateOnly date, CancellationToken ct)
    {
        await EnsureClubStaffOrAdminAsync(clubId, ct);

        var club = await _db.Clubs
            .Include(c => c.OperatingHours)
            .Include(c => c.Courts)
            .FirstOrDefaultAsync(c => c.Id == clubId, ct);

        if (club is null)
            throw new DomainException("Club not found.");

        var tz = TimeZoneInfo.FindSystemTimeZoneById(club.TimeZoneId);

        var hours = club.OperatingHours.FirstOrDefault(h => h.DayOfWeek == date.DayOfWeek);
        if (hours is null)
            return new GetClubScheduleResponse(club.Id, date, club.TimeZoneId, club.SlotCellDurationMinutes, []);

        var dayStartUtc = TimeZoneInfo.ConvertTimeToUtc(date.ToDateTime(TimeOnly.MinValue), tz);
        var dayEndUtc = TimeZoneInfo.ConvertTimeToUtc(date.ToDateTime(TimeOnly.MaxValue), tz);

        var reservations = await _db.Reservations
            .Include(r => r.Booking)
                .ThenInclude(b => b!.Participants)
            .Where(r => club.Courts.Select(c => c.Id).Contains(r.CourtId)
                     && r.StartsAt < dayEndUtc
                     && r.EndsAt > dayStartUtc)
            .ToListAsync(ct);

        var cellTicks = TimeSpan.FromMinutes(club.SlotCellDurationMinutes).Ticks;

        var courts = club.Courts.Select(court =>
        {
            var courtReservations = reservations.Where(r => r.CourtId == court.Id).ToList();
            var slots = new List<ScheduleSlot>();

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

                var reservation = courtReservations
                    .FirstOrDefault(r => r.StartsAt < cellEndUtc && r.EndsAt > cellStartUtc);

                var startOffset = new DateTimeOffset(cellStartLocal, tz.GetUtcOffset(cellStartLocal));
                var endOffset = new DateTimeOffset(cellEndLocal, tz.GetUtcOffset(cellEndLocal));

                BookingInfo? bookingInfo = null;
                if (reservation?.Booking is { } booking)
                {
                    bookingInfo = new BookingInfo(
                        booking.Id,
                        booking.Type,
                        booking.Participants.Count,
                        booking.Capacity,
                        booking.IsPrivate,
                        booking.Description);
                }

                slots.Add(new ScheduleSlot(startOffset, endOffset, reservation is null, bookingInfo));
            }

            return new CourtSchedule(court.Id, court.Name, slots);
        }).ToList();

        return new GetClubScheduleResponse(club.Id, date, club.TimeZoneId, club.SlotCellDurationMinutes, courts);
    }

    private async Task EnsureClubStaffOrAdminAsync(Guid clubId, CancellationToken ct)
    {
        var user = await _userContext.GetCurrentUserAsync(ct);

        if (user.Role == UserRole.Admin)
            return;

        var isStaff = await _db.ClubStaff
            .AnyAsync(s => s.ClubId == clubId && s.UserId == user.Id, ct);

        if (!isStaff)
            throw new UnauthorizedAccessException("Only club staff or admins can view the schedule.");
    }
}
