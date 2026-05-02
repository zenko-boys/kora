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
    private User? _cached;

    public UserContext(
        IHttpContextAccessor http,
        AppDbContext db,
        IOptions<AuthOptions> authOptions)
    {
        _http = http;
        _db = db;
        _authOptions = authOptions.Value;
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
            ?? principal.FindFirstValue("email")
            ?? string.Empty;

        var shouldBeAdmin = !string.IsNullOrWhiteSpace(_authOptions.AdminEmail)
            && email.Equals(_authOptions.AdminEmail, StringComparison.OrdinalIgnoreCase);

        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.IdpUserId == idpUserId, ct);

        if (user is null)
        {
            user = new User
            {
                Id = Guid.NewGuid(),
                IdpUserId = idpUserId,
                Email = email,
                Role = shouldBeAdmin ? UserRole.Admin : UserRole.Player,
                CreatedAt = DateTime.UtcNow
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync(ct);
        }
        else if (shouldBeAdmin && user.Role != UserRole.Admin)
        {
            user.Role = UserRole.Admin;
            await _db.SaveChangesAsync(ct);
        }

        _cached = user;
        return user;
    }
}
