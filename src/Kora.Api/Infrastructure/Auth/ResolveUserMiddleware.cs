namespace Kora.Infrastructure.Auth;

public class ResolveUserMiddleware
{
    private readonly RequestDelegate _next;

    public ResolveUserMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context, IUserContext userContext)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            await userContext.GetCurrentUserAsync(context.RequestAborted);
        }

        await _next(context);
    }
}
