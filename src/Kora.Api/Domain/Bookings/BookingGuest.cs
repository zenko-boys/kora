namespace Kora.Domain.Bookings;

public class BookingGuest
{
    public Guid Id { get; set; }
    public Guid BookingId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public Team? Team { get; set; }
}
