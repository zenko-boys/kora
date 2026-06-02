using Kora.Common.Errors;
using Kora.Common.Handlers;
using Kora.Infrastructure.Auth;
using Kora.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Kora.Features.Bookings.LeaveBooking;

public class LeaveBookingHandler : IHandler
{
    private readonly AppDbContext _db;
    private readonly IUserContext _userContext;

    public LeaveBookingHandler(AppDbContext db, IUserContext userContext)
    {
        _db = db;
        _userContext = userContext;
    }

    public async Task<LeaveBookingResponse> Handle(Guid bookingId, CancellationToken ct)
    {
        var booking = await _db.Bookings
            .Include(b => b.Participants)
            .FirstOrDefaultAsync(b => b.Id == bookingId, ct);

        if (booking is null)
        {
            throw new DomainException("Booking not found.");
        }

        if (booking.StartsAt <= DateTime.UtcNow)
        {
            throw new DomainException("Cannot leave a booking that has already started.");
        }

        if (booking.StartsAt - DateTime.UtcNow < TimeSpan.FromHours(24))
        {
            throw new DomainException("Cannot leave a booking less than 24 hours before it starts.");
        }

        var currentUser = await _userContext.GetCurrentUserAsync(ct);

        var participant = booking.Participants.FirstOrDefault(p => p.UserId == currentUser.Id);

        if (participant is null)
        {
            throw new DomainException("User is not a participant in this booking.");
        }

        booking.Participants.Remove(participant);

        if (booking.Participants.Count == 0)
        {
            _db.Bookings.Remove(booking);
            await _db.SaveChangesAsync(ct);
            return new LeaveBookingResponse(booking.Id, 0, booking.Capacity, true);
        }

        await _db.SaveChangesAsync(ct);

        return new LeaveBookingResponse(booking.Id, booking.Participants.Count, booking.Capacity, false);
    }
}
