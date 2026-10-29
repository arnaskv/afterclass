using Afterclass.Persistence;
using Microsoft.EntityFrameworkCore;
using Testcontainers.PostgreSql;

[assembly: AssemblyFixture(typeof(Afterclass.Api.IntegrationTests.Infrastructure.PostgresFixture))]

namespace Afterclass.Api.IntegrationTests.Infrastructure;

/// <summary>
/// One disposable PostgreSQL container per test run, migrated with the real migrations.
/// Requires a running Docker-compatible engine. The container is created on first use, so tests that
/// don't need a database also run where Docker is unavailable.
/// </summary>
public sealed class PostgresFixture : IAsyncDisposable
{
    private readonly SemaphoreSlim _startLock = new(1, 1);
    private PostgreSqlContainer? _container;

    public async Task<string> GetConnectionStringAsync()
    {
        await _startLock.WaitAsync();
        try
        {
            if (_container is null)
            {
                var container = new PostgreSqlBuilder("postgres:18.3").Build();
                await container.StartAsync();
                await using var dbContext = new AfterclassDbContext(
                    new DbContextOptionsBuilder<AfterclassDbContext>().UseNpgsql(container.GetConnectionString()).Options);
                await dbContext.Database.MigrateAsync();
                _container = container;
            }

            return _container.GetConnectionString();
        }
        finally
        {
            _startLock.Release();
        }
    }

    public async ValueTask DisposeAsync()
    {
        if (_container is not null)
        {
            await _container.DisposeAsync();
        }

        _startLock.Dispose();
    }
}
