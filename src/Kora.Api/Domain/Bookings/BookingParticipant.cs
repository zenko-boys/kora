namespace Kora.Domain.Bookings;

public class BookingParticipant
{
    public Guid BookingId { get; set; }
    public Guid UserId { get; set; }
    public DateTime JoinedAt { get; set; }
}
