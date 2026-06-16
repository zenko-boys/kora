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

        builder.Property(x => x.Team)
            .HasConversion<string>()
            .HasMaxLength(10);

        builder.Property(x => x.PositionInTeam);

        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.UserId);
    }
}
