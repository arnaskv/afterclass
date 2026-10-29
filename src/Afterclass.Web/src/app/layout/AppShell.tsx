import { DashboardIcon, PersonIcon } from "@radix-ui/react-icons";
import { Link, Outlet } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { UserMenu } from "@/features/auth/UserMenu";

export function AppShell() {
  const { t } = useTranslation();

  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only rounded-md bg-surface px-3 py-2 focus:not-sr-only focus:absolute focus:top-3 focus:left-3"
      >
        {t("app.skipToContent")}
      </a>
      <header className="sticky top-0 z-10 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold">
            <span aria-hidden="true" className="size-6 rounded-md bg-primary" />
            {t("app.name")}
          </Link>
          <nav aria-label={t("nav.main")} className="flex items-center gap-1">
            <NavLink to="/dashboard" icon={<DashboardIcon />}>
              {t("nav.dashboard")}
            </NavLink>
            <NavLink to="/profile" icon={<PersonIcon />}>
              {t("nav.profile")}
            </NavLink>
          </nav>
          <UserMenu />
        </div>
      </header>
      <main id="main" className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

function NavLink({
  to,
  icon,
  children,
}: {
  to: "/dashboard" | "/profile";
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-surface-muted hover:text-foreground"
      activeProps={{
        className: "bg-surface-muted text-foreground",
        "aria-current": "page",
      }}
    >
      <span aria-hidden="true">{icon}</span>
      <span className="hidden sm:inline">{children}</span>
    </Link>
  );
}
