using Kora.Common.Endpoints;
using Kora.Features.Clubs.CreateClub;
using Kora.Features.Clubs.UpdateClub;
using Kora.Infrastructure.Auth;

namespace Kora.Features.Clubs;

public class ClubsRoutes : IEndpointGroup
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/clubs").WithTags("Clubs");

        group.MapPost("/", async (
            CreateClubRequest request,
            CreateClubHandler handler,
            CancellationToken ct) =>
        {
            var result = await handler.Handle(request, ct);
            return Results.Created($"/api/v1/clubs/{result.Id}", result);
        })
        .RequireAuthorization(AuthorizationPolicies.AdminOnly)
        .WithName("CreateClub");

        group.MapPut("/{clubId:guid}", async (
            Guid clubId,
            UpdateClubRequest request,
            UpdateClubHandler handler,
            CancellationToken ct) =>
        {
            var result = await handler.Handle(clubId, request, ct);
            return Results.Ok(result);
        })
        .RequireAuthorization(AuthorizationPolicies.ClubStaffOrAdmin)
        .WithName("UpdateClub");
    }
}
