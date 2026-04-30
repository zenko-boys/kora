using FluentValidation;

namespace Kora.Features.Bookings.BookDayUse;

public class BookDayUseValidator : AbstractValidator<BookDayUseRequest>
{
    public BookDayUseValidator()
    {
        RuleFor(x => x.DurationMinutes).GreaterThan(0);
        RuleFor(x => x.CourtsToOccupy).GreaterThan(0);
        RuleFor(x => x.Capacity).GreaterThan(0);

        RuleFor(x => x.StartsAt)
            .Must(d => d.Kind != DateTimeKind.Unspecified)
            .WithMessage("startsAt must include 'Z' (UTC) or a timezone offset like '-04:00'.");
    }
}
