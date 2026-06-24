using Kora.Common.Handlers;
using Kora.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Kora.Features.Users.FindUserByEmail;

public class FindUserByEmailHandler : IHandler
{
    private readonly AppDbContext _db;

    public FindUserByEmailHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<UserSummary?> Handle(string email, CancellationToken ct)
    {
        var normalizedEmail = email.ToLowerInvariant();

        return await _db.Users
            .Where(u => u.Email.ToLower() == normalizedEmail)
            .Select(u => new UserSummary(u.Id, u.Email, u.FirstName, u.LastName))
            .FirstOrDefaultAsync(ct);
    }
}
