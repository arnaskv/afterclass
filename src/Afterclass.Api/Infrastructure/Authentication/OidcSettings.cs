using System.ComponentModel.DataAnnotations;

namespace Afterclass.Api.Infrastructure.Authentication;

/// <summary>
/// Identity-provider registration for the backend-for-frontend. Values come from configuration
/// (the AppHost locally, a secret provider elsewhere) and never reach the browser.
/// </summary>
internal sealed class OidcSettings
{
    public const string SectionName = "Authentication:Oidc";

    [Required]
    public string Authority { get; set; } = string.Empty;

    [Required]
    public string ClientId { get; set; } = string.Empty;

    [Required]
    public string ClientSecret { get; set; } = string.Empty;
}
