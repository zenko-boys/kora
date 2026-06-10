using Kora.Common.Handlers;
using Kora.Domain.Bookings;

namespace Kora.Features.Bookings.CreateBooking;

public class CreateBookingHandler : IHandler
{
    private readonly Func<BookingType, ICreateBookingStrategy> _strategyFactory;

    public CreateBookingHandler(Func<BookingType, ICreateBookingStrategy> strategyFactory)
    {
        _strategyFactory = strategyFactory;
    }

    public async Task<CreateBookingResponse> Handle(
        CreateBookingRequest request,
        CancellationToken ct)
    {
        var strategy = _strategyFactory(request.Type);
        return await strategy.HandleAsync(request.ClubId, request, ct);
    }
}
