using Kora.Domain.Slots;

namespace Kora.Features.Slots.CreateSlot;

public record CreateSlotRequest(
    Guid ClubId,
    Guid? CourtId,
    SlotType Type,
    DateTime StartsAt,
    DateTime EndsAt,
    int Capacity
);