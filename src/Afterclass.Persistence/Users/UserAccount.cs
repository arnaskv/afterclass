namespace Afterclass.Persistence.Users;

/// <summary>
/// A person known to Afterclass, keyed by the identity provider's stable subject claim.
/// </summary>
public sealed class UserAccount
{
    public const int DisplayNameMaxLength = 80;
    public const int EmailMaxLength = 320;

    public Guid Id { get; init; } = Guid.CreateVersion7();

    public required string Subject { get; init; }

    public string? Email { get; set; }

    public required string DisplayName { get; set; }

    public DateTimeOffset CreatedAt { get; init; }

    public DateTimeOffset UpdatedAt { get; set; }

    /// <summary>Optimistic concurrency token mapped to PostgreSQL's <c>xmin</c> system column.</summary>
    public uint Version { get; set; }
}
