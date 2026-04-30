using FluentValidation;
using Kora.Domain.Slots;
using Kora.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Kora.Features.Slots.JoinSlot;

public class JoinSlotHandler
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
        Guid slotId,
        JoinSlotRequest request,
        CancellationToken ct)
    {
        await _validator.ValidateAndThrowAsync(request, ct);

        await using var transaction = await _db.Database.BeginTransactionAsync(ct);

        var slot = await _db.Slots
            .Include(x => x.Participants)
            .FirstOrDefaultAsync(x => x.Id == slotId, ct);

        if (slot is null)
        {
            throw new InvalidOperationException("Slot não encontrado.");
        }

        var alreadyJoined = slot.Participants
            .Any(x => x.UserId == request.UserId);

        if (alreadyJoined)
        {
            throw new InvalidOperationException("Usuário já está nesse slot.");
        }

        if (slot.Participants.Count >= slot.Capacity)
        {
            throw new InvalidOperationException("Slot cheio.");
        }

        var participant = new SlotParticipant
        {
            SlotId = slot.Id,
            UserId = request.UserId,
            JoinedAt = DateTime.UtcNow
        };

        slot.Participants.Add(participant);

        await _db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return new JoinSlotResponse(
            slot.Id,
            request.UserId,
            slot.Participants.Count,
            slot.Capacity);
    }
}