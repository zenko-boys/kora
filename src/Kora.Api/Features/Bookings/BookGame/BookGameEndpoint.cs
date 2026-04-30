using Kora.Common.Endpoints;

namespace Kora.Features.Bookings.BookGame;

public class BookGameEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/bookings/game", async (
            BookGameRequest request,
            BookGameHandler handler,
            CancellationToken ct) =>
        {
            var result = await handler.Handle(request, ct);
            return Results.Created($"/api/bookings/{result.BookingId}", result);
        })
        .RequireAuthorization()
        .WithTags("Bookings")
        .WithName("BookGame");
    }
}
