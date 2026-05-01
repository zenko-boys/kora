using Kora.Common.Endpoints;

namespace Kora.Features.Bookings.CreateBooking;

public class CreateBookingEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/clubs/{clubId:guid}/bookings", async (
            Guid clubId,
            CreateBookingRequest request,
            CreateBookingHandler handler,
            CancellationToken ct) =>
        {
            var result = await handler.Handle(clubId, request, ct);
            return Results.Created($"/api/bookings/{result.BookingId}", result);
        })
        .RequireAuthorization()
        .WithTags("Bookings")
        .WithName("CreateBooking");
    }
}
