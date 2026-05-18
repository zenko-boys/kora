using System.Security.Claims;
using Kora.Configuration;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Kora.Infrastructure.Auth;

public static class AuthExtensions
{
    public static IServiceCollection AddKoraAuth(this IServiceCollection services)
    {
        services.AddHttpContextAccessor();
        services.AddScoped<CurrentUserIdHolder>();
        services.AddScoped<IUserContext, UserContext>();
        services.AddScoped<IAuthorizationHandler, AdminOnlyHandler>();
        services.AddScoped<IAuthorizationHandler, ClubStaffOrAdminHandler>();

        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer();

        services.AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme)
            .Configure<IOptions<AuthOptions>>((jwt, auth) =>
            {
                var options = auth.Value;

                jwt.Authority = options.Authority;
                jwt.RequireHttpsMetadata = true;

                jwt.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidateAudience = !string.IsNullOrWhiteSpace(options.Audience),
                    ValidAudience = string.IsNullOrWhiteSpace(options.Audience) ? null : options.Audience
                };

            });

        services.AddAuthorization(options =>
        {
            options.FallbackPolicy = new AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .Build();

            options.AddPolicy(AuthorizationPolicies.AdminOnly, policy =>
                policy.RequireAuthenticatedUser()
                      .AddRequirements(new AdminOnlyRequirement()));

            options.AddPolicy(AuthorizationPolicies.ClubStaffOrAdmin, policy =>
                policy.RequireAuthenticatedUser()
                      .AddRequirements(new ClubStaffOrAdminRequirement()));
        });

        return services;
    }
}
