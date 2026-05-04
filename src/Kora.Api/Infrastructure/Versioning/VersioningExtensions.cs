using Asp.Versioning;
using Asp.Versioning.Builder;

namespace Kora.Infrastructure.Versioning;

public static class VersioningExtensions
{
    public static IServiceCollection AddApiVersioningConfiguration(this IServiceCollection services)
    {
        services.AddApiVersioning(options =>
        {
            options.DefaultApiVersion = new ApiVersion(1, 0);
            options.AssumeDefaultVersionWhenUnspecified = true;
            options.ReportApiVersions = true;
            options.ApiVersionReader = new UrlSegmentApiVersionReader();
        })
        .AddApiExplorer(options =>
        {
            options.GroupNameFormat = "'v'VVV";
            options.SubstituteApiVersionInUrl = true;
        });

        return services;
    }

    public static RouteGroupBuilder MapApiVersion(this WebApplication app, int version)
    {
        var versionSet = app.NewApiVersionSet()
            .HasApiVersion(new ApiVersion(version, 0))
            .Build();

        return app.MapGroup("/api/v{version:apiVersion}")
            .WithApiVersionSet(versionSet);
    }
}
