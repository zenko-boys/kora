using Kora.Domain.Users;
using Microsoft.AspNetCore.Authorization;

namespace Kora.Infrastructure.Auth;

public class AdminOnlyHandler : AuthorizationHandler<AdminOnlyRequirement>
{
    private readonly IUserContext _userContext;

    public AdminOnlyHandler(IUserContext userContext)
    {
        _userContext = userContext;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        AdminOnlyRequirement requirement)
    {
        if (context.User.Identity?.IsAuthenticated != true)
        {
            return;
        }

        var user = await _userContext.GetCurrentUserAsync();

        if (user.Role == UserRole.Admin)
        {
            context.Succeed(requirement);
        }
    }
}
