using Kora.Common.Endpoints;

namespace Kora.Features.Bookings.DeleteBooking;

public class DeleteBookingEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapDelete("/api/bookings/{bookingId:guid}", async (
            Guid bookingId,
            DeleteBookingHandler handler,
            CancellationToken ct) =>
        {
            await handler.Handle(bookingId, ct);
            return Results.NoContent();
        })
        .RequireAuthorization()
        .WithTags("Bookings")
        .WithName("DeleteBooking");
    }
}
