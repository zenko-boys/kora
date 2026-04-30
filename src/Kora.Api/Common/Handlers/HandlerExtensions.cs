using System.Reflection;

namespace Kora.Common.Handlers;

public static class HandlerExtensions
{
    public static IServiceCollection AddHandlers(this IServiceCollection services, Assembly assembly)
    {
        var handlerTypes = assembly
            .GetTypes()
            .Where(t => typeof(IHandler).IsAssignableFrom(t)
                && t is { IsAbstract: false, IsInterface: false });

        foreach (var type in handlerTypes)
        {
            services.AddScoped(type);
        }

        return services;
    }
}