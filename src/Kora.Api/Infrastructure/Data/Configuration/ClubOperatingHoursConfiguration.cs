using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Kora.Domain.Clubs;

namespace Kora.Infrastructure.Data.Configurations;

public class ClubOperatingHoursConfiguration : IEntityTypeConfiguration<ClubOperatingHours>
{
    public void Configure(EntityTypeBuilder<ClubOperatingHours> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.DayOfWeek)
            .IsRequired();

        builder.Property(x => x.OpenTime)
            .IsRequired();

        builder.Property(x => x.CloseTime)
            .IsRequired();

        builder.HasOne(x => x.Club)
            .WithMany(c => c.OperatingHours)
            .HasForeignKey(x => x.ClubId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}