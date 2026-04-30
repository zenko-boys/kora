using Kora.Infrastructure.Auth;
using Kora.Infrastructure.Data;
using Kora.Infrastructure.Data.Seed;
using Kora.Infrastructure.Health;
using Kora.Infrastructure.OpenApi;

namespace Kora.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddDatabase();
        services.AddKoraAuth();
        services.AddOpenApiDocumentation();
        services.AddHealthChecksConfiguration();

        return services;
    }

    public static async Task<WebApplication> UseInfrastructure(this WebApplication app)
    {
        app.UseOpenApiDocumentation();
        app.UseAuthentication();
        app.UseAuthorization();
        app.UseHealthChecksConfiguration();

        if (app.Environment.IsDevelopment())
        {
            //await app.SeedDataAsync();
        }

        return app;
    }
}