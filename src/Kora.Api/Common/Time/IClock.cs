namespace Kora.Common.Time;

public interface IClock
{
    DateTime UtcNow { get; }
}