using Kora.Common.Handlers;
using Kora.Infrastructure.Email;

namespace Kora.Features.Admin.TestEmail;

public class TestEmailHandler : IHandler
{
    private readonly IEmailSender _emailSender;

    public TestEmailHandler(IEmailSender emailSender)
    {
        _emailSender = emailSender;
    }

    public async Task<TestEmailResponse> Handle(TestEmailRequest request, CancellationToken ct)
    {
        var message = TestEmailEmail.Build(request.Email);
        await _emailSender.SendAsync(message, ct);

        return new TestEmailResponse($"Test email sent to {request.Email}");
    }
}
