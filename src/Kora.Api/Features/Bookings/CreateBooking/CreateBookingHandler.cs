using FluentValidation;
using Kora.Common.Handlers;

namespace Kora.Features.Bookings.CreateBooking;

public class CreateBookingHandler : IHandler
{
    private readonly IServiceProvider _sp;
    private readonly IValidator<CreateBookingRequest> _validator;

    public CreateBookingHandler(
        IServiceProvider sp,
        IValidator<CreateBookingRequest> validator)
    {
        _sp = sp;
        _validator = validator;
    }

    public async Task<CreateBookingResponse> Handle(
        Guid clubId,
        CreateBookingRequest request,
        CancellationToken ct)
    {
        await _validator.ValidateAndThrowAsync(request, ct);

        var strategy = _sp.GetRequiredKeyedService<ICreateBookingStrategy>(request.Type);
        return await strategy.HandleAsync(clubId, request, ct);
    }
}
