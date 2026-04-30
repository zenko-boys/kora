using Kora.Domain.Clubs;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Kora.Infrastructure.Data.Configurations;

public class ClubConfiguration : IEntityTypeConfiguration<Club>
{
    public void Configure(EntityTypeBuilder<Club> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .HasMaxLength(120)
            .IsRequired();

        builder.Property(x => x.TimeZoneId)
            .HasMaxLength(60)
            .IsRequired();

        builder.Property(x => x.SlotCellDurationMinutes)
            .IsRequired();

        builder.Property(x => x.MinimumBookingDurationMinutes)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.HasIndex(x => x.Name);

        builder.HasMany(x => x.Courts)
            .WithOne(x => x.Club)
            .HasForeignKey(x => x.ClubId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}