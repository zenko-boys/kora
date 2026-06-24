using Kora.Common.Errors;
using Kora.Common.Handlers;
using Kora.Infrastructure.Auth;
using Kora.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Kora.Features.Bookings.GetBooking;

public class GetBookingHandler : IHandler
{
    private readonly AppDbContext _db;
    private readonly IUserContext _userContext;

    public GetBookingHandler(AppDbContext db, IUserContext userContext)
    {
        _db = db;
        _userContext = userContext;
    }

    public async Task<GetBookingResponse> Handle(Guid bookingId, CancellationToken ct)
    {
        var currentUser = await _userContext.GetCurrentUserAsync(ct);

        var booking = await _db.Bookings
            .Include(b => b.Club)
            .Include(b => b.Reservations).ThenInclude(r => r.Court)
            .Include(b => b.Participants).ThenInclude(p => p.User)
            .Include(b => b.Guests)
            .FirstOrDefaultAsync(b => b.Id == bookingId, ct);

        if (booking is null)
            throw new NotFoundException("Booking not found.");

        var amIIn = booking.Participants.Any(p => p.UserId == currentUser.Id);

        if (booking.IsPrivate && !amIIn)
            throw new NotFoundException("Booking not found.");

        var tz = TimeZoneInfo.FindSystemTimeZoneById(booking.Club!.TimeZoneId);
        var startsAt = new DateTimeOffset(booking.StartsAt, TimeSpan.Zero).ToOffset(tz.GetUtcOffset(booking.StartsAt));
        var endsAt = new DateTimeOffset(booking.EndsAt, TimeSpan.Zero).ToOffset(tz.GetUtcOffset(booking.EndsAt));

        var occupants = booking.Participants.Count + booking.Guests.Count;

        var participants = booking.Participants
            .Select(p => new BookingParticipantDto(
                p.UserId,
                $"{p.User?.FirstName} {p.User?.LastName}".Trim(),
                p.User?.Email ?? string.Empty,
                p.Team,
                p.PositionInTeam))
            .ToList();

        var guests = booking.Guests
            .Select(g => new BookingGuestDto(g.Id, g.Name, g.Email, g.Team, g.PositionInTeam))
            .ToList();

        return new GetBookingResponse(
            booking.Id,
            booking.ClubId,
            booking.Club.Name,
            booking.Club.TimeZoneId,
            booking.Reservations.Select(r => r.Court!.Name).ToList(),
            booking.Type,
            booking.IsPrivate,
            booking.Description,
            startsAt,
            endsAt,
            booking.Capacity,
            booking.Capacity - occupants,
            amIIn,
            participants,
            guests);
    }
}
