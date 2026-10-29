using Afterclass.Api.Features.Auth;
using Afterclass.Api.Features.Profile;
using Afterclass.Api.Infrastructure.Antiforgery;
using Afterclass.Api.Infrastructure.Authentication;
using System.Text.Json.Serialization;
using Afterclass.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();
builder.AddNpgsqlDbContext<AfterclassDbContext>("afterclass");

builder.Services.AddProblemDetails();
// Numbers stay numbers on the wire, which keeps the OpenAPI schema and the generated TypeScript types precise.
builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.NumberHandling = JsonNumberHandling.Strict);
builder.Services.AddValidation();
builder.Services.AddOpenApi(options => options.AddDocumentTransformer((document, _, _) =>
{
    document.Info.Title = "Afterclass API";
    // Clients call the API on their own origin; a host-specific server URL would make the snapshot unstable.
    document.Servers = [];
    return Task.CompletedTask;
}));
builder.Services.AddSingleton(TimeProvider.System);

builder.AddAfterclassAuthentication();
builder.Services.AddAfterclassAntiforgery();

builder.Services.AddScoped<ProfileOperations>();

var app = builder.Build();

app.UseExceptionHandler();
app.UseStatusCodePages();

app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

var api = app.MapGroup("/api")
    .RequireAntiforgeryForUnsafeMethods();

api.MapAuthEndpoints();
api.MapProfileEndpoints();

app.MapDefaultEndpoints();

app.Run();

/// <summary>Entry point marker used by <c>WebApplicationFactory</c> in integration tests.</summary>
public partial class Program;
