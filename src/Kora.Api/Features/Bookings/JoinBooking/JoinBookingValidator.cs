using FluentValidation;
using Kora.Domain.Bookings;

namespace Kora.Features.Bookings.JoinBooking;

public class JoinBookingValidator : AbstractValidator<JoinBookingRequest>
{
    public JoinBookingValidator()
    {
        RuleFor(x => x.Team)
            .Must(t => t is null || t == Team.TeamA || t == Team.TeamB)
            .WithMessage("Team must be TeamA or TeamB.");

        RuleFor(x => x.PositionInTeam)
            .GreaterThanOrEqualTo(1)
            .When(x => x.PositionInTeam.HasValue)
            .WithMessage("Position must be at least 1.");
    }
}
