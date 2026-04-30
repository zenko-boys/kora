using Kora.Domain.Users;

namespace Kora.Features.Users.WhoAmI;

public record WhoAmIResponse(
    Guid Id,
    string IdpUserId,
    string Email,
    UserRole Role
);
