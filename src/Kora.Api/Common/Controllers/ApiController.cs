using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;

namespace Kora.Common.Controllers;

[ApiVersion("1.0")]
[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public abstract class ApiController : ControllerBase;
