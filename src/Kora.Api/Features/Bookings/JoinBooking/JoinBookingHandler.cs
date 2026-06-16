using Kora.Common.Errors;
using Kora.Common.Handlers;
using Kora.Domain.Bookings;
using Kora.Infrastructure.Auth;
using Kora.Infrastructure.Data;
using Kora.Infrastructure.Email;
using Microsoft.EntityFrameworkCore;

namespace Kora.Features.Bookings.JoinBooking;

public class JoinBookingHandler : IHandler
{
    private readonly AppDbContext _db;
    private readonly IUserContext _userContext;
    private readonly IEmailSender _emailSender;

    public JoinBookingHandler(AppDbContext db, IUserContext userContext, IEmailSender emailSender)
    {
        _db = db;
        _userContext = userContext;
        _emailSender = emailSender;
    }

    public async Task<JoinBookingResponse> Handle(Guid bookingId, JoinBookingRequest request, CancellationToken ct)
    {
        var booking = await _db.Bookings
            .Include(b => b.Participants)
            .Include(b => b.Guests)
            .FirstOrDefaultAsync(b => b.Id == bookingId, ct);

        if (booking is null)
            throw new NotFoundException("Booking not found.");

        if (booking.StartsAt <= DateTime.UtcNow)
            throw new DomainException("Booking has already started.");

        var currentUser = await _userContext.GetCurrentUserAsync(ct);

        if (booking.Participants.Any(p => p.UserId == currentUser.Id))
            throw new DomainException("User has already joined this booking.");

        var hasConflict = await _db.Bookings
            .AnyAsync(b => b.Id != bookingId
                        && b.Participants.Any(p => p.UserId == currentUser.Id)
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
            UserId = currentUser.Id,
            JoinedAt = DateTime.UtcNow,
            Team = team,
            PositionInTeam = positionInTeam
        });

        await _db.SaveChangesAsync(ct);

        await _emailSender.SendAsync(BookingConfirmedEmail.Build(currentUser.Email, booking), ct);

        return new JoinBookingResponse(
            booking.Id,
            currentUser.Id,
            booking.Participants.Count,
            booking.Capacity,
            team,
            positionInTeam);
    }
}
