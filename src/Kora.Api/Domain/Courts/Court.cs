using Kora.Domain.Clubs;
using Kora.Domain.Reservations;

namespace Kora.Domain.Courts;

public class Court : IAuditable
{
    public Guid Id { get; set; }

    public Guid ClubId { get; set; }

    public string Name { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid CreatedBy { get; set; }
    public Guid UpdatedBy { get; set; }

    public Club? Club { get; set; }

    public List<Reservation> Reservations { get; set; } = [];

    public List<CourtBlock> Blocks { get; set; } = [];
}
