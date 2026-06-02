using Kora.Configuration;
using Microsoft.Extensions.Options;
using Resend;
using ResendEmail = Resend.EmailMessage;

namespace Kora.Infrastructure.Email;

public class ResendEmailSender : IEmailSender
{
    private readonly IResend _resend;
    private readonly EmailOptions _options;
    private readonly ILogger<ResendEmailSender> _logger;

    public ResendEmailSender(IResend resend, IOptions<EmailOptions> options, ILogger<ResendEmailSender> logger)
    {
        _resend = resend;
        _options = options.Value;
        _logger = logger;
    }

    public async Task SendAsync(EmailMessage message, CancellationToken ct = default)
    {
        try
        {
            var resendMessage = new ResendEmail
            {
                From = _options.From,
                To = [message.To],
                Subject = message.Subject,
                HtmlBody = message.HtmlBody,
                TextBody = message.TextBody,
            };

            await _resend.EmailSendAsync(resendMessage, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {To} with subject {Subject}", message.To, message.Subject);
        }
    }
}
