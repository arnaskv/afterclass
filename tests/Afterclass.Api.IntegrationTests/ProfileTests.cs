using System.Net;
using System.Net.Http.Json;
using Afterclass.Api.IntegrationTests.Infrastructure;

namespace Afterclass.Api.IntegrationTests;

/// <summary>The first vertical slice end to end: auth → antiforgery → validation → persistence → read back.</summary>
public sealed class ProfileTests(PostgresFixture postgres) : IAsyncLifetime
{
    private ApiFactory _factory = null!;

    private static CancellationToken CancellationToken => TestContext.Current.CancellationToken;

    public async ValueTask InitializeAsync()
    {
        _factory = new ApiFactory(await postgres.GetConnectionStringAsync(), useTestAuthentication: true);
    }

    public async ValueTask DisposeAsync() => await _factory.DisposeAsync();

    [Fact]
    public async Task First_read_creates_the_profile_from_identity_claims()
    {
        var subject = NewSubject();
        using var client = _factory.CreateSecureClient().SignedInAs(subject);

        var profile = await client.GetFromJsonAsync<ProfileDto>("/api/profile", CancellationToken);

        Assert.NotNull(profile);
        Assert.Equal($"Test {subject}", profile.DisplayName);
        Assert.Equal($"{subject}@afterclass.test", profile.Email);
    }

    [Fact]
    public async Task Update_is_persisted_and_read_back()
    {
        using var client = await _factory.CreateSecureClient().SignedInAs(NewSubject()).WithAntiforgeryTokenAsync();
        var original = await client.GetFromJsonAsync<ProfileDto>("/api/profile", CancellationToken);

        using var response = await client.PutAsJsonAsync(
            "/api/profile", new { displayName = "  Rūta Trenerė  ", version = original!.Version }, CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var reloaded = await client.GetFromJsonAsync<ProfileDto>("/api/profile", CancellationToken);
        Assert.Equal("Rūta Trenerė", reloaded!.DisplayName);
        Assert.NotEqual(original.Version, reloaded.Version);
    }

    [Fact]
    public async Task Update_without_antiforgery_token_is_rejected()
    {
        using var client = _factory.CreateSecureClient().SignedInAs(NewSubject());
        var original = await client.GetFromJsonAsync<ProfileDto>("/api/profile", CancellationToken);

        using var response = await client.PutAsJsonAsync(
            "/api/profile", new { displayName = "Nauja", version = original!.Version }, CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var unchanged = await client.GetFromJsonAsync<ProfileDto>("/api/profile", CancellationToken);
        Assert.Equal(original.DisplayName, unchanged!.DisplayName);
    }

    [Theory]
    [InlineData("")]
    [InlineData("A")]
    public async Task Update_with_invalid_display_name_returns_validation_problem(string displayName)
    {
        using var client = await _factory.CreateSecureClient().SignedInAs(NewSubject()).WithAntiforgeryTokenAsync();
        var original = await client.GetFromJsonAsync<ProfileDto>("/api/profile", CancellationToken);

        using var response = await client.PutAsJsonAsync(
            "/api/profile", new { displayName, version = original!.Version }, CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<ValidationProblemDto>(CancellationToken);
        Assert.Contains(problem!.Errors.Keys, key => key.Equals("DisplayName", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task Update_with_stale_version_returns_conflict()
    {
        using var client = await _factory.CreateSecureClient().SignedInAs(NewSubject()).WithAntiforgeryTokenAsync();
        var original = await client.GetFromJsonAsync<ProfileDto>("/api/profile", CancellationToken);
        using var first = await client.PutAsJsonAsync(
            "/api/profile", new { displayName = "Pirmas", version = original!.Version }, CancellationToken);
        first.EnsureSuccessStatusCode();

        using var stale = await client.PutAsJsonAsync(
            "/api/profile", new { displayName = "Antras", version = original.Version }, CancellationToken);

        Assert.Equal(HttpStatusCode.Conflict, stale.StatusCode);
        var current = await client.GetFromJsonAsync<ProfileDto>("/api/profile", CancellationToken);
        Assert.Equal("Pirmas", current!.DisplayName);
    }

    private static string NewSubject() => $"user-{Guid.NewGuid():N}";

    private sealed record ProfileDto(string DisplayName, string? Email, uint Version);

    private sealed record ValidationProblemDto(Dictionary<string, string[]> Errors);
}
