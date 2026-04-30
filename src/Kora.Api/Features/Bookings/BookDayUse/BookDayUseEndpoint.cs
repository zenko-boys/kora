using Kora.Common.Endpoints;
using Kora.Infrastructure.Auth;

namespace Kora.Features.Bookings.BookDayUse;

public class BookDayUseEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/clubs/{clubId:guid}/bookings/dayuse", async (
            Guid clubId,
            BookDayUseRequest request,
            BookDayUseHandler handler,
            CancellationToken ct) =>
        {
            var result = await handler.Handle(clubId, request, ct);
            return Results.Created($"/api/bookings/{result.BookingId}", result);
        })
        .RequireAuthorization(AuthorizationPolicies.ClubStaffOrAdmin)
        .WithTags("Bookings")
        .WithName("BookDayUse");
    }
}
