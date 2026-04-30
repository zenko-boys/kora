using Kora.Common.Endpoints;
using Kora.Infrastructure.Auth;

namespace Kora.Features.Clubs.CreateClub;

public class CreateClubEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/clubs", async (
            CreateClubRequest request,
            CreateClubHandler handler,
            CancellationToken ct) =>
        {
            var result = await handler.Handle(request, ct);
            return Results.Created($"/api/clubs/{result.Id}", result);
        })
        .RequireAuthorization(AuthorizationPolicies.AdminOnly)
        .WithTags("Clubs")
        .WithName("CreateClub");
    }
}
