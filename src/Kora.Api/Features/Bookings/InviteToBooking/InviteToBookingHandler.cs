using Kora.Common.Errors;
using Kora.Common.Handlers;
using Kora.Configuration;
using Kora.Infrastructure.Auth;
using Kora.Infrastructure.Data;
using Kora.Infrastructure.Email;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Kora.Features.Bookings.InviteToBooking;

public class InviteToBookingHandler : IHandler
{
    private readonly AppDbContext _db;
    private readonly IUserContext _userContext;
    private readonly IEmailSender _emailSender;
    private readonly AppOptions _appOptions;

    public InviteToBookingHandler(
        AppDbContext db,
        IUserContext userContext,
        IEmailSender emailSender,
        IOptions<AppOptions> appOptions)
    {
        _db = db;
        _userContext = userContext;
        _emailSender = emailSender;
        _appOptions = appOptions.Value;
    }

    public async Task Handle(Guid bookingId, InviteToBookingRequest request, CancellationToken ct)
    {
        var booking = await _db.Bookings
            .Include(b => b.Participants)
            .Include(b => b.Guests)
            .FirstOrDefaultAsync(b => b.Id == bookingId, ct);

        if (booking is null)
            throw new NotFoundException("Booking not found.");

        if (booking.StartsAt <= DateTime.UtcNow)
            throw new DomainException("Booking has already started.");

        var invitedUser = await _db.Users.FirstOrDefaultAsync(u => u.Id == request.UserId, ct);
        if (invitedUser is null)
            throw new NotFoundException("User not found.");

        if (booking.Participants.Any(p => p.UserId == request.UserId))
            throw new DomainException("User is already a participant in this booking.");

        var inviter = await _userContext.GetCurrentUserAsync(ct);

        await _emailSender.SendAsync(
            InviteToBookingEmail.Build(invitedUser, inviter, booking, _appOptions.Url), ct);
    }
}
