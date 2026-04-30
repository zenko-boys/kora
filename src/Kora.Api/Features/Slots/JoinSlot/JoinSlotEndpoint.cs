using Kora.Common.Endpoints;

namespace Kora.Features.Slots.JoinSlot;

public class JoinSlotEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/bookings/{bookingId:guid}/join", async (
            Guid bookingId,
            JoinSlotRequest request,
            JoinSlotHandler handler,
            CancellationToken ct) =>
        {
            var result = await handler.Handle(bookingId, request, ct);
            return Results.Ok(result);
        })
        .WithTags("Bookings")
        .WithName("JoinBooking");
    }
}
