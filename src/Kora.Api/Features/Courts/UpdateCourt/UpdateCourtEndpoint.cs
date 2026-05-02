using Kora.Common.Endpoints;
using Kora.Infrastructure.Auth;

namespace Kora.Features.Courts.UpdateCourt;

public class UpdateCourtEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("/api/clubs/{clubId:guid}/courts/{courtId:guid}", async (
            Guid clubId,
            Guid courtId,
            UpdateCourtRequest request,
            UpdateCourtHandler handler,
            CancellationToken ct) =>
        {
            var result = await handler.Handle(clubId, courtId, request, ct);
            return Results.Ok(result);
        })
        .RequireAuthorization(AuthorizationPolicies.ClubStaffOrAdmin)
        .WithTags("Courts")
        .WithName("UpdateCourt");
    }
}
