using Kora.Domain.Clubs;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Kora.Infrastructure.Data.Configurations;

public class ClubStaffConfiguration : IEntityTypeConfiguration<ClubStaff>
{
    public void Configure(EntityTypeBuilder<ClubStaff> builder)
    {
        builder.HasKey(x => new { x.ClubId, x.UserId });

        builder.Property(x => x.Role)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.HasOne(x => x.Club)
            .WithMany(c => c.Staff)
            .HasForeignKey(x => x.ClubId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.UserId);
    }
}
