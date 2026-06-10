using Kora.Domain.Courts;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Kora.Infrastructure.Data.Configurations;

public class CourtBlockConfiguration : IEntityTypeConfiguration<CourtBlock>
{
    public void Configure(EntityTypeBuilder<CourtBlock> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.CourtId).IsRequired();
        builder.Property(x => x.StartsAt).IsRequired();
        builder.Property(x => x.EndsAt).IsRequired();
        builder.Property(x => x.Reason).HasMaxLength(300);

        builder.HasOne(x => x.Court)
            .WithMany(c => c.Blocks)
            .HasForeignKey(x => x.CourtId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.CourtId);
        builder.HasIndex(x => new { x.CourtId, x.StartsAt, x.EndsAt });
    }
}
