using System.Security.Claims;
using Kora.Domain.Users;
using Kora.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Kora.Infrastructure.Auth;

public class UserContext : IUserContext
{
    private readonly IHttpContextAccessor _http;
    private readonly AppDbContext _db;
    private User? _cached;

    public UserContext(IHttpContextAccessor http, AppDbContext db)
    {
        _http = http;
        _db = db;
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

        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.IdpUserId == idpUserId, ct);

        if (user is null)
        {
            user = new User
            {
                Id = Guid.NewGuid(),
                IdpUserId = idpUserId,
                Email = principal.FindFirstValue(ClaimTypes.Email)
                    ?? principal.FindFirstValue("email")
                    ?? string.Empty,
                Role = UserRole.Player,
                CreatedAt = DateTime.UtcNow
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync(ct);
        }

        _cached = user;
        return user;
    }
}
