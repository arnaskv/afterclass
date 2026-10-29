var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder.AddPostgres("postgres")
    .WithDataVolume()
    .WithPgAdmin();

var database = postgres.AddDatabase("afterclass");

// Generated once and stored in the AppHost user secrets; shared by Keycloak's realm import and the API.
var oidcClientSecret = ParameterResourceBuilderExtensions.CreateDefaultPasswordParameter(
    builder, "oidc-client-secret", special: false);

// Fixed host port so the issuer URL and browser redirects stay stable between runs.
var keycloak = builder.AddKeycloak("keycloak", port: 8080)
    .WithRealmImport("./Realms")
    .WithEnvironment("AFTERCLASS_WEB_CLIENT_SECRET", oidcClientSecret);

var migrations = builder.AddProject<Projects.Afterclass_MigrationService>("migrations")
    .WithReference(database)
    .WaitFor(database);

var api = builder.AddProject<Projects.Afterclass_Api>("api")
    .WithReference(database)
    .WithReference(keycloak)
    .WaitFor(keycloak)
    .WaitForCompletion(migrations)
    .WithEnvironment("Authentication__Oidc__Authority",
        ReferenceExpression.Create($"{keycloak.GetEndpoint("http")}/realms/afterclass"))
    .WithEnvironment("Authentication__Oidc__ClientId", "afterclass-web")
    .WithEnvironment("Authentication__Oidc__ClientSecret", oidcClientSecret);

// The browser only talks to Vite; Vite proxies /api and the OIDC callbacks to the API (same origin).
builder.AddViteApp("web", "../Afterclass.Web")
    .WithEndpoint("http", endpoint => endpoint.Port = 5173)
    .WithReference(api)
    .WaitFor(api);

builder.Build().Run();
