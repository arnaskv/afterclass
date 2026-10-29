import { CalendarIcon } from "@radix-ui/react-icons";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { useCurrentUser } from "@/features/auth/useCurrentUser";
import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { PageHeader } from "@/shared/ui/PageHeader";

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardRoute,
});

function DashboardRoute() {
  const { t } = useTranslation();
  const user = useCurrentUser();

  return (
    <>
      <PageHeader
        title={t("dashboard.greeting", { name: user.name ?? user.email ?? "" })}
      />
      <EmptyState
        icon={<CalendarIcon className="size-8" />}
        title={t("dashboard.emptyTitle")}
        description={t("dashboard.emptyDescription")}
        action={
          <Button asChild variant="secondary">
            <Link to="/profile">{t("dashboard.goToProfile")}</Link>
          </Button>
        }
      />
    </>
  );
}
