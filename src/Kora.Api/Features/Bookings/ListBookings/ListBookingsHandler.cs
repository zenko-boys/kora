using Kora.Common.Handlers;
using Kora.Domain.Bookings;
using Kora.Infrastructure.Auth;
using Kora.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Kora.Features.Bookings.ListBookings;

public class ListBookingsHandler : IHandler
{
    private const int MaxResults = 50;

    private readonly AppDbContext _db;
    private readonly IUserContext _userContext;

    public ListBookingsHandler(AppDbContext db, IUserContext userContext)
    {
        _db = db;
        _userContext = userContext;
    }

    public async Task<ListBookingsResponse> Handle(
        Guid? clubId,
        BookingType? type,
        bool? open,
        DateTime? fromUtc,
        DateTime? toUtc,
        CancellationToken ct)
    {
        var currentUser = await _userContext.GetCurrentUserAsync(ct);

        var from = fromUtc?.ToUniversalTime() ?? DateTime.UtcNow;
        var to = toUtc?.ToUniversalTime() ?? from.AddDays(7);

        var query = _db.Bookings
            .Where(b => b.StartsAt > from && b.StartsAt < to)
            .Where(b => !b.IsPrivate || b.Participants.Any(p => p.UserId == currentUser.Id));

        if (clubId.HasValue)
        {
            query = query.Where(b => b.ClubId == clubId.Value);
        }

        if (type.HasValue)
        {
            query = query.Where(b => b.Type == type.Value);
        }

        if (open == true)
        {
            query = query.Where(b => b.Participants.Count + b.Guests.Count < b.Capacity);
        }
        else if (open == false)
        {
            query = query.Where(b => b.Participants.Count + b.Guests.Count >= b.Capacity);
        }

        var raw = await query
            .OrderBy(b => b.StartsAt)
            .Take(MaxResults)
            .Select(b => new
            {
                b.Id,
                b.ClubId,
                ClubName = b.Club!.Name,
                ClubTimeZoneId = b.Club.TimeZoneId,
                CourtName = b.Reservations.Select(r => r.Court!.Name).FirstOrDefault() ?? string.Empty,
                b.Type,
                b.IsPrivate,
                b.StartsAt,
                b.EndsAt,
                OccupantsCount = b.Participants.Count + b.Guests.Count,
                b.Capacity,
                AmIIn = b.Participants.Any(p => p.UserId == currentUser.Id)
            })
            .ToListAsync(ct);

        var bookings = raw.Select(b =>
        {
            var tz = TimeZoneInfo.FindSystemTimeZoneById(b.ClubTimeZoneId);
            var startsAt = new DateTimeOffset(b.StartsAt, TimeSpan.Zero).ToOffset(tz.GetUtcOffset(b.StartsAt));
            var endsAt = new DateTimeOffset(b.EndsAt, TimeSpan.Zero).ToOffset(tz.GetUtcOffset(b.EndsAt));
            return new BookingSummary(
                b.Id, b.ClubId, b.ClubName, b.ClubTimeZoneId, b.CourtName,
                b.Type, b.IsPrivate, startsAt, endsAt,
                b.OccupantsCount, b.Capacity,
                b.Capacity - b.OccupantsCount, b.AmIIn);
        }).ToList();

        return new ListBookingsResponse(bookings);
    }
}
