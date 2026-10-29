import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { Alert } from "@/shared/ui/Alert";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Skeleton } from "@/shared/ui/Skeleton";

import { ProfileForm } from "./ProfileForm";
import { profileQueryOptions } from "./profileQuery";

export function ProfileSection() {
  const { t } = useTranslation();
  const profile = useQuery(profileQueryOptions());

  const handleRetryClick = () => {
    void profile.refetch();
  };

  if (profile.isPending) {
    return <ProfileFormSkeleton label={t("profile.loading")} />;
  }

  if (profile.isError) {
    return (
      <Card>
        <Alert
          tone="danger"
          className="flex flex-wrap items-center justify-between gap-3"
        >
          <span>{t("profile.loadError")}</span>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={handleRetryClick}
          >
            {t("errors.retry")}
          </Button>
        </Alert>
      </Card>
    );
  }

  return (
    <Card aria-busy={profile.isFetching || undefined}>
      <ProfileForm profile={profile.data} />
    </Card>
  );
}

function ProfileFormSkeleton({ label }: { label: string }) {
  return (
    <Card role="status" aria-label={label}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>
    </Card>
  );
}
