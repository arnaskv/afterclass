import { createFileRoute, redirect } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { AppShell } from "@/app/layout/AppShell";
import { currentUserQueryOptions } from "@/features/auth/currentUser";
import { hasStatus } from "@/shared/api/client/apiError";
import { FullScreenLoader } from "@/shared/ui/FullScreenLoader";

/** Pathless layout for everything that needs a session. */
export const Route = createFileRoute("/_app")({
  beforeLoad: async ({ context, location }) => {
    try {
      await context.queryClient.ensureQueryData(currentUserQueryOptions());
    } catch (error) {
      if (hasStatus(error, 401)) {
        throw redirect({
          to: "/sign-in",
          search: { returnUrl: location.href },
        });
      }
      throw error;
    }
  },
  pendingComponent: SessionLoader,
  component: AppShell,
});

function SessionLoader() {
  const { t } = useTranslation();
  return <FullScreenLoader label={t("app.loadingSession")} />;
}
