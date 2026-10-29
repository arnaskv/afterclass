using Afterclass.Api.Infrastructure.Authentication;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Http.HttpResults;
using System.Security.Claims;

namespace Afterclass.Api.Features.Auth;

internal static class AuthEndpoints
{
    public static RouteGroupBuilder MapAuthEndpoints(this RouteGroupBuilder api)
    {
        var auth = api.MapGroup("/auth").WithTags("Auth");

        auth.MapGet("/login", (string? returnUrl) =>
                TypedResults.Challenge(
                    new AuthenticationProperties { RedirectUri = ReturnUrls.Sanitize(returnUrl) },
                    [OpenIdConnectDefaults.AuthenticationScheme]))
            .AllowAnonymous()
            .ExcludeFromDescription();

        // Submitted as a regular form post (antiforgery token in a form field) so the browser can follow
        // the redirect to the IdP's end-session page.
        auth.MapPost("/logout", SignOut)
            .AllowAnonymous()
            .ExcludeFromDescription();

        auth.MapGet("/me", GetCurrentUser)
            .RequireAuthorization()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .WithName("getCurrentUser")
            .WithSummary("Returns the signed-in user, or 401 when there is no session.");

        auth.MapGet("/antiforgery", GetAntiforgeryToken)
            .AllowAnonymous()
            .WithName("getAntiforgeryToken")
            .WithSummary("Issues a request token for unsafe requests. Keep it in memory only.");

        return api;
    }

    private static IResult SignOut(ClaimsPrincipal user)
    {
        if (user.Identity?.IsAuthenticated != true)
        {
            return TypedResults.LocalRedirect("/");
        }

        return TypedResults.SignOut(
            new AuthenticationProperties { RedirectUri = "/" },
            [CookieAuthenticationDefaults.AuthenticationScheme, OpenIdConnectDefaults.AuthenticationScheme]);
    }

    private static Ok<CurrentUserResponse> GetCurrentUser(ClaimsPrincipal user) =>
        TypedResults.Ok(new CurrentUserResponse(
            user.GetSubject(),
            user.FindFirstValue(ClaimNames.Name),
            user.FindFirstValue(ClaimNames.Email)));

    private static Ok<AntiforgeryTokenResponse> GetAntiforgeryToken(HttpContext httpContext, IAntiforgery antiforgery)
    {
        var tokens = antiforgery.GetAndStoreTokens(httpContext);
        return TypedResults.Ok(new AntiforgeryTokenResponse(tokens.RequestToken!));
    }
}

internal sealed record CurrentUserResponse(string Subject, string? Name, string? Email);

internal sealed record AntiforgeryTokenResponse(string RequestToken);
