namespace Kora.Common.Errors;

public class NotFoundException(string message) : Exception(message);
