using Afterclass.Api.IntegrationTests.Infrastructure;

namespace Afterclass.Api.IntegrationTests;

/// <summary>
/// Guards the public contract. If the API changed on purpose, regenerate the snapshot with
/// <c>AFTERCLASS_UPDATE_OPENAPI_SNAPSHOT=1 dotnet test --filter OpenApiSnapshotTests</c>, review the diff,
/// then run <c>npm --prefix src/Afterclass.Web run api:generate</c>.
/// </summary>
public sealed class OpenApiSnapshotTests : IAsyncLifetime
{
    private const string UpdateVariable = "AFTERCLASS_UPDATE_OPENAPI_SNAPSHOT";

    private readonly ApiFactory _factory = new(ApiFactory.UnusedConnectionString, useTestAuthentication: false);

    [Fact]
    public async Task Generated_document_matches_committed_snapshot()
    {
        using var client = _factory.CreateClient();
        var generated = Normalize(await client.GetStringAsync("/openapi/v1.json", TestContext.Current.CancellationToken));
        var snapshotPath = Path.Combine(FindRepositoryRoot(), "openapi", "afterclass-api.json");

        if (Environment.GetEnvironmentVariable(UpdateVariable) == "1")
        {
            Directory.CreateDirectory(Path.GetDirectoryName(snapshotPath)!);
            await File.WriteAllTextAsync(snapshotPath, generated, TestContext.Current.CancellationToken);
            return;
        }

        Assert.True(File.Exists(snapshotPath), $"Missing {snapshotPath}. Run with {UpdateVariable}=1 to create it.");
        var committed = Normalize(await File.ReadAllTextAsync(snapshotPath, TestContext.Current.CancellationToken));
        Assert.True(
            committed == generated,
            $"The OpenAPI document changed. Review it, then rerun with {UpdateVariable}=1 to accept it.");
    }

    public ValueTask InitializeAsync() => ValueTask.CompletedTask;

    public async ValueTask DisposeAsync() => await _factory.DisposeAsync();

    private static string Normalize(string json) => json.ReplaceLineEndings("\n").TrimEnd() + "\n";

    private static string FindRepositoryRoot()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Afterclass.slnx")))
        {
            directory = directory.Parent;
        }

        return directory?.FullName ?? throw new InvalidOperationException("Could not find Afterclass.slnx above the test output.");
    }
}
