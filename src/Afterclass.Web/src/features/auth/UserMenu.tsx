import { ChevronDownIcon, ExitIcon, PersonIcon } from "@radix-ui/react-icons";
import { Link } from "@tanstack/react-router";
import { DropdownMenu } from "radix-ui";
import { useTranslation } from "react-i18next";

import { signOut } from "./signOut";
import { useCurrentUser } from "./useCurrentUser";

const itemClassName =
  "flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none data-highlighted:bg-surface-muted";

export function UserMenu() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const displayName = user.name ?? user.email ?? user.subject;

  const handleSignOutSelect = () => {
    void signOut();
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        aria-label={t("auth.accountMenu")}
        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-surface-muted"
      >
        <span
          aria-hidden="true"
          className="flex size-8 items-center justify-center rounded-full bg-accent font-semibold text-foreground"
        >
          {displayName.charAt(0).toUpperCase()}
        </span>
        <span className="hidden max-w-40 truncate sm:inline">
          {displayName}
        </span>
        <ChevronDownIcon aria-hidden="true" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="min-w-48 animate-fade-in rounded-md border border-border bg-surface p-1 shadow-card"
        >
          <DropdownMenu.Item asChild className={itemClassName}>
            <Link to="/profile">
              <PersonIcon aria-hidden="true" />
              {t("nav.profile")}
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <DropdownMenu.Item
            className={itemClassName}
            onSelect={handleSignOutSelect}
          >
            <ExitIcon aria-hidden="true" />
            {t("auth.signOut")}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
