namespace Kora.Features.Bookings.BookDayUse;

public record BookDayUseRequest(
    DateTime StartsAt,
    int DurationMinutes,
    int CourtsToOccupy,
    int Capacity
);
