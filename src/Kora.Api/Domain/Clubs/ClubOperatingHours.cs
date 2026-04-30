namespace Kora.Domain.Clubs;

public class ClubOperatingHours
{
    public Guid Id { get; set; }

    public Guid ClubId { get; set; }
    public Club Club { get; set; } = null!;

    public DayOfWeek DayOfWeek { get; set; }

    public TimeOnly OpenTime { get; set; }
    public TimeOnly CloseTime { get; set; }
}