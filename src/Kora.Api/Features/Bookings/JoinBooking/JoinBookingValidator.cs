using FluentValidation;
using Kora.Domain.Bookings;

namespace Kora.Features.Bookings.JoinBooking;

public class JoinBookingValidator : AbstractValidator<JoinBookingRequest>
{
    public JoinBookingValidator()
    {
        RuleFor(x => x.Team)
            .Must(t => t == Team.TeamA || t == Team.TeamB)
            .WithMessage("Team must be TeamA or TeamB.");
    }
}
