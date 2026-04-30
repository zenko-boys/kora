using Kora.Domain.Bookings;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Kora.Infrastructure.Data.Configurations;

public class BookingConfiguration : IEntityTypeConfiguration<Booking>
{
    public void Configure(EntityTypeBuilder<Booking> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.ClubId)
            .IsRequired();

        builder.Property(x => x.Type)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(x => x.StartsAt)
            .IsRequired();

        builder.Property(x => x.EndsAt)
            .IsRequired();

        builder.Property(x => x.Capacity)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.HasOne(x => x.Club)
            .WithMany(x => x.Bookings)
            .HasForeignKey(x => x.ClubId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.Participants)
            .WithOne()
            .HasForeignKey(x => x.BookingId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.ClubId);

        builder.HasIndex(x => new
        {
            x.ClubId,
            x.StartsAt,
            x.EndsAt
        });
    }
}
