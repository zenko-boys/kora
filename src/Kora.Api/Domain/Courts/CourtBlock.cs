using Kora.Domain;

namespace Kora.Domain.Courts;

public class CourtBlock : IAuditable
{
    public Guid Id { get; set; }
    public Guid CourtId { get; set; }
    public DateTime StartsAt { get; set; }
    public DateTime EndsAt { get; set; }
    public string? Reason { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid CreatedBy { get; set; }
    public Guid UpdatedBy { get; set; }

    public Court? Court { get; set; }
}
