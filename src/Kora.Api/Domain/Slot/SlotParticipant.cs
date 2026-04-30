namespace Kora.Domain.Slots;

public class SlotParticipant
{
    public Guid SlotId { get; set; }
    public Guid UserId { get; set; }
    public DateTime JoinedAt { get; set; }
}