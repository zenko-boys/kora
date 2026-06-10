using Kora.Domain.Users;

namespace Kora.Domain.Bookings;

public class BookingParticipant
{
    public Guid BookingId { get; set; }
    public Guid UserId { get; set; }
    public DateTime JoinedAt { get; set; }
    public Team? Team { get; set; }

    public User? User { get; set; }
}
