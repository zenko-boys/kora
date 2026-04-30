namespace Kora.Features.Slots.JoinSlot;

public record JoinSlotResponse(
    Guid BookingId,
    Guid UserId,
    int ParticipantsCount,
    int Capacity
);
