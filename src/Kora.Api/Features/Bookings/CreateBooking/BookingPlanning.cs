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

        var courtIds = await db.Courts
            .Where(c => c.ClubId == clubId)
            .Select(c => c.Id)
            .ToListAsync(ct);

        if (courtIds.Count == 0)
        {
            throw new InvalidOperationException("Club has no courts.");
        }

        if (requiredCourts > courtIds.Count)
        {
            throw new InvalidOperationException(
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
            throw new InvalidOperationException(
                requiredCourts == 1
                    ? "No court is free at this time."
                    : "Not enough free courts at this time.");
        }

        return new BookingPlan(club, startsAtUtc, endsAtUtc, freeCourts);
    }
}
