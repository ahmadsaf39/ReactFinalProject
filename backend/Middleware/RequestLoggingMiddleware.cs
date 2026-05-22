using FinalProject.Services;
using System.Diagnostics;
using System.Security.Claims;

namespace FinalProject.Middleware
{
    /// <summary>
    /// ASP.NET Core middleware that intercepts every HTTP request and logs:
    ///   - Incoming request: method, path, client IP
    ///   - Outgoing response: status code, elapsed time
    ///   - Authenticated user (extracted from JWT claims if present)
    /// </summary>
    public class RequestLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ActivityLogger _logger;

        public RequestLoggingMiddleware(RequestDelegate next, ActivityLogger logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var sw = Stopwatch.StartNew();

            // Let the pipeline run (authentication happens inside the pipeline)
            await _next(context);

            sw.Stop();

            // Extract authenticated user (available AFTER auth middleware runs)
            var user = context.User?.FindFirstValue(ClaimTypes.Name)
                    ?? context.User?.FindFirstValue(ClaimTypes.NameIdentifier)
                    ?? "anonymous";

            var method = context.Request.Method;
            var path = context.Request.Path.Value ?? "/";
            var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var status = context.Response.StatusCode;
            var elapsed = sw.Elapsed.TotalMilliseconds;

            _logger.LogRequest(user, method, path, ip, status, elapsed);
        }
    }
}
