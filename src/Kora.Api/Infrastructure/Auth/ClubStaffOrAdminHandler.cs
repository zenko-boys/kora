using Kora.Domain.Users;
using Kora.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace Kora.Infrastructure.Auth;

public class ClubStaffOrAdminHandler : AuthorizationHandler<ClubStaffOrAdminRequirement>
{
    private readonly IHttpContextAccessor _http;
    private readonly IUserContext _userContext;
    private readonly AppDbContext _db;

    public ClubStaffOrAdminHandler(
        IHttpContextAccessor http,
        IUserContext userContext,
        AppDbContext db)
    {
        _http = http;
        _userContext = userContext;
        _db = db;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ClubStaffOrAdminRequirement requirement)
    {
        if (context.User.Identity?.IsAuthenticated != true)
        {
            return;
        }

        var user = await _userContext.GetCurrentUserAsync();

        if (user.Role == UserRole.Admin)
        {
            context.Succeed(requirement);
            return;
        }

        var clubIdValue = _http.HttpContext?.Request.RouteValues["clubId"]?.ToString();
        if (!Guid.TryParse(clubIdValue, out var clubId))
        {
            return;
        }

        var isStaff = await _db.ClubStaff
            .AnyAsync(s => s.ClubId == clubId && s.UserId == user.Id);

        if (isStaff)
        {
            context.Succeed(requirement);
        }
    }
}
