using Kora.Domain.Users;

namespace Kora.Infrastructure.Auth;

public interface IUserContext
{
    Task<User> GetCurrentUserAsync(CancellationToken ct = default);
}
