using Kora.Common.Errors;
using Kora.Domain.Bookings;
using Kora.Domain.Reservations;
using Kora.Infrastructure.Auth;
using Kora.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Kora.Features.Bookings.CreateBooking.Strategies;

public class DayUseBookingStrategy : ICreateBookingStrategy
{
    private readonly AppDbContext _db;
    private readonly IClubAuthorizationService _clubAuth;

    public DayUseBookingStrategy(AppDbContext db, IClubAuthorizationService clubAuth)
    {
        _db = db;
        _clubAuth = clubAuth;
    }

    public async Task<CreateBookingResponse> HandleAsync(
        Guid clubId,
        CreateBookingRequest request,
        CancellationToken ct)
    {
        await _clubAuth.EnsureClubStaffOrAdminAsync(clubId, ct);

        var plan = await BookingPlanning.PrepareAsync(
            _db, clubId, request, requiredCourts: request.CourtsToOccupy!.Value, ct);

        var participants = new List<BookingParticipant>();
        foreach (var input in request.Participants ?? [])
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == input.UserId, ct);
            if (user is null)
                throw new NotFoundException($"User {input.UserId} not found.");

            participants.Add(new BookingParticipant
            {
                UserId = input.UserId,
                JoinedAt = DateTime.UtcNow,
                Team = input.Team,
                PositionInTeam = input.PositionInTeam
            });
        }

        var guests = (request.Guests ?? [])
            .Select(g => new BookingGuest { Id = Guid.NewGuid(), Name = g.Name, Email = g.Email, Team = g.Team, PositionInTeam = g.PositionInTeam })
            .ToList();

        if (participants.Count + guests.Count > request.Capacity!.Value)
            throw new DomainException($"Too many occupants. This booking has a capacity of {request.Capacity.Value}.");

        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            ClubId = clubId,
            Type = BookingType.DayUse,
            StartsAt = plan.StartsAtUtc,
            EndsAt = plan.EndsAtUtc,
            Capacity = request.Capacity!.Value,
            Description = request.Description,
            CreatedAt = DateTime.UtcNow,
            Participants = participants,
            Guests = guests,
            Reservations = plan.FreeCourtIds
                .Select(courtId => new Reservation
                {
                    Id = Guid.NewGuid(),
                    CourtId = courtId,
                    StartsAt = plan.StartsAtUtc,
                    EndsAt = plan.EndsAtUtc
                })
                .ToList()
        };

        _db.Bookings.Add(booking);
        await _db.SaveChangesAsync(ct);

        return new CreateBookingResponse(booking.Id);
    }
}
