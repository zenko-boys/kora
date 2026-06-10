using Kora.Common.Controllers;
using Kora.Features.Admin.TestEmail;
using Kora.Infrastructure.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Kora.Features.V1.Admin;

[Tags("Admin")]
[Authorize(Policy = AuthorizationPolicies.AdminOnly)]
public class AdminController : ApiController
{
    [HttpPost("test-email")]
    public async Task<IActionResult> TestEmail(
        TestEmailRequest request,
        [FromServices] TestEmailHandler handler,
        CancellationToken ct)
        => Ok(await handler.Handle(request, ct));
}
