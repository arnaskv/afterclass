using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.Extensions.Options;

namespace Afterclass.Api.Infrastructure.Authentication;

internal static class AuthenticationSetup
{
    public const string SessionCookieName = "afterclass.session";

    /// <summary>
    /// OIDC authorization code flow with PKCE, kept server-side. The browser only ever holds
    /// an HTTP-only session cookie; tokens stay inside the encrypted authentication ticket.
    /// </summary>
    public static WebApplicationBuilder AddAfterclassAuthentication(this WebApplicationBuilder builder)
    {
        builder.Services.AddOptions<OidcSettings>()
            .BindConfiguration(OidcSettings.SectionName)
            .ValidateDataAnnotations()
            .ValidateOnStart();

        builder.Services.AddAuthentication(options =>
            {
                options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                // Challenges return 401 (see OnRedirectToLogin); only /api/auth/login redirects to the IdP.
                options.DefaultChallengeScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                options.DefaultSignOutScheme = OpenIdConnectDefaults.AuthenticationScheme;
            })
            .AddCookie(options =>
            {
                options.Cookie.Name = SessionCookieName;
                options.Cookie.HttpOnly = true;
                options.Cookie.SameSite = SameSiteMode.Lax;
                options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                options.ExpireTimeSpan = TimeSpan.FromHours(8);
                options.SlidingExpiration = true;

                options.Events.OnRedirectToLogin = context =>
                {
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    return Task.CompletedTask;
                };
                options.Events.OnRedirectToAccessDenied = context =>
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    return Task.CompletedTask;
                };
            })
            .AddOpenIdConnect();

        builder.Services.AddOptions<OpenIdConnectOptions>(OpenIdConnectDefaults.AuthenticationScheme)
            .Configure<IOptions<OidcSettings>, IHostEnvironment>((options, settings, environment) =>
            {
                options.Authority = settings.Value.Authority;
                options.ClientId = settings.Value.ClientId;
                options.ClientSecret = settings.Value.ClientSecret;
                options.RequireHttpsMetadata = !environment.IsDevelopment();

                options.ResponseType = "code";
                options.UsePkce = true;
                // Needed for id_token_hint on sign-out; stored in the encrypted cookie ticket, not in the browser.
                options.SaveTokens = true;
                options.GetClaimsFromUserInfoEndpoint = true;
                options.MapInboundClaims = false;
                options.TokenValidationParameters.NameClaimType = ClaimNames.Name;

                options.Scope.Clear();
                options.Scope.Add("openid");
                options.Scope.Add("profile");
                options.Scope.Add("email");

                options.SignedOutRedirectUri = "/";
            });

        builder.Services.AddAuthorization();

        return builder;
    }
}
