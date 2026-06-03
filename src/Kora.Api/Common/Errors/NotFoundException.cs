namespace Kora.Common.Errors;

public class NotFoundException(string message) : DomainException(message);
