using Kora.Common.Errors;

namespace Kora.Domain.Clubs;

public static class ClubExtensions
{
    public static void EnsureBookingWithinOperatingHours(
        this Club club,
        DateTime startsAtUtc,
        DateTime endsAtUtc)
    {
        var tz = TimeZoneInfo.FindSystemTimeZoneById(club.TimeZoneId);

        var localStart = TimeZoneInfo.ConvertTimeFromUtc(startsAtUtc, tz);
        var localEnd = TimeZoneInfo.ConvertTimeFromUtc(endsAtUtc, tz);

        if (DateOnly.FromDateTime(localStart) != DateOnly.FromDateTime(localEnd))
        {
            throw new DomainException("Booking cannot span days.");
        }

        var startTime = TimeOnly.FromDateTime(localStart);
        var endTime = TimeOnly.FromDateTime(localEnd);

        var fits = club.OperatingHours.Any(h =>
            h.DayOfWeek == localStart.DayOfWeek
            && h.OpenTime <= startTime
            && h.CloseTime >= endTime);

        if (!fits)
        {
            throw new DomainException("Booking is outside club operating hours.");
        }
    }
}
