using Kora.Common.Controllers;
using Kora.Features.Management.Courts.BlockCourt;
using Kora.Features.Management.Courts.CreateCourt;
using Kora.Features.Management.Courts.ListCourtBlocks;
using Kora.Features.Management.Courts.UnblockCourt;
using Kora.Features.Management.Courts.UpdateCourt;
using Kora.Infrastructure.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Kora.Features.V1.Management;

[Tags("Management / Courts")]
[Route("api/v{version:apiVersion}/management/clubs/{clubId:guid}/courts")]
[Authorize(Policy = AuthorizationPolicies.ClubStaffOrAdmin)]
public class ManagementCourtsController : ApiController
{
    [HttpPost]
    public async Task<IActionResult> Create(
        Guid clubId,
        CreateCourtRequest request,
        [FromServices] CreateCourtHandler handler,
        CancellationToken ct)
    {
        var result = await handler.Handle(clubId, request, ct);
        return Created($"/api/v1/management/clubs/{clubId}/courts/{result.Id}", result);
    }

    [HttpPut("{courtId:guid}")]
    public async Task<IActionResult> Update(
        Guid clubId,
        Guid courtId,
        UpdateCourtRequest request,
        [FromServices] UpdateCourtHandler handler,
        CancellationToken ct)
        => Ok(await handler.Handle(clubId, courtId, request, ct));

    [HttpPost("{courtId:guid}/blocks")]
    public async Task<IActionResult> Block(
        Guid clubId,
        Guid courtId,
        BlockCourtRequest request,
        [FromServices] BlockCourtHandler handler,
        CancellationToken ct)
    {
        var result = await handler.Handle(clubId, courtId, request, ct);
        return Created($"/api/v1/management/clubs/{clubId}/courts/{courtId}/blocks/{result.Id}", result);
    }

    [HttpGet("{courtId:guid}/blocks")]
    public async Task<IActionResult> ListBlocks(
        Guid clubId,
        Guid courtId,
        [FromServices] ListCourtBlocksHandler handler,
        CancellationToken ct)
        => Ok(await handler.Handle(clubId, courtId, ct));

    [HttpDelete("{courtId:guid}/blocks/{blockId:guid}")]
    public async Task<IActionResult> Unblock(
        Guid clubId,
        Guid courtId,
        Guid blockId,
        [FromServices] UnblockCourtHandler handler,
        CancellationToken ct)
    {
        await handler.Handle(clubId, courtId, blockId, ct);
        return NoContent();
    }
}
