namespace Afterclass.Api.Infrastructure.Authentication;

internal static class CookieSecurity
{
    /// <summary>
    /// Cookies are always Secure outside Development. Local development runs over plain http
    /// (Vite → API), where some browsers, Safari included, drop Secure cookies even on localhost.
    /// </summary>
    public static CookieSecurePolicy PolicyFor(IHostEnvironment environment) =>
        environment.IsDevelopment() ? CookieSecurePolicy.SameAsRequest : CookieSecurePolicy.Always;
}
