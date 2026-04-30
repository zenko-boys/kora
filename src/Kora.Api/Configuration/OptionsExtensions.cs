namespace Kora.Configuration;

public static class OptionsExtensions
{
    public static IServiceCollection AddOptionsConfiguration(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services
            .AddOptions<DatabaseOptions>()
            .Bind(configuration.GetSection(DatabaseOptions.SectionName))
            .Validate(options => !string.IsNullOrWhiteSpace(options.Default),
                "ConnectionStrings:Default is required")
            .ValidateOnStart();

        services
            .AddOptions<AuthOptions>()
            .Bind(configuration.GetSection(AuthOptions.SectionName))
            .Validate(options => !string.IsNullOrWhiteSpace(options.Authority),
                "Auth:Authority is required")
            .ValidateOnStart();

        return services;
    }
}