using Kora.Domain.Users;
using Kora.Infrastructure.Auth;
using Kora.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Kora.Infrastructure.Auth;

public class ClubAuthorizationService : IClubAuthorizationService
{
    private readonly IUserContext _userContext;
    private readonly AppDbContext _db;

    public ClubAuthorizationService(IUserContext userContext, AppDbContext db)
    {
        _userContext = userContext;
        _db = db;
    }

    public async Task<bool> IsClubStaffOrAdminAsync(Guid clubId, CancellationToken ct = default)
    {
        var user = await _userContext.GetCurrentUserAsync(ct);
        if (user.Role == UserRole.Admin) return true;
        return await _db.ClubStaff.AnyAsync(s => s.ClubId == clubId && s.UserId == user.Id, ct);
    }

    public async Task EnsureClubStaffOrAdminAsync(Guid clubId, CancellationToken ct = default)
    {
        if (!await IsClubStaffOrAdminAsync(clubId, ct))
            throw new UnauthorizedAccessException("Only club staff or admins can perform this action.");
    }
}
