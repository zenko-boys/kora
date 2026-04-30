using Kora.Domain.Slots;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Kora.Infrastructure.Data.Configurations;

public class SlotConfiguration : IEntityTypeConfiguration<Slot>
{
    public void Configure(EntityTypeBuilder<Slot> builder)
    {
        // Primary Key
        builder.HasKey(x => x.Id);

        // Properties
        builder.Property(x => x.ClubId)
            .IsRequired();

        builder.Property(x => x.CourtId);

        builder.Property(x => x.Type)
            .HasConversion<string>() 
            .IsRequired();

        builder.Property(x => x.StartsAt)
            .IsRequired();

        builder.Property(x => x.EndsAt)
            .IsRequired();

        builder.Property(x => x.Capacity)
            .IsRequired();

        // Relationships
        builder.HasMany(x => x.Participants)
            .WithOne()
            .HasForeignKey(x => x.SlotId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(x => x.ClubId);

        builder.HasIndex(x => new { x.ClubId, x.StartsAt, x.EndsAt });

        builder.HasIndex(x => x.CourtId);
    }
}