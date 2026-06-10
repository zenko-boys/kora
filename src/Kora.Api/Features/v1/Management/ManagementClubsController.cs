using Kora.Common.Controllers;
using Kora.Features.Management.Clubs.CreateClub;
using Kora.Features.Management.Clubs.GetClubSlots;
using Kora.Features.Management.Clubs.UpdateClub;
using Kora.Infrastructure.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Kora.Features.V1.Management;

[Tags("Management / Clubs")]
[Route("api/v{version:apiVersion}/management/clubs")]
public class ManagementClubsController : ApiController
{
    [HttpPost]
    [Authorize(Policy = AuthorizationPolicies.AdminOnly)]
    public async Task<IActionResult> Create(
        CreateClubRequest request,
        [FromServices] CreateClubHandler handler,
        CancellationToken ct)
    {
        var result = await handler.Handle(request, ct);
        return Created($"/api/v1/management/clubs/{result.Id}", result);
    }

    [HttpPut("{clubId:guid}")]
    [Authorize(Policy = AuthorizationPolicies.ClubStaffOrAdmin)]
    public async Task<IActionResult> Update(
        Guid clubId,
        UpdateClubRequest request,
        [FromServices] UpdateClubHandler handler,
        CancellationToken ct)
        => Ok(await handler.Handle(clubId, request, ct));

    [HttpGet("{clubId:guid}/slots")]
    [Authorize(Policy = AuthorizationPolicies.ClubStaffOrAdmin)]
    public async Task<IActionResult> GetSlots(
        Guid clubId,
        [FromQuery] DateOnly date,
        [FromServices] GetClubSlotsHandler handler,
        CancellationToken ct)
        => Ok(await handler.Handle(clubId, date, ct));
}
