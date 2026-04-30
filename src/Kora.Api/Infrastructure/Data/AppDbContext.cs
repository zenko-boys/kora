using Microsoft.EntityFrameworkCore;
using Kora.Domain.Bookings;
using Kora.Domain.Clubs;
using Kora.Domain.Courts;
using Kora.Domain.Reservations;
using Kora.Domain.Users;

namespace Kora.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public DbSet<ClubOperatingHours> ClubOperatingHours => Set<ClubOperatingHours>();
    public DbSet<Club> Clubs => Set<Club>();
    public DbSet<ClubStaff> ClubStaff => Set<ClubStaff>();
    public DbSet<Court> Courts => Set<Court>();
    public DbSet<Reservation> Reservations => Set<Reservation>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<BookingParticipant> BookingParticipants => Set<BookingParticipant>();
    public DbSet<User> Users => Set<User>();

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
