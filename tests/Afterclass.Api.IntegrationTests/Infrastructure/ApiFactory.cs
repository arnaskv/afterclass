using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;

namespace Afterclass.Api.IntegrationTests.Infrastructure;

/// <summary>
/// Hosts the real API in memory. Configuration that the AppHost normally supplies is replaced with
/// test values. With <paramref name="useTestAuthentication"/>, requests authenticate through
/// <see cref="TestAuthHandler"/> instead of the identity provider.
/// </summary>
public sealed class ApiFactory(string connectionString, bool useTestAuthentication) : WebApplicationFactory<Program>
{
    public const string UnusedConnectionString = "Host=localhost;Port=1;Database=unused";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");
        builder.UseSetting("ConnectionStrings:afterclass", connectionString);
        builder.UseSetting("Authentication:Oidc:Authority", "https://identity.test/realms/afterclass");
        builder.UseSetting("Authentication:Oidc:ClientId", "afterclass-tests");
        builder.UseSetting("Authentication:Oidc:ClientSecret", "not-a-real-secret");

        if (!useTestAuthentication)
        {
            return;
        }

        builder.ConfigureTestServices(services =>
        {
            services.AddAuthentication(options =>
                {
                    options.DefaultScheme = TestAuthHandler.SchemeName;
                    options.DefaultChallengeScheme = TestAuthHandler.SchemeName;
                })
                .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(TestAuthHandler.SchemeName, configureOptions: null);
        });
    }

    /// <summary>Session cookies are Secure, so the client must use an https base address to send them back.</summary>
    public HttpClient CreateSecureClient() =>
        CreateClient(new WebApplicationFactoryClientOptions { BaseAddress = new Uri("https://localhost") });
}
