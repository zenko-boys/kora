using FluentValidation;
using Kora.Common.Handlers;
using Kora.Domain.Bookings;
using Kora.Domain.Clubs;
using Kora.Domain.Reservations;
using Kora.Infrastructure.Auth;
using Kora.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Kora.Features.Bookings.BookGame;

public class BookGameHandler : IHandler
{
    private const int GameCapacity = 4;

    private readonly AppDbContext _db;
    private readonly IValidator<BookGameRequest> _validator;
    private readonly IUserContext _userContext;

    public BookGameHandler(
        AppDbContext db,
        IValidator<BookGameRequest> validator,
        IUserContext userContext)
    {
        _db = db;
        _validator = validator;
        _userContext = userContext;
    }

    public async Task<BookGameResponse> Handle(
        BookGameRequest request,
        CancellationToken ct)
    {
        await _validator.ValidateAndThrowAsync(request, ct);

        var club = await _db.Clubs
            .Include(c => c.OperatingHours)
            .FirstOrDefaultAsync(c => c.Id == request.ClubId, ct);

        if (club is null)
        {
            throw new InvalidOperationException("Club not found.");
        }

        if (request.DurationMinutes < club.MinimumBookingDurationMinutes)
        {
            throw new InvalidOperationException(
                $"Booking duration must be at least {club.MinimumBookingDurationMinutes} minutes.");
        }

        if (request.DurationMinutes % club.SlotCellDurationMinutes != 0)
        {
            throw new InvalidOperationException(
                $"Booking duration must be a multiple of {club.SlotCellDurationMinutes} minutes.");
        }

        var startsAtUtc = request.StartsAt.ToUniversalTime();

        if (startsAtUtc <= DateTime.UtcNow)
        {
            throw new InvalidOperationException("Booking must start in the future.");
        }

        var endsAtUtc = startsAtUtc.AddMinutes(request.DurationMinutes);

        club.EnsureBookingWithinOperatingHours(startsAtUtc, endsAtUtc);

        var courtIds = await _db.Courts
            .Where(c => c.ClubId == request.ClubId)
            .Select(c => c.Id)
            .ToListAsync(ct);

        if (courtIds.Count == 0)
        {
            throw new InvalidOperationException("Club has no courts.");
        }

        var busyCourtIds = await _db.Reservations
            .Where(r => courtIds.Contains(r.CourtId)
                     && r.StartsAt < endsAtUtc
                     && r.EndsAt > startsAtUtc)
            .Select(r => r.CourtId)
            .Distinct()
            .ToListAsync(ct);

        var freeCourtId = courtIds.Except(busyCourtIds).FirstOrDefault();
        if (freeCourtId == Guid.Empty)
        {
            throw new InvalidOperationException("No court is free at this time.");
        }

        var currentUser = await _userContext.GetCurrentUserAsync(ct);

        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            ClubId = request.ClubId,
            Type = BookingType.Game,
            StartsAt = startsAtUtc,
            EndsAt = endsAtUtc,
            Capacity = GameCapacity,
            CreatedAt = DateTime.UtcNow,
            Participants =
            {
                new BookingParticipant
                {
                    UserId = currentUser.Id,
                    JoinedAt = DateTime.UtcNow
                }
            },
            Reservations =
            {
                new Reservation
                {
                    Id = Guid.NewGuid(),
                    CourtId = freeCourtId,
                    StartsAt = startsAtUtc,
                    EndsAt = endsAtUtc
                }
            }
        };

        _db.Bookings.Add(booking);
        await _db.SaveChangesAsync(ct);

        return new BookGameResponse(booking.Id);
    }
}
