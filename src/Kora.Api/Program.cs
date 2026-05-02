using System.Reflection;
using Kora.Common;
using Kora.Common.Endpoints;
using Kora.Configuration;
using Kora.Features;
using Kora.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration
    .AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);

// Translate DATABASE_URL (Fly/Heroku/Render-style) to ConnectionStrings:Default.
// Local dev keeps using appsettings.Local.json; managed environments inject DATABASE_URL.
if (Environment.GetEnvironmentVariable("DATABASE_URL") is { Length: > 0 } databaseUrl)
{
    var uri = new Uri(databaseUrl);
    var userInfo = uri.UserInfo.Split(':', 2);
    builder.Configuration["ConnectionStrings:Default"] = new Npgsql.NpgsqlConnectionStringBuilder
    {
        Host = uri.Host,
        Port = uri.Port > 0 ? uri.Port : 5432,
        Database = uri.AbsolutePath.TrimStart('/'),
        Username = Uri.UnescapeDataString(userInfo[0]),
        Password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "",
        SslMode = Npgsql.SslMode.Disable
    }.ConnectionString;
}

var assembly = Assembly.GetExecutingAssembly();

builder.Services.AddOptionsConfiguration(builder.Configuration);

builder.Services.AddCommon();
builder.Services.AddInfrastructure();
builder.Services.AddFeatures(assembly);

var app = builder.Build();

await app.UseInfrastructure();

app.MapEndpoints();

app.Run();