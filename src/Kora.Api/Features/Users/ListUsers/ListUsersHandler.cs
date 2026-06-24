using Kora.Common.Handlers;
using Kora.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Kora.Features.Users.ListUsers;

public class ListUsersHandler : IHandler
{
    private readonly AppDbContext _db;

    public ListUsersHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ListUsersResponse> Handle(string? search, CancellationToken ct)
    {
        var query = _db.Users.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(u =>
                u.Email.Contains(search) ||
                (u.FirstName != null && u.FirstName.Contains(search)) ||
                (u.LastName != null && u.LastName.Contains(search)));

        var users = await query
            .OrderBy(u => u.Email)
            .Select(u => new UserSummary(u.Id, u.Email, u.FirstName, u.LastName, u.Role))
            .ToListAsync(ct);

        return new ListUsersResponse(users);
    }
}
