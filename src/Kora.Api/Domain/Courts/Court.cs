using Kora.Domain.Clubs;

namespace Kora.Domain.Courts;

public class Court
{
    public Guid Id { get; set; }

    public Guid ClubId { get; set; }

    public string Name { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public Club? Club { get; set; }
}