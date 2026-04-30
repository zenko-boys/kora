using FluentValidation;
using Kora.Domain.Slots;

namespace Kora.Features.Slots.CreateSlot;

public class CreateSlotValidator : AbstractValidator<CreateSlotRequest>
{
    public CreateSlotValidator()
    {
        RuleFor(x => x.ClubId)
            .NotEmpty();

        RuleFor(x => x.StartsAt)
            .LessThan(x => x.EndsAt);

        RuleFor(x => x.Capacity)
            .GreaterThan(0);

        RuleFor(x => x.Capacity)
            .Equal(4)
            .When(x => x.Type == SlotType.Game);

        RuleFor(x => x.Capacity)
            .GreaterThanOrEqualTo(4)
            .When(x => x.Type == SlotType.DayUse);
    }
}