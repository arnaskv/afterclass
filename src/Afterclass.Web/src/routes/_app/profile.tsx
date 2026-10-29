import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { profileQueryOptions } from "@/features/profile/profileQuery";
import { ProfileSection } from "@/features/profile/ProfileSection";
import { PageHeader } from "@/shared/ui/PageHeader";

export const Route = createFileRoute("/_app/profile")({
  // Start fetching during navigation; the section renders its own skeleton meanwhile.
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(profileQueryOptions());
  },
  component: ProfileRoute,
});

function ProfileRoute() {
  const { t } = useTranslation();

  return (
    <div className="max-w-xl">
      <PageHeader
        title={t("profile.title")}
        description={t("profile.description")}
      />
      <ProfileSection />
    </div>
  );
}
