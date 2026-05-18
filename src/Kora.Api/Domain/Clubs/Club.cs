using Kora.Domain.Bookings;
using Kora.Domain.Courts;

namespace Kora.Domain.Clubs;

public class Club : IAuditable
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string TimeZoneId { get; set; } = string.Empty;

    public int SlotCellDurationMinutes { get; set; }

    public int MinimumBookingDurationMinutes { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid CreatedBy { get; set; }
    public Guid UpdatedBy { get; set; }

    public List<Court> Courts { get; set; } = [];

    public List<Booking> Bookings { get; set; } = [];

    public List<ClubOperatingHours> OperatingHours { get; set; } = [];

    public List<ClubStaff> Staff { get; set; } = [];
}
