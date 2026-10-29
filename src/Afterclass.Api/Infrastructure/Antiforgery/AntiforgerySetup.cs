using Afterclass.Api.Infrastructure.Authentication;
using Microsoft.AspNetCore.Antiforgery;

namespace Afterclass.Api.Infrastructure.Antiforgery;

internal static class AntiforgerySetup
{
    public const string HeaderName = "X-XSRF-TOKEN";

    public static WebApplicationBuilder AddAfterclassAntiforgery(this WebApplicationBuilder builder)
    {
        var cookieSecurePolicy = CookieSecurity.PolicyFor(builder.Environment);

        builder.Services.AddAntiforgery(options =>
        {
            options.HeaderName = HeaderName;
            options.Cookie.Name = "afterclass.antiforgery";
            options.Cookie.HttpOnly = true;
            options.Cookie.SameSite = SameSiteMode.Strict;
            options.Cookie.SecurePolicy = cookieSecurePolicy;
        });

        return builder;
    }

    /// <summary>
    /// Validates the antiforgery token on every unsafe request in the group. Minimal APIs only do this
    /// automatically for form-bound endpoints, and cookie-authenticated JSON mutations need it too.
    /// </summary>
    public static RouteGroupBuilder RequireAntiforgeryForUnsafeMethods(this RouteGroupBuilder group)
    {
        group.AddEndpointFilter(async (context, next) =>
        {
            var httpContext = context.HttpContext;
            if (HttpMethods.IsGet(httpContext.Request.Method)
                || HttpMethods.IsHead(httpContext.Request.Method)
                || HttpMethods.IsOptions(httpContext.Request.Method))
            {
                return await next(context);
            }

            var antiforgery = httpContext.RequestServices.GetRequiredService<IAntiforgery>();
            if (!await antiforgery.IsRequestValidAsync(httpContext))
            {
                return TypedResults.Problem(
                    statusCode: StatusCodes.Status400BadRequest,
                    title: "Invalid or missing antiforgery token.",
                    type: "https://afterclass.app/problems/antiforgery");
            }

            return await next(context);
        });

        return group;
    }
}
