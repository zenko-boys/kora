using System.Reflection;
using FluentValidation;
using Kora.Common.Endpoints;
using Kora.Common.Handlers;

namespace Kora.Features;

public static class DependencyInjection
{
    public static IServiceCollection AddFeatures(
        this IServiceCollection services,
        Assembly assembly)
    {
        services.AddEndpoints(assembly);
        services.AddHandlers(assembly);
        services.AddValidatorsFromAssembly(assembly);

        return services;
    }
}