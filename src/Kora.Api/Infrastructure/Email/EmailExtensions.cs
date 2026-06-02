using Kora.Configuration;
using Microsoft.Extensions.Options;
using Resend;

namespace Kora.Infrastructure.Email;

public static class EmailExtensions
{
    public static IServiceCollection AddEmail(this IServiceCollection services)
    {
        services.AddResend(_ => { });
        services.AddOptions<ResendClientOptions>()
            .Configure<IOptions<EmailOptions>>((resendOpts, emailOpts) =>
            {
                resendOpts.ApiToken = emailOpts.Value.ApiKey;
            });
        services.AddScoped<IEmailSender, ResendEmailSender>();
        return services;
    }
}
