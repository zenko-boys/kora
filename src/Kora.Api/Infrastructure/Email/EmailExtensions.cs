using Kora.Configuration;
using Microsoft.Extensions.Options;

namespace Kora.Infrastructure.Email;

public static class EmailExtensions
{
    public static IServiceCollection AddEmail(this IServiceCollection services)
    {
        services.AddHttpClient<IEmailSender, ResendEmailSender>((sp, client) =>
        {
            var options = sp.GetRequiredService<IOptions<EmailOptions>>().Value;
            client.BaseAddress = new Uri("https://api.resend.com/");
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {options.ApiKey}");
        });

        return services;
    }
}
