using FluentValidation;

namespace Kora.Features.Clubs.GenerateSchedule;

public class GenerateScheduleValidator : AbstractValidator<GenerateScheduleRequest>
{
    public GenerateScheduleValidator()
    {
        RuleFor(x => x.DaysAhead)
            .InclusiveBetween(1, 90);
    }
}
