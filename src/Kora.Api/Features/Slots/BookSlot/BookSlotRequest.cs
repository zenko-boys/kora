namespace Kora.Features.Slots.BookSlot;

public record BookSlotRequest(
    Guid ClubId,
    Guid UserId,
    DateTime StartsAt,
    int DurationMinutes
);
