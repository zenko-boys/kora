namespace Kora.Domain.Slots;

public class Slot
{
    public Guid Id { get; set; }

    public Guid ClubId { get; set; }
    public Guid? CourtId { get; set; }

    public SlotType Type { get; set; }

    public DateTime StartsAt { get; set; }
    public DateTime EndsAt { get; set; }

    public int Capacity { get; set; }

    public List<SlotParticipant> Participants { get; set; } = [];
}