using Kora.Common.Endpoints;

namespace Kora.Features.Users.ListMyClubs;

public class ListMyClubsEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/me/clubs", async (
            ListMyClubsHandler handler,
            CancellationToken ct) =>
        {
            var result = await handler.Handle(ct);
            return Results.Ok(result);
        })
        .RequireAuthorization()
        .WithTags("Users")
        .WithName("ListMyClubs");
    }
}
