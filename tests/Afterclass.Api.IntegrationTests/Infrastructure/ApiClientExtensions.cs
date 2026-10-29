using System.Net.Http.Json;

namespace Afterclass.Api.IntegrationTests.Infrastructure;

internal static class ApiClientExtensions
{
    public static HttpClient SignedInAs(this HttpClient client, string subject)
    {
        client.DefaultRequestHeaders.Add(TestAuthHandler.SubjectHeader, subject);
        return client;
    }

    /// <summary>Fetches a request token the same way the browser does and sends it on later requests.</summary>
    public static async Task<HttpClient> WithAntiforgeryTokenAsync(this HttpClient client)
    {
        var response = await client.GetFromJsonAsync<AntiforgeryTokenDto>("/api/auth/antiforgery", TestContext.Current.CancellationToken);
        client.DefaultRequestHeaders.Add("X-XSRF-TOKEN", response!.RequestToken);
        return client;
    }

    private sealed record AntiforgeryTokenDto(string RequestToken);
}
