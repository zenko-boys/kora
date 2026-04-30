using Kora.Common.Time;

namespace Kora.Common;

public static class DependencyInjection
{
    public static IServiceCollection AddCommon(this IServiceCollection services)
    {
        services.AddScoped<IClock, SystemClock>();

        return services;
    }
}