namespace Kora.Features.Management.Courts.BlockCourt;

public record BlockCourtRequest(DateTimeOffset StartsAt, DateTimeOffset EndsAt, string? Reason);
