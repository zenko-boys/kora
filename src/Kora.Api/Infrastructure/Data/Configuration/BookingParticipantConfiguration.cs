using Kora.Domain.Bookings;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Kora.Infrastructure.Data.Configurations;

public class BookingParticipantConfiguration : IEntityTypeConfiguration<BookingParticipant>
{
    public void Configure(EntityTypeBuilder<BookingParticipant> builder)
    {
        builder.HasKey(x => new { x.BookingId, x.UserId });

        builder.Property(x => x.JoinedAt)
            .IsRequired();

        builder.HasIndex(x => x.UserId);
    }
}
