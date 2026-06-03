namespace Kora.Infrastructure.Auth;

public interface IClubAuthorizationService
{
    Task<bool> IsClubStaffOrAdminAsync(Guid clubId, CancellationToken ct = default);
    Task EnsureClubStaffOrAdminAsync(Guid clubId, CancellationToken ct = default);
}
