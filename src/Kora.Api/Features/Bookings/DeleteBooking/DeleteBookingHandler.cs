using Kora.Common.Errors;
using Kora.Common.Handlers;
using Kora.Domain.Users;
using Kora.Infrastructure.Auth;
using Kora.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Kora.Features.Bookings.DeleteBooking;

public class DeleteBookingHandler : IHandler
{
    private readonly AppDbContext _db;
    private readonly IUserContext _userContext;

    public DeleteBookingHandler(AppDbContext db, IUserContext userContext)
    {
        _db = db;
        _userContext = userContext;
    }

    public async Task Handle(Guid bookingId, CancellationToken ct)
    {
        var booking = await _db.Bookings
            .FirstOrDefaultAsync(b => b.Id == bookingId, ct);

        if (booking is null)
        {
            throw new NotFoundException("Booking not found.");
        }

        await EnsureClubStaffOrAdminAsync(booking.ClubId, ct);

        _db.Bookings.Remove(booking);
        await _db.SaveChangesAsync(ct);
    }

    private async Task EnsureClubStaffOrAdminAsync(Guid clubId, CancellationToken ct)
    {
        var user = await _userContext.GetCurrentUserAsync(ct);

        if (user.Role == UserRole.Admin)
        {
            return;
        }

        var isStaff = await _db.ClubStaff
            .AnyAsync(s => s.ClubId == clubId && s.UserId == user.Id, ct);

        if (!isStaff)
        {
            throw new NotFoundException("Booking not found.");
        }
    }
}
