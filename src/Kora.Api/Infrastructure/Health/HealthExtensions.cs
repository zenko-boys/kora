using Kora.Infrastructure.Data;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Kora.Infrastructure.Health;

public static class HealthExtensions
{
    public static IServiceCollection AddHealthChecksConfiguration(
        this IServiceCollection services)
    {
        services.AddHealthChecks()
            // readiness: depende de infra (DB)
            .AddDbContextCheck<AppDbContext>(
                name: "database",
                failureStatus: HealthStatus.Unhealthy,
                tags: ["ready"]);

        return services;
    }

    public static WebApplication UseHealthChecksConfiguration(
        this WebApplication app)
    {
        // 🔹 LIVENESS
        app.MapHealthChecks("/health/live", new HealthCheckOptions
        {
            Predicate = _ => false
        });

        // 🔹 READINESS
        app.MapHealthChecks("/health/ready", new HealthCheckOptions
        {
            Predicate = check => check.Tags.Contains("ready"),
            ResponseWriter = async (context, report) =>
            {
                context.Response.ContentType = "application/json";

                var result = new
                {
                    status = report.Status.ToString(),
                    checks = report.Entries.Select(e => new
                    {
                        name = e.Key,
                        status = e.Value.Status.ToString(),
                        error = e.Value.Exception?.Message
                    })
                };

                await context.Response.WriteAsJsonAsync(result);
            }
        });

        return app;
    }
}