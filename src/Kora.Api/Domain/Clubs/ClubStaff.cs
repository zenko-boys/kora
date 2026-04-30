using Kora.Domain.Users;

namespace Kora.Domain.Clubs;

public class ClubStaff
{
    public Guid ClubId { get; set; }

    public Guid UserId { get; set; }

    public ClubStaffRole Role { get; set; }

    public DateTime CreatedAt { get; set; }

    public Club? Club { get; set; }

    public User? User { get; set; }
}
