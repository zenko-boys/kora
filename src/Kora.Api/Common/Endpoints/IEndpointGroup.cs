namespace Kora.Common.Endpoints;

public interface IEndpointGroup
{
    void MapEndpoints(IEndpointRouteBuilder app);
}
