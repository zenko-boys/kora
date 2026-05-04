using Kora.Common.Endpoints;
using Kora.Features.Courts.CreateCourt;
using Kora.Features.Courts.ListCourts;
using Kora.Features.Courts.UpdateCourt;
using Kora.Infrastructure.Auth;

namespace Kora.Features.Courts;

public class CourtsRoutes : IEndpointGroup
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/clubs/{clubId:guid}/courts").WithTags("Courts");

        group.MapGet("/", async (
            Guid clubId,
            ListCourtsHandler handler,
            CancellationToken ct) =>
        {
            var result = await handler.Handle(clubId, ct);
            return Results.Ok(result);
        })
        .WithName("ListCourts");

        group.MapPost("/", async (
            Guid clubId,
            CreateCourtRequest request,
            CreateCourtHandler handler,
            CancellationToken ct) =>
        {
            var result = await handler.Handle(clubId, request, ct);
            return Results.Created($"/api/v1/clubs/{clubId}/courts/{result.Id}", result);
        })
        .RequireAuthorization(AuthorizationPolicies.ClubStaffOrAdmin)
        .WithName("CreateCourt");

        group.MapPut("/{courtId:guid}", async (
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
        .WithName("UpdateCourt");
    }
}
