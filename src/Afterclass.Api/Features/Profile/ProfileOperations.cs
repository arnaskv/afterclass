using System.Security.Claims;
using Afterclass.Api.Infrastructure.Authentication;
using Afterclass.Persistence;
using Afterclass.Persistence.Users;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Afterclass.Api.Features.Profile;

internal sealed class ProfileOperations(AfterclassDbContext dbContext, TimeProvider timeProvider)
{
    /// <summary>
    /// Returns the account for the signed-in user, creating it from identity-provider claims on first use.
    /// </summary>
    public async Task<UserAccount> GetOrCreateAsync(ClaimsPrincipal user, CancellationToken cancellationToken)
    {
        var subject = user.GetSubject();
        var existing = await dbContext.UserAccounts.SingleOrDefaultAsync(account => account.Subject == subject, cancellationToken);
        if (existing is not null)
        {
            return existing;
        }

        var now = timeProvider.GetUtcNow();
        var created = new UserAccount
        {
            Subject = subject,
            Email = user.FindFirstValue(ClaimNames.Email),
            DisplayName = InitialDisplayName(user),
            CreatedAt = now,
            UpdatedAt = now,
        };
        dbContext.UserAccounts.Add(created);

        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return created;
        }
        catch (DbUpdateException exception) when (exception.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            // A parallel first request created the account; use that one.
            dbContext.Entry(created).State = EntityState.Detached;
            return await dbContext.UserAccounts.SingleAsync(account => account.Subject == subject, cancellationToken);
        }
    }

    public async Task<UpdateProfileResult> UpdateAsync(
        ClaimsPrincipal user,
        UpdateProfileRequest request,
        CancellationToken cancellationToken)
    {
        var account = await GetOrCreateAsync(user, cancellationToken);

        // Compare against the version the client saw, not the one just loaded.
        dbContext.Entry(account).Property(entity => entity.Version).OriginalValue = request.Version;
        account.DisplayName = request.DisplayName.Trim();
        account.UpdatedAt = timeProvider.GetUtcNow();

        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return new UpdateProfileResult.Updated(account);
        }
        catch (DbUpdateConcurrencyException)
        {
            return new UpdateProfileResult.Conflict();
        }
    }

    private static string InitialDisplayName(ClaimsPrincipal user)
    {
        var name = user.FindFirstValue(ClaimNames.Name) ?? user.FindFirstValue(ClaimNames.Email) ?? "Naudotojas";
        return name.Length <= UserAccount.DisplayNameMaxLength ? name : name[..UserAccount.DisplayNameMaxLength];
    }
}

internal abstract record UpdateProfileResult
{
    public sealed record Updated(UserAccount Account) : UpdateProfileResult;

    public sealed record Conflict : UpdateProfileResult;
}
