using FluentValidation;

namespace Kora.Features.Clubs.CreateClub;

public class CreateClubValidator : AbstractValidator<CreateClubRequest>
{
    private static readonly int[] AllowedCellDurations = [15, 30, 60];

    public CreateClubValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(120);

        RuleFor(x => x.TimeZoneId)
            .NotEmpty()
            .MaximumLength(60)
            .Must(BeAValidTimeZone)
            .WithMessage("TimeZoneId must be a valid IANA timezone (e.g., 'America/Sao_Paulo', 'Europe/Lisbon').");

        RuleFor(x => x.SlotCellDurationMinutes)
            .Must(AllowedCellDurations.Contains)
            .WithMessage("Slot cell duration must be 15, 30, or 60 minutes.");

        RuleFor(x => x.MinimumBookingDurationMinutes)
            .GreaterThan(0)
            .Must((req, min) => min % req.SlotCellDurationMinutes == 0)
            .WithMessage("Minimum booking duration must be a multiple of the slot cell duration.");

        RuleFor(x => x.OperatingHours)
            .NotNull();

        RuleForEach(x => x.OperatingHours).ChildRules(h =>
        {
            h.RuleFor(x => x.DayOfWeek).IsInEnum();
            h.RuleFor(x => x.OpenTime).LessThan(x => x.CloseTime);
        });
    }

    private static bool BeAValidTimeZone(string id)
    {
        if (string.IsNullOrWhiteSpace(id))
        {
            return false;
        }

        try
        {
            TimeZoneInfo.FindSystemTimeZoneById(id);
            return true;
        }
        catch (TimeZoneNotFoundException)
        {
            return false;
        }
        catch (InvalidTimeZoneException)
        {
            return false;
        }
    }
}
