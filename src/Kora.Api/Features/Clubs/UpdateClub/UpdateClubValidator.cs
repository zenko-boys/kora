using FluentValidation;

namespace Kora.Features.Clubs.UpdateClub;

public class UpdateClubValidator : AbstractValidator<UpdateClubRequest>
{
    public UpdateClubValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(120);

        RuleFor(x => x.OperatingHours).NotNull();

        RuleForEach(x => x.OperatingHours).ChildRules(h =>
        {
            h.RuleFor(x => x.DayOfWeek).IsInEnum();
            h.RuleFor(x => x.OpenTime).LessThan(x => x.CloseTime);
        });
    }
}
