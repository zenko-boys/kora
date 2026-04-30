using FluentValidation;
using Kora.Common.Handlers;
using Kora.Domain.Bookings;
using Kora.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Kora.Features.Slots.BookSlot;

public class BookSlotHandler : IHandler
{
    private const int GameCapacity = 4;

    private readonly AppDbContext _db;
    private readonly IValidator<BookSlotRequest> _validator;

    public BookSlotHandler(
        AppDbContext db,
        IValidator<BookSlotRequest> validator)
    {
        _db = db;
        _validator = validator;
    }

    public async Task<BookSlotResponse> Handle(
        BookSlotRequest request,
        CancellationToken ct)
    {
        await _validator.ValidateAndThrowAsync(request, ct);

        var club = await _db.Clubs
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

        if (request.StartsAt <= DateTime.UtcNow)
        {
            throw new InvalidOperationException("Booking must start in the future.");
        }

        var endsAt = request.StartsAt.AddMinutes(request.DurationMinutes);

        var slotsInRange = await _db.Slots
            .Where(s => s.ClubId == request.ClubId
                     && s.StartsAt >= request.StartsAt
                     && s.EndsAt <= endsAt
                     && s.IsPublished)
            .OrderBy(s => s.StartsAt)
            .ToListAsync(ct);

        var cellCount = request.DurationMinutes / club.SlotCellDurationMinutes;
        var cells = slotsInRange
            .GroupBy(s => s.StartsAt)
            .OrderBy(g => g.Key)
            .ToList();

        if (cells.Count != cellCount)
        {
            throw new InvalidOperationException(
                "Schedule does not cover the requested booking range.");
        }

        var slotsToClaim = new List<Domain.Slots.Slot>(cellCount);
        foreach (var cell in cells)
        {
            var freeSlot = cell.FirstOrDefault(s => s.BookingId is null);
            if (freeSlot is null)
            {
                throw new InvalidOperationException(
                    $"No free court available at {cell.Key:HH:mm}.");
            }
            slotsToClaim.Add(freeSlot);
        }

        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            ClubId = request.ClubId,
            Type = BookingType.Game,
            StartsAt = request.StartsAt,
            EndsAt = endsAt,
            Capacity = GameCapacity,
            CreatedAt = DateTime.UtcNow,
            Participants =
            {
                new BookingParticipant
                {
                    UserId = request.UserId,
                    JoinedAt = DateTime.UtcNow
                }
            }
        };

        _db.Bookings.Add(booking);

        foreach (var slot in slotsToClaim)
        {
            slot.BookingId = booking.Id;
        }

        await _db.SaveChangesAsync(ct);

        return new BookSlotResponse(booking.Id);
    }
}
