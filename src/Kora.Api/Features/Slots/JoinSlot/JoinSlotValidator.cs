using FluentValidation;

namespace Kora.Features.Slots.JoinSlot;

public class JoinSlotValidator : AbstractValidator<JoinSlotRequest>
{
    public JoinSlotValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty();
    }
}