using Kora.Common.Handlers;
using Kora.Domain.Users;
using Kora.Infrastructure.Auth;
using Kora.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Kora.Features.Users.ListMyClubs;

public class ListMyClubsHandler : IHandler
{
    private readonly AppDbContext _db;
    private readonly IUserContext _userContext;

    public ListMyClubsHandler(AppDbContext db, IUserContext userContext)
    {
        _db = db;
        _userContext = userContext;
    }

    public async Task<ListMyClubsResponse> Handle(CancellationToken ct)
    {
        var user = await _userContext.GetCurrentUserAsync(ct);

        var clubs = user.Role == UserRole.Admin
            ? await _db.Clubs
                .OrderBy(c => c.Name)
                .Select(c => new MyClubSummary(c.Id, c.Name, c.TimeZoneId, user.Role.ToString()))
                .ToListAsync(ct)
            : await _db.ClubStaff
                .Where(s => s.UserId == user.Id)
                .OrderBy(s => s.Club!.Name)
                .Select(s => new MyClubSummary(
                    s.ClubId,
                    s.Club!.Name,
                    s.Club.TimeZoneId,
                    s.Role.ToString()))
                .ToListAsync(ct);

        return new ListMyClubsResponse(clubs);
    }
}
