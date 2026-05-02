using Kora.Common.Endpoints;
using Kora.Infrastructure.Auth;

namespace Kora.Features.Clubs.UpdateClub;

public class UpdateClubEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("/api/clubs/{clubId:guid}", async (
            Guid clubId,
            UpdateClubRequest request,
            UpdateClubHandler handler,
            CancellationToken ct) =>
        {
            var result = await handler.Handle(clubId, request, ct);
            return Results.Ok(result);
        })
        .RequireAuthorization(AuthorizationPolicies.ClubStaffOrAdmin)
        .WithTags("Clubs")
        .WithName("UpdateClub");
    }
}
