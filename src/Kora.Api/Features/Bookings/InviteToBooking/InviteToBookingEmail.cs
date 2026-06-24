using Kora.Domain.Bookings;
using Kora.Domain.Users;
using Kora.Infrastructure.Email;

namespace Kora.Features.Bookings.InviteToBooking;

public static class InviteToBookingEmail
{
    public static EmailMessage Build(User invitedUser, User inviter, Booking booking, string appUrl)
    {
        var date = booking.StartsAt.ToString("dddd, MMMM d 'at' h:mm tt");
        var joinUrl = $"{appUrl.TrimEnd('/')}/bookings/{booking.Id}";
        var inviterName = !string.IsNullOrWhiteSpace(inviter.FirstName)
            ? $"{inviter.FirstName} {inviter.LastName}".Trim()
            : inviter.Email;

        var body = $"""
            <h1>You've been invited!</h1>
            <p>{EmailTemplate.Encode(inviterName)} invited you to join a padel session.</p>
            <p><strong>Date:</strong> {date} UTC<br/>
               <strong>Type:</strong> {booking.Type}<br/>
               <strong>Spots available:</strong> {booking.Capacity - booking.Participants.Count - booking.Guests.Count} / {booking.Capacity}</p>
            <p><a href="{joinUrl}" class="btn">View booking</a></p>
            """;

        return new EmailMessage(
            To: invitedUser.Email,
            Subject: $"{EmailTemplate.Encode(inviterName)} invited you to a padel session",
            HtmlBody: EmailTemplate.Wrap("You're invited", body));
    }
}
