using Kora.Domain.Reservations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Kora.Infrastructure.Data.Configurations;

public class ReservationConfiguration : IEntityTypeConfiguration<Reservation>
{
    public void Configure(EntityTypeBuilder<Reservation> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.BookingId)
            .IsRequired();

        builder.Property(x => x.CourtId)
            .IsRequired();

        builder.Property(x => x.StartsAt)
            .IsRequired();

        builder.Property(x => x.EndsAt)
            .IsRequired();

        builder.HasOne(x => x.Booking)
            .WithMany(x => x.Reservations)
            .HasForeignKey(x => x.BookingId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Court)
            .WithMany(x => x.Reservations)
            .HasForeignKey(x => x.CourtId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.CourtId, x.StartsAt });
        builder.HasIndex(x => x.BookingId);
    }
}
