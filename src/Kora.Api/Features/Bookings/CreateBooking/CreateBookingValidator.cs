using FluentValidation;
using Kora.Domain.Bookings;

namespace Kora.Features.Bookings.CreateBooking;

public class CreateBookingValidator : AbstractValidator<CreateBookingRequest>
{
    public CreateBookingValidator()
    {
        RuleFor(x => x.ClubId).NotEmpty();
        RuleFor(x => x.Type).IsInEnum();

        RuleFor(x => x.Slots)
            .NotEmpty()
            .WithMessage("At least one slot is required.");

        RuleForEach(x => x.Slots)
            .Must(d => d.Kind != DateTimeKind.Unspecified)
            .WithMessage("Each slot must include 'Z' (UTC) or a timezone offset like '-04:00'.");

        When(x => x.Type == BookingType.DayUse, () =>
        {
            RuleFor(x => x.CourtsToOccupy)
                .NotNull()
                .GreaterThan(0)
                .WithMessage("courtsToOccupy is required and must be > 0 for DayUse bookings.");

            RuleFor(x => x.Capacity)
                .NotNull()
                .GreaterThan(0)
                .WithMessage("capacity is required and must be > 0 for DayUse bookings.");
        });
    }
}
