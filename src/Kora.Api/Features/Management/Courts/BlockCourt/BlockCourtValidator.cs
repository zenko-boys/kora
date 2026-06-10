using FluentValidation;

namespace Kora.Features.Management.Courts.BlockCourt;

public class BlockCourtValidator : AbstractValidator<BlockCourtRequest>
{
    public BlockCourtValidator()
    {
        RuleFor(x => x.StartsAt).NotEmpty();
        RuleFor(x => x.EndsAt)
            .NotEmpty()
            .GreaterThan(x => x.StartsAt)
            .WithMessage("EndsAt must be after StartsAt.");
        RuleFor(x => x.Reason).MaximumLength(300).When(x => x.Reason is not null);
    }
}
