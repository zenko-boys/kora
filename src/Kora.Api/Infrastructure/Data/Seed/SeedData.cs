using System.Text.Json;
using Kora.Domain.Clubs;
using Kora.Domain.Courts;
using Microsoft.EntityFrameworkCore;

namespace Kora.Infrastructure.Data.Seed;

public static class SeedData
{
    public static async Task SeedAsync(
        AppDbContext db,
        IWebHostEnvironment environment,
        CancellationToken ct = default)
    {
        if (!environment.IsDevelopment())
            return;

        if (await db.Clubs.AnyAsync(ct))
            return;

        var seedFilePath = Path.Combine(
            environment.ContentRootPath,
            "Infrastructure",
            "Data",
            "Seed",
            "seed.development.json");

        if (!File.Exists(seedFilePath))
            throw new FileNotFoundException("Seed file not found.", seedFilePath);

        var json = await File.ReadAllTextAsync(seedFilePath, ct);

        var seed = JsonSerializer.Deserialize<SeedFile>(
            json,
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

        if (seed is null)
            return;

        var now = DateTime.UtcNow;

        foreach (var clubSeed in seed.Clubs)
        {
            var club = new Club
            {
                Id = clubSeed.Id,
                Name = clubSeed.Name,
                TimeZoneId = clubSeed.TimeZoneId,
                SlotCellDurationMinutes = clubSeed.SlotCellDurationMinutes,
                MinimumBookingDurationMinutes = clubSeed.MinimumBookingDurationMinutes,
                CreatedAt = now
            };

            foreach (var courtSeed in clubSeed.Courts)
            {
                club.Courts.Add(new Court
                {
                    Id = courtSeed.Id,
                    ClubId = clubSeed.Id,
                    Name = courtSeed.Name,
                    CreatedAt = now
                });
            }

            foreach (var operatingHoursSeed in clubSeed.OperatingHours)
            {
                club.OperatingHours.Add(new ClubOperatingHours
                {
                    Id = Guid.NewGuid(),
                    DayOfWeek = (DayOfWeek)operatingHoursSeed.DayOfWeek,
                    OpenTime = TimeOnly.Parse(operatingHoursSeed.OpenTime),
                    CloseTime = TimeOnly.Parse(operatingHoursSeed.CloseTime)
                });
            }

            db.Clubs.Add(club);
        }

        await db.SaveChangesAsync(ct);
    }

    private sealed class SeedFile
    {
        public List<ClubSeed> Clubs { get; set; } = [];
    }

    private sealed class ClubSeed
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string TimeZoneId { get; set; } = string.Empty;

        public int SlotCellDurationMinutes { get; set; }

        public int MinimumBookingDurationMinutes { get; set; }

        public List<CourtSeed> Courts { get; set; } = [];

        public List<OperatingHoursSeed> OperatingHours { get; set; } = [];
    }

    private sealed class CourtSeed
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = string.Empty;
    }

    private sealed class OperatingHoursSeed
    {
        public int DayOfWeek { get; set; }

        public string OpenTime { get; set; } = string.Empty;

        public string CloseTime { get; set; } = string.Empty;
    }
}