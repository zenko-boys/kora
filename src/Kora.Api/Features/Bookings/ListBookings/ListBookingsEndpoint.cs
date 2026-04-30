using Kora.Common.Endpoints;
using Kora.Domain.Bookings;

namespace Kora.Features.Bookings.ListBookings;

public class ListBookingsEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/bookings", async (
            Guid? clubId,
            BookingType? type,
            bool? open,
            DateTime? fromUtc,
            DateTime? toUtc,
            ListBookingsHandler handler,
            CancellationToken ct) =>
        {
            var result = await handler.Handle(clubId, type, open, fromUtc, toUtc, ct);
            return Results.Ok(result);
        })
        .RequireAuthorization()
        .WithTags("Bookings")
        .WithName("ListBookings");
    }
}
