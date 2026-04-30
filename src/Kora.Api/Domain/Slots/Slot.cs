using Kora.Domain.Bookings;
using Kora.Domain.Clubs;

namespace Kora.Domain.Slots;

public class Slot
{
    public Guid Id { get; set; }

    public Guid ClubId { get; set; }

    public DateTime StartsAt { get; set; }

    public DateTime EndsAt { get; set; }

    public bool IsPublished { get; set; }

    public Guid? BookingId { get; set; }

    public Club? Club { get; set; }

    public Booking? Booking { get; set; }
}
