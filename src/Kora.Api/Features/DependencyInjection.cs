using System.Reflection;
using FluentValidation;
using Kora.Common.Handlers;
using Kora.Features.Bookings.CreateBooking;

namespace Kora.Features;

public static class DependencyInjection
{
    public static IServiceCollection AddFeatures(
        this IServiceCollection services,
        Assembly assembly)
    {
        services.AddHandlers(assembly);
        services.AddValidatorsFromAssembly(assembly);

        services.AddCreateBookingStrategies();

        return services;
    }
}
