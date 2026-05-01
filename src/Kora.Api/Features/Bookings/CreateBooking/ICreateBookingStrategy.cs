namespace Kora.Features.Bookings.CreateBooking;

public interface ICreateBookingStrategy
{
    Task<CreateBookingResponse> HandleAsync(
        Guid clubId,
        CreateBookingRequest request,
        CancellationToken ct);
}
