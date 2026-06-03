using Kora.Infrastructure.Email;

namespace Kora.Features.Admin;

public static class TestEmailEmail
{
    public static EmailMessage Build(string toEmail)
    {
        var body = $"""
            <h1>Test Email</h1>
            <p>This is a test email from Kora to verify email sending is working correctly.</p>
            <p><strong>Sent at:</strong> {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC</p>
            """;

        return new EmailMessage(
            To: toEmail,
            Subject: "Kora Test Email",
            HtmlBody: EmailTemplate.Wrap("Test Email", body));
    }
}
