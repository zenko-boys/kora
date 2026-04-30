using Kora.Domain.Clubs;
using Kora.Domain.Slots;

namespace Kora.Domain.Bookings;

public class Booking
{
    public Guid Id { get; set; }

    public Guid ClubId { get; set; }

    public BookingType Type { get; set; }

    public DateTime StartsAt { get; set; }

    public DateTime EndsAt { get; set; }

    public int Capacity { get; set; }

    public DateTime CreatedAt { get; set; }

    public Club? Club { get; set; }

    public List<Slot> Slots { get; set; } = [];

    public List<BookingParticipant> Participants { get; set; } = [];
}
