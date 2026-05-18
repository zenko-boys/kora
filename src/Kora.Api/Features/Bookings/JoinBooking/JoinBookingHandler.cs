using Kora.Common.Handlers;
using Kora.Domain.Bookings;
using Kora.Infrastructure.Auth;
using Kora.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Kora.Features.Bookings.JoinBooking;

public class JoinBookingHandler : IHandler
{
    private readonly AppDbContext _db;
    private readonly IUserContext _userContext;

    public JoinBookingHandler(AppDbContext db, IUserContext userContext)
    {
        _db = db;
        _userContext = userContext;
    }

    public async Task<JoinBookingResponse> Handle(Guid bookingId, CancellationToken ct)
    {
        var booking = await _db.Bookings
            .Include(b => b.Participants)
            .FirstOrDefaultAsync(b => b.Id == bookingId, ct);

        if (booking is null)
        {
            throw new InvalidOperationException("Booking not found.");
        }

        if (booking.StartsAt <= DateTime.UtcNow)
        {
            throw new InvalidOperationException("Booking has already started.");
        }

        var currentUser = await _userContext.GetCurrentUserAsync(ct);

        if (booking.Participants.Any(p => p.UserId == currentUser.Id))
        {
            throw new InvalidOperationException("User has already joined this booking.");
        }

        var hasConflict = await _db.Bookings
            .AnyAsync(b => b.Id != bookingId
                        && b.Participants.Any(p => p.UserId == currentUser.Id)
                        && b.StartsAt < booking.EndsAt
                        && b.EndsAt > booking.StartsAt, ct);

        if (hasConflict)
        {
            throw new InvalidOperationException("User already has a booking during this time.");
        }

        if (booking.Participants.Count >= booking.Capacity)
        {
            throw new InvalidOperationException("Booking is full.");
        }

        booking.Participants.Add(new BookingParticipant
        {
            UserId = currentUser.Id,
            JoinedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync(ct);

        return new JoinBookingResponse(
            booking.Id,
            currentUser.Id,
            booking.Participants.Count,
            booking.Capacity);
    }
}
