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
            throw new DomainException("Club not found.");
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

        if (requiredCourts > courtIds.Count)
        {
            throw new DomainException(
                $"Club only has {courtIds.Count} courts.");
        }

        var busyCourtIds = await db.Reservations
            .Where(r => courtIds.Contains(r.CourtId)
                     && r.StartsAt < endsAtUtc
                     && r.EndsAt > startsAtUtc)
            .Select(r => r.CourtId)
            .Distinct()
            .ToListAsync(ct);

        var freeCourts = courtIds
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
