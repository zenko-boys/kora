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

        return services;
    }
}