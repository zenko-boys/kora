namespace Kora.Features.Slots.BookDayUse;

public record BookDayUseRequest(
    DateTime StartsAt,
    int DurationMinutes,
    int CourtsToOccupy,
    int Capacity
);
