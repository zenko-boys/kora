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
            .Must(d => d != default)
            .WithMessage("Each slot must be a valid date/time with an offset, e.g. '2026-05-18T22:00:00-03:00'.");

        RuleForEach(x => x.Guests)
            .ChildRules(guest =>
            {
                guest.RuleFor(g => g.Name).NotEmpty().MaximumLength(100);
                guest.RuleFor(g => g.Email).MaximumLength(200).EmailAddress().When(g => g.Email is not null);
            });

        RuleForEach(x => x.Participants)
            .ChildRules(p =>
            {
                p.RuleFor(x => x.UserId).NotEmpty();
            });

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

            When(x => x.CourtId.HasValue, () =>
            {
                RuleFor(x => x.CourtsToOccupy)
                    .Equal(1)
                    .WithMessage("courtId can only be specified when courtsToOccupy is 1.");
            });
        });
    }
}
