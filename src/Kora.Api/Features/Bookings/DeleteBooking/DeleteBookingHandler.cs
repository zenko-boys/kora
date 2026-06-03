using Kora.Common.Errors;
using Kora.Common.Handlers;
using Kora.Infrastructure.Auth;
using Kora.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Kora.Features.Bookings.DeleteBooking;

public class DeleteBookingHandler : IHandler
{
    private readonly AppDbContext _db;
    private readonly IClubAuthorizationService _clubAuth;

    public DeleteBookingHandler(AppDbContext db, IClubAuthorizationService clubAuth)
    {
        _db = db;
        _clubAuth = clubAuth;
    }

    public async Task Handle(Guid bookingId, CancellationToken ct)
    {
        var booking = await _db.Bookings
            .FirstOrDefaultAsync(b => b.Id == bookingId, ct);

        if (booking is null)
        {
            throw new NotFoundException("Booking not found.");
        }

        if (!await _clubAuth.IsClubStaffOrAdminAsync(booking.ClubId, ct))
            throw new NotFoundException("Booking not found.");

        _db.Bookings.Remove(booking);
        await _db.SaveChangesAsync(ct);
    }
}
