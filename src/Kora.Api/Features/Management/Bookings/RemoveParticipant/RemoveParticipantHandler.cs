using Kora.Common.Errors;
using Kora.Common.Handlers;
using Kora.Infrastructure.Auth;
using Kora.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Kora.Features.Management.Bookings.RemoveParticipant;

public class RemoveParticipantHandler : IHandler
{
    private readonly AppDbContext _db;
    private readonly IClubAuthorizationService _clubAuth;

    public RemoveParticipantHandler(AppDbContext db, IClubAuthorizationService clubAuth)
    {
        _db = db;
        _clubAuth = clubAuth;
    }

    public async Task<RemoveParticipantResponse> Handle(Guid bookingId, Guid userId, CancellationToken ct)
    {
        var booking = await _db.Bookings
            .Include(b => b.Participants)
            .FirstOrDefaultAsync(b => b.Id == bookingId, ct);

        if (booking is null)
            throw new NotFoundException("Booking not found.");

        await _clubAuth.EnsureClubStaffOrAdminAsync(booking.ClubId, ct);

        var participant = booking.Participants.FirstOrDefault(p => p.UserId == userId);

        if (participant is null)
            throw new NotFoundException("Participant not found in this booking.");

        booking.Participants.Remove(participant);
        await _db.SaveChangesAsync(ct);

        return new RemoveParticipantResponse(bookingId, userId, booking.Participants.Count, booking.Capacity);
    }
}
