using FluentValidation;

namespace Kora.Features.Management.Courts.CreateCourt;

public class CreateCourtValidator : AbstractValidator<CreateCourtRequest>
{
    public CreateCourtValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(80);
    }
}
