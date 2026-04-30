namespace Kora.Features.Bookings.BookGame;

public record BookGameRequest(
    Guid ClubId,
    DateTime StartsAt,
    int DurationMinutes
);
