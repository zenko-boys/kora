using Kora.Common.Controllers;
using Kora.Features.Clubs.GetClubSlots;
using Microsoft.AspNetCore.Mvc;

namespace Kora.Features.V1;

[Tags("Clubs")]
public class ClubsController : ApiController
{
    [HttpGet("{clubId:guid}/slots")]
    public async Task<IActionResult> GetSlots(
        Guid clubId,
        [FromQuery] DateOnly date,
        [FromServices] GetClubSlotsHandler handler,
        CancellationToken ct)
        => Ok(await handler.Handle(clubId, date, ct));
}
