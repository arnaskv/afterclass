using Afterclass.Api.Infrastructure.Authentication;

namespace Afterclass.Api.UnitTests;

public sealed class ReturnUrlsTests
{
    [Theory]
    [InlineData("/", "/")]
    [InlineData("/dashboard", "/dashboard")]
    [InlineData("/groups?season=2026", "/groups?season=2026")]
    public void Sanitize_keeps_app_relative_paths(string returnUrl, string expected)
    {
        Assert.Equal(expected, ReturnUrls.Sanitize(returnUrl));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("https://evil.example")]
    [InlineData("//evil.example")]
    [InlineData("/\\evil.example")]
    [InlineData("dashboard")]
    [InlineData("/dash\nboard")]
    public void Sanitize_falls_back_to_root_for_anything_else(string? returnUrl)
    {
        Assert.Equal("/", ReturnUrls.Sanitize(returnUrl));
    }
}
