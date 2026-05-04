using System.Reflection;
using Kora.Infrastructure.Versioning;

namespace Kora.Common.Endpoints;

public static class EndpointExtensions
{
    public static IServiceCollection AddEndpoints(this IServiceCollection services, Assembly assembly)
    {
        var groupTypes = assembly
            .GetTypes()
            .Where(t => typeof(IEndpointGroup).IsAssignableFrom(t)
                && t is { IsAbstract: false, IsInterface: false });

        foreach (var type in groupTypes)
        {
            services.AddTransient(typeof(IEndpointGroup), type);
        }

        return services;
    }

    public static WebApplication MapEndpoints(this WebApplication app)
    {
        var v1 = app.MapApiVersion(1);

        var groups = app.Services.GetRequiredService<IEnumerable<IEndpointGroup>>();

        foreach (var group in groups)
        {
            group.MapEndpoints(v1);
        }

        return app;
    }
}
