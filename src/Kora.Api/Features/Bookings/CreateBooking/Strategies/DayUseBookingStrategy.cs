using Kora.Domain.Bookings;
using Kora.Domain.Reservations;
using Kora.Domain.Users;
using Kora.Infrastructure.Auth;
using Kora.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Kora.Features.Bookings.CreateBooking.Strategies;

public class DayUseBookingStrategy : ICreateBookingStrategy
{
    private readonly AppDbContext _db;
    private readonly IUserContext _userContext;

    public DayUseBookingStrategy(AppDbContext db, IUserContext userContext)
    {
        _db = db;
        _userContext = userContext;
    }

    public async Task<CreateBookingResponse> HandleAsync(
        Guid clubId,
        CreateBookingRequest request,
        CancellationToken ct)
    {
        await EnsureClubStaffOrAdminAsync(clubId, ct);

        var plan = await BookingPlanning.PrepareAsync(
            _db, clubId, request, requiredCourts: request.CourtsToOccupy!.Value, ct);

        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            ClubId = clubId,
            Type = BookingType.DayUse,
            StartsAt = plan.StartsAtUtc,
            EndsAt = plan.EndsAtUtc,
            Capacity = request.Capacity!.Value,
            CreatedAt = DateTime.UtcNow,
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
            throw new UnauthorizedAccessException(
                "Only club staff or admins can create DayUse bookings.");
        }
    }
}
