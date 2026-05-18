using Kora.Domain.Clubs;
using Kora.Domain.Reservations;

namespace Kora.Domain.Bookings;

public class Booking : IAuditable
{
    public Guid Id { get; set; }

    public Guid ClubId { get; set; }

    public BookingType Type { get; set; }

    public DateTime StartsAt { get; set; }

    public DateTime EndsAt { get; set; }

    public int Capacity { get; set; }

    public bool IsPrivate { get; set; }

    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid CreatedBy { get; set; }
    public Guid UpdatedBy { get; set; }

    public Club? Club { get; set; }

    public List<Reservation> Reservations { get; set; } = [];

    public List<BookingParticipant> Participants { get; set; } = [];
}
