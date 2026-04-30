using System.ComponentModel.DataAnnotations;

namespace Kora.Features.Slots.JoinSlot;

public record JoinSlotRequest(
    Guid UserId
);