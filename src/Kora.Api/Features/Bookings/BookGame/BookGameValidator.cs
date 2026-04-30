using FluentValidation;

namespace Kora.Features.Bookings.BookGame;

public class BookGameValidator : AbstractValidator<BookGameRequest>
{
    public BookGameValidator()
    {
        RuleFor(x => x.ClubId).NotEmpty();
        RuleFor(x => x.DurationMinutes).GreaterThan(0);

        RuleFor(x => x.StartsAt)
            .Must(d => d.Kind != DateTimeKind.Unspecified)
            .WithMessage("startsAt must include 'Z' (UTC) or a timezone offset like '-04:00'.");
    }
}
