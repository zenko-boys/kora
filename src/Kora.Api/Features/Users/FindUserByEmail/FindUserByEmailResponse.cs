using Kora.Domain.Users;

namespace Kora.Features.Users.FindUserByEmail;

public record UserSummary(Guid Id, string Email, string? FirstName, string? LastName);
