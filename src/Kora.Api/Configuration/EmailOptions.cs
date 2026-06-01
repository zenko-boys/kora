namespace Kora.Configuration;

public class EmailOptions
{
    public const string SectionName = "Email";

    public string ApiKey { get; set; } = string.Empty;

    /// <summary>
    /// Full "Name <address>" format, e.g. "Kora &lt;noreply@koraplay.com&gt;"
    /// </summary>
    public string From { get; set; } = string.Empty;
}
