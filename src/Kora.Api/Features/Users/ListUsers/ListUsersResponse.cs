using Kora.Domain.Users;

namespace Kora.Features.Users.ListUsers;

public record ListUsersResponse(IReadOnlyList<UserSummary> Users);

public record UserSummary(Guid Id, string Email, string? FirstName, string? LastName, UserRole Role);
