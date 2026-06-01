namespace Kora.Infrastructure.Email;

public static class EmailTemplate
{
    public static string Wrap(string title, string bodyHtml) => $$"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>{{title}}</title>
          <style>
            body { margin: 0; padding: 0; background: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #18181b; }
            .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; }
            .header { background: #18181b; padding: 28px 32px; }
            .header span { color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: -0.5px; }
            .body { padding: 32px; }
            .body h1 { margin: 0 0 12px; font-size: 22px; font-weight: 700; }
            .body p { margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #52525b; }
            .btn { display: inline-block; padding: 12px 24px; background: #18181b; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600; }
            .footer { padding: 20px 32px; font-size: 12px; color: #a1a1aa; border-top: 1px solid #f4f4f5; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="header"><span>Kora</span></div>
            <div class="body">{{bodyHtml}}</div>
            <div class="footer">You're receiving this because you have an account on Kora.</div>
          </div>
        </body>
        </html>
        """;
}
