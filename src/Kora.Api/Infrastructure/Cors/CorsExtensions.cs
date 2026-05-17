namespace Kora.Infrastructure.Cors;

public static class CorsExtensions
{
    public const string PolicyName = "KoraCors";

    public static IServiceCollection AddKoraCors(this IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddPolicy(PolicyName, policy =>
            {
                policy
                    .AllowAnyOrigin()
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            });
        });

        return services;
    }

    private static bool IsLocalhost(string origin)
    {
        if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri))
        {
            return false;
        }

        return uri.Host is "localhost" or "127.0.0.1" or "[::1]";
    }
}
