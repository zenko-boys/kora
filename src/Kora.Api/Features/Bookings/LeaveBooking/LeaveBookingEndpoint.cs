using Kora.Common.Endpoints;

namespace Kora.Features.Bookings.LeaveBooking;

public class LeaveBookingEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapDelete("/api/bookings/{bookingId:guid}/join", async (
            Guid bookingId,
            LeaveBookingHandler handler,
            CancellationToken ct) =>
        {
            var result = await handler.Handle(bookingId, ct);
            return Results.Ok(result);
        })
        .RequireAuthorization()
        .WithTags("Bookings")
        .WithName("LeaveBooking");
    }
}
