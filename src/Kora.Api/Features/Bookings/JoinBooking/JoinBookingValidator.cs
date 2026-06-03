using FluentValidation;
using Kora.Domain.Bookings;

namespace Kora.Features.Bookings.JoinBooking;

public class JoinBookingValidator : AbstractValidator<JoinBookingRequest>
{
    public JoinBookingValidator()
    {
        RuleFor(x => x.TeamNumber)
            .Must(t => t == TeamNumber.Team1 || t == TeamNumber.Team2)
            .WithMessage("TeamNumber must be 1 (Team1) or 2 (Team2).");
    }
}
