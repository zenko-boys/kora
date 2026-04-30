using Kora.Common.Endpoints;

namespace Kora.Features.Clubs.GenerateSchedule;

public class GenerateScheduleEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/clubs/{clubId:guid}/schedule/generate", async (
            Guid clubId,
            GenerateScheduleRequest request,
            GenerateScheduleHandler handler,
            CancellationToken ct) =>
        {
            var result = await handler.Handle(clubId, request, ct);
            return Results.Ok(result);
        })
        .WithTags("Clubs")
        .WithName("GenerateSchedule");
    }
}
