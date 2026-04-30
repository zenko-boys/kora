using Kora.Common.Endpoints;

namespace Kora.Features.Clubs.PublishSchedule;

public class PublishScheduleEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/clubs/{clubId:guid}/schedule/publish", async (
            Guid clubId,
            PublishScheduleHandler handler,
            CancellationToken ct) =>
        {
            var result = await handler.Handle(clubId, ct);
            return Results.Ok(result);
        })
        .WithTags("Clubs")
        .WithName("PublishSchedule");
    }
}
