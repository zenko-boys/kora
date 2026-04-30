using FluentValidation;
using Kora.Common.Handlers;
using Kora.Domain.Bookings;
using Kora.Domain.Clubs;
using Kora.Domain.Reservations;
using Kora.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Kora.Features.Bookings.BookDayUse;

public class BookDayUseHandler : IHandler
{
    private readonly AppDbContext _db;
    private readonly IValidator<BookDayUseRequest> _validator;

    public BookDayUseHandler(
        AppDbContext db,
        IValidator<BookDayUseRequest> validator)
    {
        _db = db;
        _validator = validator;
    }

    public async Task<BookDayUseResponse> Handle(
        Guid clubId,
        BookDayUseRequest request,
        CancellationToken ct)
    {
        await _validator.ValidateAndThrowAsync(request, ct);

        var club = await _db.Clubs
            .Include(c => c.OperatingHours)
            .FirstOrDefaultAsync(c => c.Id == clubId, ct);

        if (club is null)
        {
            throw new InvalidOperationException("Club not found.");
        }

        if (request.DurationMinutes % club.SlotCellDurationMinutes != 0)
        {
            throw new InvalidOperationException(
                $"Duration must be a multiple of {club.SlotCellDurationMinutes} minutes.");
        }

        var startsAtUtc = request.StartsAt.ToUniversalTime();

        if (startsAtUtc <= DateTime.UtcNow)
        {
            throw new InvalidOperationException("Booking must start in the future.");
        }

        var endsAtUtc = startsAtUtc.AddMinutes(request.DurationMinutes);

        club.EnsureBookingWithinOperatingHours(startsAtUtc, endsAtUtc);

        var courtIds = await _db.Courts
            .Where(c => c.ClubId == clubId)
            .Select(c => c.Id)
            .ToListAsync(ct);

        if (courtIds.Count == 0)
        {
            throw new InvalidOperationException("Club has no courts.");
        }

        if (request.CourtsToOccupy > courtIds.Count)
        {
            throw new InvalidOperationException(
                $"Club only has {courtIds.Count} courts.");
        }

        var busyCourtIds = await _db.Reservations
            .Where(r => courtIds.Contains(r.CourtId)
                     && r.StartsAt < endsAtUtc
                     && r.EndsAt > startsAtUtc)
            .Select(r => r.CourtId)
            .Distinct()
            .ToListAsync(ct);

        var freeCourts = courtIds
            .Except(busyCourtIds)
            .Take(request.CourtsToOccupy)
            .ToList();

        if (freeCourts.Count < request.CourtsToOccupy)
        {
            throw new InvalidOperationException(
                "Not enough free courts at this time.");
        }

        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            ClubId = clubId,
            Type = BookingType.DayUse,
            StartsAt = startsAtUtc,
            EndsAt = endsAtUtc,
            Capacity = request.Capacity,
            CreatedAt = DateTime.UtcNow,
            Reservations = freeCourts
                .Select(courtId => new Reservation
                {
                    Id = Guid.NewGuid(),
                    CourtId = courtId,
                    StartsAt = startsAtUtc,
                    EndsAt = endsAtUtc
                })
                .ToList()
        };

        _db.Bookings.Add(booking);
        await _db.SaveChangesAsync(ct);

        return new BookDayUseResponse(booking.Id);
    }
}
