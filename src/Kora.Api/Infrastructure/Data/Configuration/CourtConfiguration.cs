using Kora.Domain.Courts;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Kora.Infrastructure.Data.Configurations;

public class CourtConfiguration : IEntityTypeConfiguration<Court>
{
    public void Configure(EntityTypeBuilder<Court> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.ClubId)
            .IsRequired();

        builder.Property(x => x.Name)
            .HasMaxLength(80)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.HasIndex(x => x.ClubId);

        builder.HasIndex(x => new { x.ClubId, x.Name })
            .IsUnique();
    }
}