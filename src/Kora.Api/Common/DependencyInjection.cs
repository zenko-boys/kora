using System.Text.Json.Serialization;
using FluentValidation.AspNetCore;
using Kora.Common.Errors;
using Kora.Common.Time;

namespace Kora.Common;

public static class DependencyInjection
{
    public static IServiceCollection AddCommon(this IServiceCollection services)
    {
        services.AddScoped<IClock, SystemClock>();

        services.AddExceptionHandler<GlobalExceptionHandler>();
        services.AddProblemDetails();

        services.AddFluentValidationAutoValidation();

        services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
            });

        return services;
    }
}