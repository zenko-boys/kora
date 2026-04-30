namespace Kora.Features.Slots.JoinSlot;

public record JoinSlotResponse(
    Guid SlotId,
    Guid UserId,
    int ParticipantsCount,
    int Capacity
);