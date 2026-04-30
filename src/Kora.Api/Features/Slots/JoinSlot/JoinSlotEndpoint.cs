using Kora.Common.Endpoints;

namespace Kora.Features.Slots.JoinSlot;

public class JoinSlotEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/slots/{slotId:guid}/join", async (
            Guid slotId,
            JoinSlotRequest request,
            JoinSlotHandler handler,
            CancellationToken ct) =>
        {
            var result = await handler.Handle(slotId, request, ct);

            return Results.Ok(result);
        })
        .WithTags("Slots")
        .WithName("JoinSlot")
        .Produces<JoinSlotResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status404NotFound);
    }
}