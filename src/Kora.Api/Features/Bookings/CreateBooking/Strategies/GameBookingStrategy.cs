using Kora.Common.Errors;
using Kora.Domain.Bookings;
using Kora.Domain.Reservations;
using Kora.Infrastructure.Auth;
using Kora.Infrastructure.Data;
using Kora.Infrastructure.Email;
using Microsoft.EntityFrameworkCore;

namespace Kora.Features.Bookings.CreateBooking.Strategies;

public class GameBookingStrategy : ICreateBookingStrategy
{
    private const int GameCapacity = 4;

    private readonly AppDbContext _db;
    private readonly IUserContext _userContext;
    private readonly IClubAuthorizationService _clubAuth;
    private readonly IEmailSender _emailSender;

    public GameBookingStrategy(AppDbContext db, IUserContext userContext, IClubAuthorizationService clubAuth, IEmailSender emailSender)
    {
        _db = db;
        _userContext = userContext;
        _clubAuth = clubAuth;
        _emailSender = emailSender;
    }

    public async Task<CreateBookingResponse> HandleAsync(
        Guid clubId,
        CreateBookingRequest request,
        CancellationToken ct)
    {
        var plan = await BookingPlanning.PrepareAsync(_db, clubId, request, requiredCourts: 1, ct);

        var durationMinutes = request.Slots.Length * plan.Club.SlotCellDurationMinutes;
        if (durationMinutes < plan.Club.MinimumBookingDurationMinutes)
        {
            throw new DomainException(
                $"Booking duration must be at least {plan.Club.MinimumBookingDurationMinutes} minutes.");
        }

        var currentUser = await _userContext.GetCurrentUserAsync(ct);

        var isStaff = await _clubAuth.IsClubStaffOrAdminAsync(clubId, ct);

        List<BookingParticipant> participants = [];

        if (!isStaff)
        {
            var hasConflict = await _db.Bookings
                .AnyAsync(b => b.Participants.Any(p => p.UserId == currentUser.Id)
                            && b.StartsAt < plan.EndsAtUtc
                            && b.EndsAt > plan.StartsAtUtc, ct);

            if (hasConflict)
                throw new DomainException("User already has a booking during this time.");

            participants.Add(new BookingParticipant
            {
                UserId = currentUser.Id,
                JoinedAt = DateTime.UtcNow,
                TeamNumber = TeamNumber.Team1
            });
        }

        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            ClubId = clubId,
            Type = BookingType.Game,
            StartsAt = plan.StartsAtUtc,
            EndsAt = plan.EndsAtUtc,
            Capacity = GameCapacity,
            IsPrivate = request.IsPrivate,
            Description = request.Description,
            CreatedAt = DateTime.UtcNow,
            Participants = participants,
            Reservations =
            {
                new Reservation
                {
                    Id = Guid.NewGuid(),
                    CourtId = plan.FreeCourtIds[0],
                    StartsAt = plan.StartsAtUtc,
                    EndsAt = plan.EndsAtUtc
                }
            }
        };

        _db.Bookings.Add(booking);
        await _db.SaveChangesAsync(ct);

        if (!isStaff)
            await _emailSender.SendAsync(BookingConfirmedEmail.Build(currentUser.Email, booking), ct);

        return new CreateBookingResponse(booking.Id);
    }
}
