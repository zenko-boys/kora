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
            .Where(b => b.StartsAt > from && b.StartsAt < to);

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
            query = query.Where(b => b.Participants.Count < b.Capacity);
        }
        else if (open == false)
        {
            query = query.Where(b => b.Participants.Count >= b.Capacity);
        }

        var bookings = await query
            .OrderBy(b => b.StartsAt)
            .Take(MaxResults)
            .Select(b => new BookingSummary(
                b.Id,
                b.ClubId,
                b.Club!.Name,
                b.Reservations.Select(r => r.Court!.Name).FirstOrDefault() ?? string.Empty,
                b.Type,
                b.StartsAt,
                b.EndsAt,
                b.Participants.Count,
                b.Capacity,
                b.Capacity - b.Participants.Count,
                b.Participants.Any(p => p.UserId == currentUser.Id)
            ))
            .ToListAsync(ct);

        return new ListBookingsResponse(bookings);
    }
}
