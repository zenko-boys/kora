using Kora.Common.Endpoints;
using Kora.Infrastructure.Auth;

namespace Kora.Features.Users.WhoAmI;

public class WhoAmIEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/whoami", async (
            IUserContext userContext,
            CancellationToken ct) =>
        {
            var user = await userContext.GetCurrentUserAsync(ct);
            return Results.Ok(new WhoAmIResponse(user.Id, user.IdpUserId, user.Email, user.Role));
        })
        .RequireAuthorization()
        .WithTags("Users")
        .WithName("WhoAmI");
    }
}
