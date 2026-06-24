using Kora.Common.Controllers;
using Kora.Features.Users.ListMyClubs;
using Kora.Features.Users.FindUserByEmail;
using Kora.Features.Users.WhoAmI;
using Kora.Infrastructure.Auth;
using Microsoft.AspNetCore.Mvc;

namespace Kora.Features.V1;

[Tags("Users")]
[Route("api/v{version:apiVersion}")]
public class UsersController : ApiController
{
    [HttpGet("whoami")]
    public async Task<IActionResult> WhoAmI(
        [FromServices] IUserContext userContext,
        CancellationToken ct)
    {
        var user = await userContext.GetCurrentUserAsync(ct);
        return Ok(new WhoAmIResponse(user.Id, user.IdpUserId, user.Email, user.Role));
    }

    [HttpGet("me/clubs")]
    public async Task<IActionResult> ListMyClubs(
        [FromServices] ListMyClubsHandler handler,
        CancellationToken ct)
        => Ok(await handler.Handle(ct));

    [HttpGet("users/by-email")]
    public async Task<IActionResult> FindUserByEmail(
        [FromQuery] string email,
        [FromServices] FindUserByEmailHandler handler,
        CancellationToken ct)
    {
        var user = await handler.Handle(email, ct);
        return user is null ? NotFound() : Ok(user);
    }
}
