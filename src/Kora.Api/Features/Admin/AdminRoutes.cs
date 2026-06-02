using Kora.Common.Endpoints;
using Kora.Features.Admin.TestEmail;
using Kora.Infrastructure.Auth;

namespace Kora.Features.Admin;

public class AdminRoutes : IEndpointGroup
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/admin").WithTags("Admin");

        group.MapPost("/test-email", async (
            TestEmailRequest request,
            TestEmailHandler handler,
            CancellationToken ct) =>
        {
            var result = await handler.Handle(request, ct);
            return Results.Ok(result);
        })
        .RequireAuthorization(AuthorizationPolicies.AdminOnly)
        .WithName("TestEmail");
    }
}
