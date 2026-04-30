using FluentValidation;

namespace Kora.Features.Courts.CreateCourt;

public class CreateCourtValidator : AbstractValidator<CreateCourtRequest>
{
    public CreateCourtValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(80);
    }
}
