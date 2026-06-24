using Kora.Common.Controllers;
using Kora.Features.Management.Bookings.AddParticipant;
using Kora.Infrastructure.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Kora.Features.V1.Management;

[Tags("Management / Bookings")]
[Route("api/v{version:apiVersion}/management/bookings")]
[Authorize(Policy = AuthorizationPolicies.ClubStaffOrAdmin)]
public class ManagementBookingsController : ApiController
{
    [HttpPost("{bookingId:guid}/participants")]
    public async Task<IActionResult> AddParticipant(
        Guid bookingId,
        AddParticipantRequest request,
        [FromServices] AddParticipantHandler handler,
        CancellationToken ct)
        => Ok(await handler.Handle(bookingId, request, ct));
}
