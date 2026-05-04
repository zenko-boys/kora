using Kora.Common.Endpoints;
using Kora.Domain.Bookings;
using Kora.Features.Bookings.CreateBooking;
using Kora.Features.Bookings.DeleteBooking;
using Kora.Features.Bookings.JoinBooking;
using Kora.Features.Bookings.ListBookings;

namespace Kora.Features.Bookings;

public class BookingsRoutes : IEndpointGroup
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/bookings").WithTags("Bookings");

        group.MapGet("/", async (
            Guid? clubId,
            BookingType? type,
            bool? open,
            DateTime? fromUtc,
            DateTime? toUtc,
            ListBookingsHandler handler,
            CancellationToken ct) =>
        {
            var result = await handler.Handle(clubId, type, open, fromUtc, toUtc, ct);
            return Results.Ok(result);
        })
        .WithName("ListBookings");

        group.MapPost("/", async (
            CreateBookingRequest request,
            CreateBookingHandler handler,
            CancellationToken ct) =>
        {
            var result = await handler.Handle(request, ct);
            return Results.Created($"/api/v1/bookings/{result.BookingId}", result);
        })
        .WithName("CreateBooking");

        group.MapDelete("/{bookingId:guid}", async (
            Guid bookingId,
            DeleteBookingHandler handler,
            CancellationToken ct) =>
        {
            await handler.Handle(bookingId, ct);
            return Results.NoContent();
        })
        .WithName("DeleteBooking");

        group.MapPost("/{bookingId:guid}/join", async (
            Guid bookingId,
            JoinBookingHandler handler,
            CancellationToken ct) =>
        {
            var result = await handler.Handle(bookingId, ct);
            return Results.Ok(result);
        })
        .WithName("JoinBooking");
    }
}
