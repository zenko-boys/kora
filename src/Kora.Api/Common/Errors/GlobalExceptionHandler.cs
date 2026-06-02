using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace Kora.Common.Errors;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var (statusCode, problem) = exception switch
        {
            ValidationException ve => CreateValidationProblem(ve),
            DomainException => CreateProblem(StatusCodes.Status400BadRequest, "Bad Request", exception.Message),
            UnauthorizedAccessException => CreateProblem(StatusCodes.Status403Forbidden, "Forbidden", exception.Message),
            InvalidOperationException => CreateProblem(StatusCodes.Status400BadRequest, "Bad Request", "An error occurred processing your request."),
            _ => (0, (ProblemDetails?)null)
        };

        if (problem is null)
        {
            return false;
        }

        _logger.LogWarning(
            exception,
            "Handled {ExceptionType} → {StatusCode}: {Message}",
            exception.GetType().Name, statusCode, exception.Message);

        httpContext.Response.StatusCode = statusCode;
        await httpContext.Response.WriteAsJsonAsync(problem, cancellationToken);
        return true;
    }

    private static (int, ProblemDetails) CreateProblem(int statusCode, string title, string detail) =>
        (statusCode, new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail
        });

    private static (int, ProblemDetails) CreateValidationProblem(ValidationException ve)
    {
        var errors = ve.Errors
            .GroupBy(e => e.PropertyName)
            .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());

        var problem = new ValidationProblemDetails(errors)
        {
            Status = StatusCodes.Status400BadRequest,
            Title = "Validation failed"
        };

        return (StatusCodes.Status400BadRequest, problem);
    }
}
