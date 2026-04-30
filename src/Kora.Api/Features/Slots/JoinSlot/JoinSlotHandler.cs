using FluentValidation;
using Kora.Common.Handlers;
using Kora.Domain.Bookings;
using Kora.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Kora.Features.Slots.JoinSlot;

public class JoinSlotHandler : IHandler
{
    private readonly AppDbContext _db;
    private readonly IValidator<JoinSlotRequest> _validator;

    public JoinSlotHandler(
        AppDbContext db,
        IValidator<JoinSlotRequest> validator)
    {
        _db = db;
        _validator = validator;
    }

    public async Task<JoinSlotResponse> Handle(
        Guid bookingId,
        JoinSlotRequest request,
        CancellationToken ct)
    {
        await _validator.ValidateAndThrowAsync(request, ct);

        var booking = await _db.Bookings
            .Include(b => b.Participants)
            .Include(b => b.Slots)
            .FirstOrDefaultAsync(b => b.Id == bookingId, ct);

        if (booking is null)
        {
            throw new InvalidOperationException("Booking not found.");
        }

        if (booking.Slots.Any(s => !s.IsPublished))
        {
            throw new InvalidOperationException("Booking is not published.");
        }

        if (booking.StartsAt <= DateTime.UtcNow)
        {
            throw new InvalidOperationException("Booking has already started.");
        }

        if (booking.Participants.Any(p => p.UserId == request.UserId))
        {
            throw new InvalidOperationException("User has already joined this booking.");
        }

        if (booking.Participants.Count >= booking.Capacity)
        {
            throw new InvalidOperationException("Booking is full.");
        }

        booking.Participants.Add(new BookingParticipant
        {
            UserId = request.UserId,
            JoinedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync(ct);

        return new JoinSlotResponse(
            booking.Id,
            request.UserId,
            booking.Participants.Count,
            booking.Capacity);
    }
}
