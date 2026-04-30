using Microsoft.EntityFrameworkCore;
using Kora.Domain.Bookings;
using Kora.Domain.Slots;
using Kora.Domain.Clubs;
using Kora.Domain.Courts;

namespace Kora.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public DbSet<ClubOperatingHours> ClubOperatingHours => Set<ClubOperatingHours>();
    public DbSet<Club> Clubs => Set<Club>();
    public DbSet<Court> Courts => Set<Court>();
    public DbSet<Slot> Slots => Set<Slot>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<BookingParticipant> BookingParticipants => Set<BookingParticipant>();

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
