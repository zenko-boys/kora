namespace Kora.Infrastructure.Data.Seed;

public static class SeedExtensions
{
    public static async Task<WebApplication> SeedDataAsync(
        this WebApplication app,
        CancellationToken ct = default)
    {
        using var scope = app.Services.CreateScope();

        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var environment = scope.ServiceProvider.GetRequiredService<IWebHostEnvironment>();

        await SeedData.SeedAsync(db, environment, ct);

        return app;
    }
}