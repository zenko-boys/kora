using Kora.Common.Controllers;
using Kora.Features.Courts.ListCourts;
using Microsoft.AspNetCore.Mvc;

namespace Kora.Features.V1;

[Tags("Courts")]
[Route("api/v{version:apiVersion}/clubs/{clubId:guid}/courts")]
public class CourtsController : ApiController
{
    [HttpGet]
    public async Task<IActionResult> List(
        Guid clubId,
        [FromServices] ListCourtsHandler handler,
        CancellationToken ct)
        => Ok(await handler.Handle(clubId, ct));
}
