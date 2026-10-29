using System.Security.Claims;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Afterclass.Api.Features.Profile;

internal static class ProfileEndpoints
{
    public static RouteGroupBuilder MapProfileEndpoints(this RouteGroupBuilder api)
    {
        var profile = api.MapGroup("/profile")
            .WithTags("Profile")
            .RequireAuthorization()
            .ProducesProblem(StatusCodes.Status401Unauthorized);

        profile.MapGet("/", GetProfile)
            .WithName("getProfile")
            .WithSummary("Returns the signed-in user's profile.");

        profile.MapPut("/", UpdateProfile)
            .WithName("updateProfile")
            .WithSummary("Updates the signed-in user's profile. Returns 409 when the version is stale.")
            .ProducesValidationProblem()
            .ProducesProblem(StatusCodes.Status409Conflict);

        return api;
    }

    private static async Task<Ok<ProfileResponse>> GetProfile(
        ClaimsPrincipal user,
        ProfileOperations operations,
        CancellationToken cancellationToken)
    {
        var account = await operations.GetOrCreateAsync(user, cancellationToken);
        return TypedResults.Ok(ProfileResponse.From(account));
    }

    private static async Task<Results<Ok<ProfileResponse>, ProblemHttpResult>> UpdateProfile(
        UpdateProfileRequest request,
        ClaimsPrincipal user,
        ProfileOperations operations,
        CancellationToken cancellationToken)
    {
        var result = await operations.UpdateAsync(user, request, cancellationToken);

        return result switch
        {
            UpdateProfileResult.Updated updated => TypedResults.Ok(ProfileResponse.From(updated.Account)),
            UpdateProfileResult.Conflict => TypedResults.Problem(
                statusCode: StatusCodes.Status409Conflict,
                title: "The profile was changed by someone else. Reload and try again.",
                type: "https://afterclass.app/problems/concurrency"),
            _ => throw new InvalidOperationException($"Unhandled result {result.GetType().Name}."),
        };
    }
}
