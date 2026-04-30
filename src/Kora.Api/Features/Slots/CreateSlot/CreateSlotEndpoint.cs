
using Kora.Common.Endpoints;

namespace Kora.Features.Slots.CreateSlot;

public class CreateSlotEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/slots", async (
            CreateSlotRequest request,
            CreateSlotHandler handler,
            CancellationToken ct) =>
        {
            var result = await handler.Handle(request, ct);
            return Results.Created($"/api/slots/{result.Id}", result);
        })
        .WithTags("Slots")
        .WithName("CreateSlot")
        .Produces<CreateSlotResponse>(StatusCodes.Status201Created)
        .ProducesProblem(StatusCodes.Status400BadRequest);
    }
}