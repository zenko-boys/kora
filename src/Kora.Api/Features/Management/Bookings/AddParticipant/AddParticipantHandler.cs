using Kora.Common.Errors;
using Kora.Common.Handlers;
using Kora.Domain.Bookings;
using Kora.Features.Bookings;
using Kora.Infrastructure.Auth;
using Kora.Infrastructure.Data;
using Kora.Infrastructure.Email;
using Microsoft.EntityFrameworkCore;

namespace Kora.Features.Management.Bookings.AddParticipant;

public class AddParticipantHandler : IHandler
{
    private readonly AppDbContext _db;
    private readonly IClubAuthorizationService _clubAuth;
    private readonly IEmailSender _emailSender;

    public AddParticipantHandler(
        AppDbContext db,
        IClubAuthorizationService clubAuth,
        IEmailSender emailSender)
    {
        _db = db;
        _clubAuth = clubAuth;
        _emailSender = emailSender;
    }

    public async Task<AddParticipantResponse> Handle(Guid bookingId, AddParticipantRequest request, CancellationToken ct)
    {
        var booking = await _db.Bookings
            .Include(b => b.Participants)
            .Include(b => b.Guests)
            .FirstOrDefaultAsync(b => b.Id == bookingId, ct);

        if (booking is null)
            throw new NotFoundException("Booking not found.");

        await _clubAuth.EnsureClubStaffOrAdminAsync(booking.ClubId, ct);

        if (booking.StartsAt <= DateTime.UtcNow)
            throw new DomainException("Booking has already started.");

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == request.UserId, ct);
        if (user is null)
            throw new NotFoundException("User not found.");

        if (booking.Participants.Any(p => p.UserId == request.UserId))
            throw new DomainException("User is already a participant in this booking.");

        var hasConflict = await _db.Bookings
            .AnyAsync(b => b.Id != bookingId
                        && b.Participants.Any(p => p.UserId == request.UserId)
                        && b.StartsAt < booking.EndsAt
                        && b.EndsAt > booking.StartsAt, ct);

        if (hasConflict)
            throw new DomainException("User already has a booking during this time.");

        if (booking.Participants.Count + booking.Guests.Count >= booking.Capacity)
            throw new DomainException("Booking is full.");

        Team? team = null;
        int? positionInTeam = null;

        if (booking.Type == BookingType.Game)
        {
            if (request.Team is null || request.PositionInTeam is null)
                throw new DomainException("Team and position are required for game bookings.");

            var teamSize = booking.Capacity / 2;
            if (request.PositionInTeam < 1 || request.PositionInTeam > teamSize)
                throw new DomainException($"Position must be between 1 and {teamSize}.");

            var slotTaken =
                booking.Participants.Any(p => p.Team == request.Team && p.PositionInTeam == request.PositionInTeam) ||
                booking.Guests.Any(g => g.Team == request.Team && g.PositionInTeam == request.PositionInTeam);

            if (slotTaken)
                throw new DomainException("That spot is already taken.");

            team = request.Team;
            positionInTeam = request.PositionInTeam;
        }

        booking.Participants.Add(new BookingParticipant
        {
            UserId = user.Id,
            JoinedAt = DateTime.UtcNow,
            Team = team,
            PositionInTeam = positionInTeam
        });

        await _db.SaveChangesAsync(ct);

        await _emailSender.SendAsync(BookingConfirmedEmail.Build(user.Email, booking), ct);

        return new AddParticipantResponse(
            booking.Id,
            user.Id,
            booking.Participants.Count,
            booking.Capacity,
            team,
            positionInTeam);
    }
}
