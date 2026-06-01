namespace Kora.Infrastructure.Email;

public record EmailMessage(
    string To,
    string Subject,
    string HtmlBody,
    string? TextBody = null);
