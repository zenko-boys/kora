namespace Kora.Domain.Users;

public class User
{
    public Guid Id { get; set; }

    public string IdpUserId { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public UserRole Role { get; set; }

    public DateTime CreatedAt { get; set; }
}
