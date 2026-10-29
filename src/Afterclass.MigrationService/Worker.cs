using System.Diagnostics;
using Afterclass.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Afterclass.MigrationService;

/// <summary>
/// One-shot process: applies pending EF Core migrations, then stops the host.
/// The AppHost starts database-dependent services only after this completes successfully.
/// </summary>
public sealed partial class Worker(
    IServiceProvider serviceProvider,
    IHostApplicationLifetime hostApplicationLifetime,
    ILogger<Worker> logger) : BackgroundService
{
    public const string ActivitySourceName = "Afterclass.Migrations";

    private static readonly ActivitySource ActivitySource = new(ActivitySourceName);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var activity = ActivitySource.StartActivity("Migrating database", ActivityKind.Client);

        try
        {
            using var scope = serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<AfterclassDbContext>();

            var strategy = dbContext.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(() => dbContext.Database.MigrateAsync(stoppingToken));

            LogMigrationsApplied(logger);
        }
        catch (Exception exception)
        {
            activity?.AddException(exception);
            LogMigrationFailed(logger, exception);
            // A non-zero exit code makes the AppHost report the failure and keeps dependents from starting.
            Environment.ExitCode = 1;
        }

        hostApplicationLifetime.StopApplication();
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Database migrations applied")]
    private static partial void LogMigrationsApplied(ILogger logger);

    [LoggerMessage(Level = LogLevel.Error, Message = "Database migration failed")]
    private static partial void LogMigrationFailed(ILogger logger, Exception exception);
}
