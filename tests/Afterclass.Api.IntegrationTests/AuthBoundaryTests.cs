using System.Net;
using Afterclass.Api.IntegrationTests.Infrastructure;

namespace Afterclass.Api.IntegrationTests;

/// <summary>Runs against the real cookie and OIDC configuration; needs no database.</summary>
public sealed class AuthBoundaryTests : IAsyncLifetime
{
    private readonly ApiFactory _factory = new(ApiFactory.UnusedConnectionString, useTestAuthentication: false);

    [Theory]
    [InlineData("/api/auth/me")]
    [InlineData("/api/profile")]
    public async Task Protected_endpoints_return_401_instead_of_redirecting(string path)
    {
        using var client = _factory.CreateSecureClient();

        using var response = await client.GetAsync(path, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Null(response.Headers.Location);
    }

    [Fact]
    public async Task Antiforgery_token_is_available_without_a_session()
    {
        using var client = _factory.CreateSecureClient();

        using var response = await client.GetAsync("/api/auth/antiforgery", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var cookies = response.Headers.GetValues("Set-Cookie");
        Assert.Contains(cookies, cookie => cookie.StartsWith("afterclass.antiforgery=", StringComparison.Ordinal)
            && cookie.Contains("httponly", StringComparison.OrdinalIgnoreCase));
    }

    public ValueTask InitializeAsync() => ValueTask.CompletedTask;

    public async ValueTask DisposeAsync() => await _factory.DisposeAsync();
}
