using Kora.Common.Endpoints;

namespace Kora.Features.Slots.BookSlot;

public class BookSlotEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/bookings/game", async (
            BookSlotRequest request,
            BookSlotHandler handler,
            CancellationToken ct) =>
        {
            var result = await handler.Handle(request, ct);
            return Results.Created($"/api/bookings/{result.BookingId}", result);
        })
        .WithTags("Bookings")
        .WithName("BookSlot");
    }
}
