using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Afterclass.Persistence;

/// <summary>
/// Lets <c>dotnet ef migrations add</c> build the model without a running database or AppHost.
/// </summary>
public sealed class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<AfterclassDbContext>
{
    public AfterclassDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<AfterclassDbContext>()
            .UseNpgsql("Host=localhost;Database=afterclass_design")
            .Options;

        return new AfterclassDbContext(options);
    }
}
