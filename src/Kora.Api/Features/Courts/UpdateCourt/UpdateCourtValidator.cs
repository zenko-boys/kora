using FluentValidation;

namespace Kora.Features.Courts.UpdateCourt;

public class UpdateCourtValidator : AbstractValidator<UpdateCourtRequest>
{
    public UpdateCourtValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(80);
    }
}
