namespace Afterclass.Api.Infrastructure.Authentication;

internal static class ReturnUrls
{
    /// <summary>
    /// Accepts only app-relative paths so sign-in cannot be used as an open redirect.
    /// </summary>
    public static string Sanitize(string? returnUrl)
    {
        if (string.IsNullOrWhiteSpace(returnUrl))
        {
            return "/";
        }

        var isAppRelative = returnUrl.StartsWith('/')
            && !returnUrl.StartsWith("//", StringComparison.Ordinal)
            && !returnUrl.StartsWith("/\\", StringComparison.Ordinal)
            && !returnUrl.Any(char.IsControl);

        return isAppRelative ? returnUrl : "/";
    }
}
