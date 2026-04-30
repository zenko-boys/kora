using Kora.Domain.Slots;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Kora.Infrastructure.Data.Configurations;

public class SlotParticipantConfiguration : IEntityTypeConfiguration<SlotParticipant>
{
    public void Configure(EntityTypeBuilder<SlotParticipant> builder)
    {
        builder.HasKey(x => new { x.SlotId, x.UserId });

        builder.Property(x => x.JoinedAt)
            .IsRequired();

        builder.HasIndex(x => x.UserId);
    }
}