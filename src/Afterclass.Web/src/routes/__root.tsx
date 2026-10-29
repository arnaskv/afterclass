import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  Link,
  Outlet,
} from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: Outlet,
  notFoundComponent: NotFound,
});

function NotFound() {
  const { t } = useTranslation();

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg items-center px-4">
      <EmptyState
        className="w-full"
        title={t("errors.notFoundTitle")}
        description={t("errors.notFoundDescription")}
        action={
          <Button asChild variant="secondary">
            <Link to="/">{t("errors.backHome")}</Link>
          </Button>
        }
      />
    </main>
  );
}
