using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Afterclass.Persistence.Users;

internal sealed class UserAccountConfiguration : IEntityTypeConfiguration<UserAccount>
{
    public void Configure(EntityTypeBuilder<UserAccount> builder)
    {
        builder.HasKey(user => user.Id);
        builder.Property(user => user.Subject).HasMaxLength(255);
        builder.Property(user => user.Email).HasMaxLength(UserAccount.EmailMaxLength);
        builder.Property(user => user.DisplayName).HasMaxLength(UserAccount.DisplayNameMaxLength);
        builder.Property(user => user.Version).IsRowVersion();

        builder.HasIndex(user => user.Subject).IsUnique();
    }
}
