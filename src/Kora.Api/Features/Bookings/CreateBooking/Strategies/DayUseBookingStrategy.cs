using Kora.Common.Errors;
using Kora.Domain.Bookings;
using Kora.Domain.Reservations;
using Kora.Infrastructure.Auth;
using Kora.Infrastructure.Data;

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

        var guests = (request.Guests ?? [])
            .Select(g => new BookingGuest { Id = Guid.NewGuid(), Name = g.Name, Email = g.Email, Team = g.Team })
            .ToList();

        if (guests.Count > request.Capacity!.Value)
            throw new DomainException($"Too many guests. This booking has a capacity of {request.Capacity.Value}.");

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
