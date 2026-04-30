using Kora.Domain.Slots;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Kora.Infrastructure.Data.Configurations;

public class SlotConfiguration : IEntityTypeConfiguration<Slot>
{
    public void Configure(EntityTypeBuilder<Slot> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.ClubId)
            .IsRequired();

        builder.Property(x => x.StartsAt)
            .IsRequired();

        builder.Property(x => x.EndsAt)
            .IsRequired();

        builder.Property(x => x.IsPublished)
            .IsRequired();

        builder.HasOne(x => x.Club)
            .WithMany(x => x.Slots)
            .HasForeignKey(x => x.ClubId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Booking)
            .WithMany(x => x.Slots)
            .HasForeignKey(x => x.BookingId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(x => x.ClubId);

        builder.HasIndex(x => new
        {
            x.ClubId,
            x.StartsAt
        });

        builder.HasIndex(x => x.BookingId);
    }
}
