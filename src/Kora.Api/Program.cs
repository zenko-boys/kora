using System.Reflection;
using Kora.Common;
using Kora.Common.Endpoints;
using Kora.Configuration;
using Kora.Features;
using Kora.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration
    .AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);

var assembly = Assembly.GetExecutingAssembly();

builder.Services.AddOptionsConfiguration(builder.Configuration);

builder.Services.AddCommon();
builder.Services.AddInfrastructure();
builder.Services.AddFeatures(assembly);

var app = builder.Build();

await app.UseInfrastructure();

app.MapEndpoints();

app.Run();