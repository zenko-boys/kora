using System.Security.Claims;
using Kora.Configuration;
using Kora.Domain.Users;
using Kora.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Kora.Infrastructure.Auth;

public class UserContext : IUserContext
{
    private readonly IHttpContextAccessor _http;
    private readonly AppDbContext _db;
    private readonly AuthOptions _authOptions;
    private readonly CurrentUserIdHolder _userIdHolder;
    private User? _cached;

    public UserContext(
        IHttpContextAccessor http,
        AppDbContext db,
        IOptions<AuthOptions> authOptions,
        CurrentUserIdHolder userIdHolder)
    {
        _http = http;
        _db = db;
        _authOptions = authOptions.Value;
        _userIdHolder = userIdHolder;
    }

    public async Task<User> GetCurrentUserAsync(CancellationToken ct = default)
    {
        if (_cached is not null)
        {
            return _cached;
        }

        var principal = _http.HttpContext?.User
            ?? throw new InvalidOperationException("No HttpContext available.");

        if (principal.Identity?.IsAuthenticated != true)
        {
            throw new InvalidOperationException("User is not authenticated.");
        }

        var idpUserId = principal.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? principal.FindFirstValue("sub")
            ?? throw new InvalidOperationException("JWT is missing 'sub' claim.");

        var email = principal.FindFirstValue(ClaimTypes.Email)
            ?? principal.FindFirstValue("email");

        var firstName = principal.FindFirstValue(ClaimTypes.GivenName)
            ?? principal.FindFirstValue("given_name");

        var lastName = principal.FindFirstValue(ClaimTypes.Surname)
            ?? principal.FindFirstValue("family_name");

        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.IdpUserId == idpUserId, ct);

        if (user is null)
        {
            if (email is null)
                throw new InvalidOperationException("User not found and token has no email to create one.");

            var expectedRole = _authOptions.AdminEmails
                .Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Any(a => a.Equals(email, StringComparison.OrdinalIgnoreCase))
                    ? UserRole.Admin
                    : UserRole.Member;

            user = new User
            {
                Id = Guid.NewGuid(),
                IdpUserId = idpUserId,
                Email = email,
                FirstName = firstName,
                LastName = lastName,
                Role = expectedRole,
                CreatedAt = DateTime.UtcNow
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync(ct);
        }

        _cached = user;
        _userIdHolder.UserId = user.Id;
        return user;
    }
}
