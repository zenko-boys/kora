using FluentValidation;
using Kora.Common.Handlers;
using Kora.Domain.Bookings;

namespace Kora.Features.Bookings.CreateBooking;

public class CreateBookingHandler : IHandler
{
    private readonly Func<BookingType, ICreateBookingStrategy> _strategyFactory;
    private readonly IValidator<CreateBookingRequest> _validator;

    public CreateBookingHandler(
        Func<BookingType, ICreateBookingStrategy> strategyFactory,
        IValidator<CreateBookingRequest> validator)
    {
        _strategyFactory = strategyFactory;
        _validator = validator;
    }

    public async Task<CreateBookingResponse> Handle(
        CreateBookingRequest request,
        CancellationToken ct)
    {
        await _validator.ValidateAndThrowAsync(request, ct);

        var strategy = _strategyFactory(request.Type);
        return await strategy.HandleAsync(request.ClubId, request, ct);
    }
}
