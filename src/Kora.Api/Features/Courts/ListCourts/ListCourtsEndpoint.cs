using Kora.Common.Endpoints;

namespace Kora.Features.Courts.ListCourts;

public class ListCourtsEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/clubs/{clubId:guid}/courts", async (
            Guid clubId,
            ListCourtsHandler handler,
            CancellationToken ct) =>
        {
            var result = await handler.Handle(clubId, ct);
            return Results.Ok(result);
        })
        .RequireAuthorization()
        .WithTags("Courts")
        .WithName("ListCourts");
    }
}
