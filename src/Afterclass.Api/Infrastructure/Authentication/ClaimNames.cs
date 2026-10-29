using System.Security.Claims;

namespace Afterclass.Api.Infrastructure.Authentication;

/// <summary>OIDC claim names as issued by the identity provider (inbound claim mapping is disabled).</summary>
internal static class ClaimNames
{
    public const string Subject = "sub";
    public const string Name = "name";
    public const string Email = "email";

    public static string GetSubject(this ClaimsPrincipal user) =>
        user.FindFirstValue(Subject)
        ?? throw new InvalidOperationException("Authenticated user has no subject claim.");
}
