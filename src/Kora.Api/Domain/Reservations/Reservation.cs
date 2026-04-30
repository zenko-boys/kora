using Kora.Domain.Bookings;
using Kora.Domain.Courts;

namespace Kora.Domain.Reservations;

public class Reservation
{
    public Guid Id { get; set; }

    public Guid BookingId { get; set; }

    public Guid CourtId { get; set; }

    public DateTime StartsAt { get; set; }

    public DateTime EndsAt { get; set; }

    public Booking? Booking { get; set; }

    public Court? Court { get; set; }
}
