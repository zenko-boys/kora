using Kora.Common.Endpoints;

namespace Kora.Features.Courts.CreateCourt;

public class CreateCourtEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/clubs/{clubId:guid}/courts", async (
            Guid clubId,
            CreateCourtRequest request,
            CreateCourtHandler handler,
            CancellationToken ct) =>
        {
            var result = await handler.Handle(clubId, request, ct);
            return Results.Created($"/api/courts/{result.Id}", result);
        })
        .WithTags("Courts")
        .WithName("CreateCourt");
    }
}
