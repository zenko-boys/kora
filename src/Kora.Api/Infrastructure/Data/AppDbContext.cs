using Microsoft.EntityFrameworkCore;
using Kora.Domain.Slots;

namespace Kora.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public DbSet<Slot> Slots => Set<Slot>();
    public DbSet<SlotParticipant> SlotParticipants => Set<SlotParticipant>();

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}