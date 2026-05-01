using Kora.Domain.Bookings;
using Kora.Features.Bookings.CreateBooking.Strategies;

namespace Kora.Features.Bookings.CreateBooking;

public static class CreateBookingDependencyInjection
{
    public static IServiceCollection AddCreateBookingStrategies(this IServiceCollection services)
    {
        services.AddKeyedScoped<ICreateBookingStrategy, GameBookingStrategy>(BookingType.Game);
        services.AddKeyedScoped<ICreateBookingStrategy, DayUseBookingStrategy>(BookingType.DayUse);

        return services;
    }
}
