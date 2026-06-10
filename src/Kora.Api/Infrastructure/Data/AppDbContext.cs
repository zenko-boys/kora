using Microsoft.EntityFrameworkCore;
using Kora.Domain;
using Kora.Domain.Bookings;
using Kora.Domain.Clubs;
using Kora.Domain.Courts;
using Kora.Domain.Reservations;
using Kora.Domain.Users;
using Kora.Infrastructure.Auth;


namespace Kora.Infrastructure.Data;

public class AppDbContext : DbContext
{
    private readonly CurrentUserIdHolder _userIdHolder;

    public DbSet<ClubOperatingHours> ClubOperatingHours => Set<ClubOperatingHours>();
    public DbSet<Club> Clubs => Set<Club>();
    public DbSet<ClubStaff> ClubStaff => Set<ClubStaff>();
    public DbSet<Court> Courts => Set<Court>();
    public DbSet<Reservation> Reservations => Set<Reservation>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<BookingParticipant> BookingParticipants => Set<BookingParticipant>();
    public DbSet<BookingGuest> BookingGuests => Set<BookingGuest>();
    public DbSet<CourtBlock> CourtBlocks => Set<CourtBlock>();
    public DbSet<User> Users => Set<User>();

    public AppDbContext(DbContextOptions<AppDbContext> options, CurrentUserIdHolder userIdHolder)
        : base(options)
    {
        _userIdHolder = userIdHolder;
    }

    public override Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        var userId = _userIdHolder.UserId ?? Guid.Empty;
        var now = DateTime.UtcNow;

        foreach (var entry in ChangeTracker.Entries<IAuditable>())
        {
            if (entry.State == EntityState.Added)
                entry.Entity.CreatedBy = userId;

            if (entry.State is EntityState.Added or EntityState.Modified)
            {
                entry.Entity.UpdatedBy = userId;
                entry.Entity.UpdatedAt = now;
            }
        }

        return base.SaveChangesAsync(ct);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
