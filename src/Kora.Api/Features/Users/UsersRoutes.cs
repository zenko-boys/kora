using Kora.Common.Endpoints;
using Kora.Features.Users.ListMyClubs;
using Kora.Features.Users.WhoAmI;
using Kora.Infrastructure.Auth;

namespace Kora.Features.Users;

public class UsersRoutes : IEndpointGroup
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("").WithTags("Users");

        group.MapGet("/whoami", async (
            IUserContext userContext,
            CancellationToken ct) =>
        {
            var user = await userContext.GetCurrentUserAsync(ct);
            return Results.Ok(new WhoAmIResponse(user.Id, user.IdpUserId, user.Email, user.Role));
        })
        .WithName("WhoAmI");

        group.MapGet("/me/clubs", async (
            ListMyClubsHandler handler,
            CancellationToken ct) =>
        {
            var result = await handler.Handle(ct);
            return Results.Ok(result);
        })
        .WithName("ListMyClubs");
    }
}
