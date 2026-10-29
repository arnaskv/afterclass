using Afterclass.Persistence.Users;
using Microsoft.EntityFrameworkCore;

namespace Afterclass.Persistence;

public sealed class AfterclassDbContext(DbContextOptions<AfterclassDbContext> options) : DbContext(options)
{
    public DbSet<UserAccount> UserAccounts => Set<UserAccount>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseSnakeCaseNamingConvention();
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AfterclassDbContext).Assembly);
    }
}
