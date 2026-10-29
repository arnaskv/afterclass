using System.ComponentModel.DataAnnotations;
using Afterclass.Persistence.Users;

namespace Afterclass.Api.Features.Profile;

internal sealed record ProfileResponse(string DisplayName, string? Email, uint Version)
{
    public static ProfileResponse From(UserAccount account) =>
        new(account.DisplayName, account.Email, account.Version);
}

internal sealed record UpdateProfileRequest
{
    [Required]
    [StringLength(UserAccount.DisplayNameMaxLength, MinimumLength = 2)]
    public required string DisplayName { get; init; }

    /// <summary>The <see cref="ProfileResponse.Version"/> the client last read; stale versions get 409.</summary>
    public required uint Version { get; init; }
}
