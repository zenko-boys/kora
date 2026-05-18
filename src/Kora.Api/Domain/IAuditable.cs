namespace Kora.Domain;

public interface IAuditable
{
    Guid CreatedBy { get; set; }
    Guid UpdatedBy { get; set; }
    DateTime UpdatedAt { get; set; }
}
