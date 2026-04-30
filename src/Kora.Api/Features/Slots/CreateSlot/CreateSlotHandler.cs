using FluentValidation;
using Kora.Common.Handlers;
using Kora.Domain.Slots;
using Kora.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Kora.Features.Slots.CreateSlot;

public class CreateSlotHandler : IHandler
{
    private readonly AppDbContext _db;
    private readonly IValidator<CreateSlotRequest> _validator;

    public CreateSlotHandler(
        AppDbContext db,
        IValidator<CreateSlotRequest> validator)
    {
        _db = db;
        _validator = validator;
    }

    public async Task<CreateSlotResponse> Handle(
        CreateSlotRequest request,
        CancellationToken ct)
    {
        await _validator.ValidateAndThrowAsync(request, ct);

        var hasOverlap = await _db.Slots.AnyAsync(slot =>
            slot.ClubId == request.ClubId &&
            slot.CourtId == request.CourtId &&
            slot.StartsAt < request.EndsAt &&
            slot.EndsAt > request.StartsAt,
            ct);

        if (hasOverlap)
        {
            throw new InvalidOperationException(
                "Essa quadra já tem um slot nesse horário.");
        }

        var slot = new Slot
        {
            Id = Guid.NewGuid(),
            ClubId = request.ClubId,
            CourtId = request.CourtId,
            Type = request.Type,
            StartsAt = request.StartsAt,
            EndsAt = request.EndsAt,
            Capacity = request.Capacity
        };

        _db.Slots.Add(slot);
        await _db.SaveChangesAsync(ct);

        return new CreateSlotResponse(slot.Id);
    }
}