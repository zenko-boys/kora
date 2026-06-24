using Kora.Common.Controllers;
using Kora.Domain.Bookings;
using Kora.Features.Bookings.CreateBooking;
using Kora.Features.Bookings.DeleteBooking;
using Kora.Features.Bookings.GetBooking;
using Kora.Features.Bookings.InviteToBooking;
using Kora.Features.Bookings.JoinBooking;
using Kora.Features.Bookings.LeaveBooking;
using Kora.Features.Bookings.ListBookings;
using Microsoft.AspNetCore.Mvc;

namespace Kora.Features.V1;

[Tags("Bookings")]
public class BookingsController : ApiController
{
    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] Guid? clubId,
        [FromQuery] BookingType? type,
        [FromQuery] bool? open,
        [FromQuery] DateTime? fromUtc,
        [FromQuery] DateTime? toUtc,
        [FromServices] ListBookingsHandler handler,
        CancellationToken ct)
        => Ok(await handler.Handle(clubId, type, open, fromUtc, toUtc, ct));

    [HttpGet("{bookingId:guid}")]
    public async Task<IActionResult> Get(
        Guid bookingId,
        [FromServices] GetBookingHandler handler,
        CancellationToken ct)
        => Ok(await handler.Handle(bookingId, ct));

    [HttpPost]
    public async Task<IActionResult> Create(
        CreateBookingRequest request,
        [FromServices] CreateBookingHandler handler,
        CancellationToken ct)
    {
        var result = await handler.Handle(request, ct);
        return Created($"/api/v1/bookings/{result.BookingId}", result);
    }

    [HttpDelete("{bookingId:guid}")]
    public async Task<IActionResult> Delete(
        Guid bookingId,
        [FromServices] DeleteBookingHandler handler,
        CancellationToken ct)
    {
        await handler.Handle(bookingId, ct);
        return NoContent();
    }

    [HttpPost("{bookingId:guid}/join")]
    public async Task<IActionResult> Join(
        Guid bookingId,
        JoinBookingRequest request,
        [FromServices] JoinBookingHandler handler,
        CancellationToken ct)
        => Ok(await handler.Handle(bookingId, request, ct));

    [HttpPost("{bookingId:guid}/leave")]
    public async Task<IActionResult> Leave(
        Guid bookingId,
        [FromServices] LeaveBookingHandler handler,
        CancellationToken ct)
        => Ok(await handler.Handle(bookingId, ct));

    [HttpPost("{bookingId:guid}/invite")]
    public async Task<IActionResult> Invite(
        Guid bookingId,
        InviteToBookingRequest request,
        [FromServices] InviteToBookingHandler handler,
        CancellationToken ct)
    {
        await handler.Handle(bookingId, request, ct);
        return NoContent();
    }
}
