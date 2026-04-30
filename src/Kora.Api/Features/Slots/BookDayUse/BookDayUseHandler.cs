using FluentValidation;
using Kora.Common.Handlers;
using Kora.Domain.Bookings;
using Kora.Domain.Slots;
using Kora.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Kora.Features.Slots.BookDayUse;

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

        var courtCount = await _db.Courts.CountAsync(c => c.ClubId == clubId, ct);
        if (courtCount == 0)
        {
            throw new InvalidOperationException("Club has no courts.");
        }

        if (request.CourtsToOccupy > courtCount)
        {
            throw new InvalidOperationException(
                $"Club only has {courtCount} courts.");
        }

        var endsAt = request.StartsAt.AddMinutes(request.DurationMinutes);
        var cellDuration = TimeSpan.FromMinutes(club.SlotCellDurationMinutes);
        var cellCount = request.DurationMinutes / club.SlotCellDurationMinutes;

        var slotsInRange = await _db.Slots
            .Include(s => s.Booking)
                .ThenInclude(b => b!.Participants)
            .Where(s => s.ClubId == clubId
                     && s.StartsAt >= request.StartsAt
                     && s.EndsAt <= endsAt)
            .ToListAsync(ct);

        var byCell = slotsInRange
            .GroupBy(s => s.StartsAt)
            .ToDictionary(g => g.Key, g => g.ToList());

        var slotsToClaim = new List<Slot>();
        var newSlotsToCreate = new List<Slot>();

        for (var cellStart = request.StartsAt; cellStart < endsAt; cellStart += cellDuration)
        {
            var cellEnd = cellStart + cellDuration;
            byCell.TryGetValue(cellStart, out var cellSlots);
            cellSlots ??= new List<Slot>();

            var claimedAtCell = cellSlots.Where(s => s.BookingId is not null).ToList();
            if (claimedAtCell.Any(s => s.Booking!.Participants.Count > 0))
            {
                throw new InvalidOperationException(
                    $"Cannot create DayUse: slot at {cellStart:HH:mm} already has participants.");
            }

            var freeAtCell = courtCount - claimedAtCell.Count;
            if (freeAtCell < request.CourtsToOccupy)
            {
                throw new InvalidOperationException(
                    $"Not enough free courts at {cellStart:HH:mm}.");
            }

            var unclaimed = cellSlots.Where(s => s.BookingId is null).ToList();
            var toTakeFromExisting = Math.Min(unclaimed.Count, request.CourtsToOccupy);
            slotsToClaim.AddRange(unclaimed.Take(toTakeFromExisting));

            var stillNeeded = request.CourtsToOccupy - toTakeFromExisting;
            for (var i = 0; i < stillNeeded; i++)
            {
                newSlotsToCreate.Add(new Slot
                {
                    Id = Guid.NewGuid(),
                    ClubId = clubId,
                    StartsAt = cellStart,
                    EndsAt = cellEnd,
                    IsPublished = false
                });
            }
        }

        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            ClubId = clubId,
            Type = BookingType.DayUse,
            StartsAt = request.StartsAt,
            EndsAt = endsAt,
            Capacity = request.Capacity,
            CreatedAt = DateTime.UtcNow
        };

        _db.Bookings.Add(booking);

        foreach (var slot in slotsToClaim)
        {
            slot.BookingId = booking.Id;
        }

        foreach (var slot in newSlotsToCreate)
        {
            slot.BookingId = booking.Id;
            _db.Slots.Add(slot);
        }

        await _db.SaveChangesAsync(ct);

        return new BookDayUseResponse(booking.Id);
    }
}
