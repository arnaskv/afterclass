using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Afterclass.Api.IntegrationTests.Infrastructure;

/// <summary>
/// Test-only scheme: a request is signed in as the subject named in <see cref="SubjectHeader"/>.
/// Lives in the test project so it can never be enabled in a deployed API.
/// </summary>
public sealed class TestAuthHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder) : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    public const string SchemeName = "Test";
    public const string SubjectHeader = "X-Test-Subject";

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue(SubjectHeader, out var subject) || string.IsNullOrEmpty(subject))
        {
            return Task.FromResult(AuthenticateResult.NoResult());
        }

        Claim[] claims =
        [
            new("sub", subject!),
            new("name", $"Test {subject}"),
            new("email", $"{subject}@afterclass.test"),
        ];
        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, SchemeName, "name", "role"));

        return Task.FromResult(AuthenticateResult.Success(new AuthenticationTicket(principal, SchemeName)));
    }
}
