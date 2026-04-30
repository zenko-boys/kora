using Kora.Common.Endpoints;

namespace Kora.Features.Bookings.JoinBooking;

public class JoinBookingEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/bookings/{bookingId:guid}/join", async (
            Guid bookingId,
            JoinBookingHandler handler,
            CancellationToken ct) =>
        {
            var result = await handler.Handle(bookingId, ct);
            return Results.Ok(result);
        })
        .RequireAuthorization()
        .WithTags("Bookings")
        .WithName("JoinBooking");
    }
}
