using Kora.Infrastructure.Data;
using Kora.Infrastructure.OpenApi;

namespace Kora.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddDatabase();
        services.AddOpenApiDocumentation();

        return services;
    }

    public static WebApplication UseInfrastructure(this WebApplication app)
    {
        app.UseOpenApiDocumentation();

        return app;
    }
}