using Kora.Domain.Bookings;
using Kora.Infrastructure.Email;

namespace Kora.Features.Bookings;

public static class BookingConfirmedEmail
{
    public static EmailMessage Build(string toEmail, Booking booking)
    {
        var date = booking.StartsAt.ToString("dddd, MMMM d 'at' h:mm tt");

        var body = $"""
            <h1>You're in!</h1>
            <p>Your spot has been confirmed for the following booking.</p>
            <p><strong>Date:</strong> {date} UTC<br/>
               <strong>Type:</strong> {booking.Type}<br/>
               <strong>Spots taken:</strong> {booking.Participants.Count} / {booking.Capacity}</p>
            <p>See you on the court!</p>
            """;

        return new EmailMessage(
            To: toEmail,
            Subject: "Your spot is confirmed",
            HtmlBody: EmailTemplate.Wrap("Spot confirmed", body));
    }
}
