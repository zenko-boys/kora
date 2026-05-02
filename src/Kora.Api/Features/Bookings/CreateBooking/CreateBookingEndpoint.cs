using Kora.Common.Endpoints;

namespace Kora.Features.Bookings.CreateBooking;

public class CreateBookingEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/bookings", async (
            CreateBookingRequest request,
            CreateBookingHandler handler,
            CancellationToken ct) =>
        {
            var result = await handler.Handle(request, ct);
            return Results.Created($"/api/bookings/{result.BookingId}", result);
        })
        .RequireAuthorization()
        .WithTags("Bookings")
        .WithName("CreateBooking");
    }
}
