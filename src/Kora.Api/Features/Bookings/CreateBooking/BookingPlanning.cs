using Kora.Common.Errors;
using Kora.Domain.Clubs;
using Kora.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Kora.Features.Bookings.CreateBooking;

public record BookingPlan(
    Club Club,
    DateTime StartsAtUtc,
    DateTime EndsAtUtc,
    List<Guid> FreeCourtIds
);

public static class BookingPlanning
{
    public static async Task<BookingPlan> PrepareAsync(
        AppDbContext db,
        Guid clubId,
        CreateBookingRequest request,
        int requiredCourts,
        CancellationToken ct)
    {
        var club = await db.Clubs
            .Include(c => c.OperatingHours)
            .FirstOrDefaultAsync(c => c.Id == clubId, ct);

        if (club is null)
        {
            throw new NotFoundException("Club not found.");
        }

        var sortedSlotsUtc = request.Slots
            .Select(s => s.UtcDateTime)
            .OrderBy(s => s)
            .ToList();

        var startsAtUtc = sortedSlotsUtc[0];

        if (startsAtUtc <= DateTime.UtcNow)
        {
            throw new DomainException("Booking must start in the future.");
        }

        var cellDuration = TimeSpan.FromMinutes(club.SlotCellDurationMinutes);
        for (var i = 1; i < sortedSlotsUtc.Count; i++)
        {
            if (sortedSlotsUtc[i] - sortedSlotsUtc[i - 1] != cellDuration)
            {
                throw new DomainException(
                    $"Slots must be consecutive and spaced {club.SlotCellDurationMinutes} minutes apart.");
            }
        }

        var durationMinutes = sortedSlotsUtc.Count * club.SlotCellDurationMinutes;
        var endsAtUtc = startsAtUtc.AddMinutes(durationMinutes);

        club.EnsureBookingWithinOperatingHours(startsAtUtc, endsAtUtc);

        var courtIds = await db.Courts
            .Where(c => c.ClubId == clubId)
            .Select(c => c.Id)
            .ToListAsync(ct);

        if (courtIds.Count == 0)
        {
            throw new DomainException("Club has no courts.");
        }

        if (request.CourtId.HasValue && !courtIds.Contains(request.CourtId.Value))
        {
            throw new NotFoundException("Court not found in this club.");
        }

        if (requiredCourts > courtIds.Count)
        {
            throw new DomainException(
                $"Club only has {courtIds.Count} courts.");
        }

        var bookedCourtIds = await db.Reservations
            .Where(r => courtIds.Contains(r.CourtId)
                     && r.StartsAt < endsAtUtc
                     && r.EndsAt > startsAtUtc)
            .Select(r => r.CourtId)
            .Distinct()
            .ToListAsync(ct);

        var blockedCourtIds = await db.CourtBlocks
            .Where(b => courtIds.Contains(b.CourtId)
                     && b.StartsAt < endsAtUtc
                     && b.EndsAt > startsAtUtc)
            .Select(b => b.CourtId)
            .Distinct()
            .ToListAsync(ct);

        var busyCourtIds = bookedCourtIds.Union(blockedCourtIds).ToList();

        if (request.CourtId.HasValue && busyCourtIds.Contains(request.CourtId.Value))
        {
            throw new DomainException("The requested court is already booked or blocked at this time.");
        }

        var freeCourts = request.CourtId.HasValue
            ? courtIds
                .Where(id => id != request.CourtId.Value)
                .Except(busyCourtIds)
                .Take(requiredCourts - 1)
                .Prepend(request.CourtId.Value)
                .ToList()
            : courtIds
                .Except(busyCourtIds)
                .Take(requiredCourts)
                .ToList();

        if (freeCourts.Count < requiredCourts)
        {
            throw new DomainException(
                requiredCourts == 1
                    ? "No court is free at this time."
                    : "Not enough free courts at this time.");
        }

        return new BookingPlan(club, startsAtUtc, endsAtUtc, freeCourts);
    }
}
