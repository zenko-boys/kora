namespace Kora.Configuration;

public class DatabaseOptions
{
    public const string SectionName = "ConnectionStrings";

    public string Default { get; set; } = string.Empty;
}