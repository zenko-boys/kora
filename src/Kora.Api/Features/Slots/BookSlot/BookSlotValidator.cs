using FluentValidation;

namespace Kora.Features.Slots.BookSlot;

public class BookSlotValidator : AbstractValidator<BookSlotRequest>
{
    public BookSlotValidator()
    {
        RuleFor(x => x.ClubId).NotEmpty();
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.DurationMinutes).GreaterThan(0);
    }
}
