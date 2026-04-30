using FluentValidation;

namespace Kora.Features.Slots.BookDayUse;

public class BookDayUseValidator : AbstractValidator<BookDayUseRequest>
{
    public BookDayUseValidator()
    {
        RuleFor(x => x.DurationMinutes).GreaterThan(0);
        RuleFor(x => x.CourtsToOccupy).GreaterThan(0);
        RuleFor(x => x.Capacity).GreaterThan(0);
    }
}
