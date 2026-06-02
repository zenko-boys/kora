using FluentValidation;

namespace Kora.Features.Admin.TestEmail;

public class TestEmailValidator : AbstractValidator<TestEmailRequest>
{
    public TestEmailValidator()
    {
        RuleFor(x => x.Email)
            .EmailAddress()
            .NotEmpty();
    }
}
