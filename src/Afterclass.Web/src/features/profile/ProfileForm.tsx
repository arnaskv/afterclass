import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { getFieldErrors, hasStatus } from "@/shared/api/client/apiError";
import {
  getGetProfileQueryKey,
  useUpdateProfile,
} from "@/shared/api/generated/endpoints/profile/profile";
import type { ProfileResponse } from "@/shared/api/generated/model";
import { unwrap } from "@/shared/api/unwrap";
import { Alert } from "@/shared/ui/Alert";
import { Button } from "@/shared/ui/Button";
import { TextField } from "@/shared/ui/TextField";

import {
  DISPLAY_NAME_MAX,
  DISPLAY_NAME_MIN,
  profileFormSchema,
  type ProfileFormValues,
} from "./profileSchema";

export function ProfileForm({ profile }: { profile: ProfileResponse }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { displayName: profile.displayName },
  });

  const updateProfile = useUpdateProfile({
    mutation: {
      onSuccess: (response) => {
        const saved = unwrap(response);
        queryClient.setQueryData(getGetProfileQueryKey(), saved);
        form.reset({ displayName: saved.displayName });
      },
      onError: (error) => {
        for (const [field, messages] of Object.entries(getFieldErrors(error))) {
          if (field === "displayName" && messages[0]) {
            form.setError("displayName", { message: messages[0] });
          }
        }
      },
    },
  });

  const handleValidSubmit = (values: ProfileFormValues) => {
    updateProfile.mutate({
      data: { displayName: values.displayName, version: profile.version },
    });
  };

  const reloadLatestProfile = async () => {
    updateProfile.reset();
    await queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
    // Replace the stale draft with what the server has now.
    const latest = queryClient.getQueryData<ProfileResponse>(
      getGetProfileQueryKey(),
    );
    if (latest) {
      form.reset({ displayName: latest.displayName });
    }
  };

  const handleReloadClick = () => {
    void reloadLatestProfile();
  };

  const displayNameError = form.formState.errors.displayName?.message;
  const isConflict = hasStatus(updateProfile.error, 409);
  const hasUnexpectedError =
    updateProfile.isError &&
    !isConflict &&
    !hasStatus(updateProfile.error, 400);

  return (
    <form
      noValidate
      className="flex flex-col gap-5"
      onSubmit={form.handleSubmit(handleValidSubmit)}
    >
      <TextField
        label={t("profile.displayName")}
        autoComplete="name"
        maxLength={DISPLAY_NAME_MAX}
        error={translateValidation(displayNameError, t)}
        {...form.register("displayName")}
      />
      <TextField
        label={t("profile.email")}
        description={t("profile.emailDescription")}
        value={profile.email ?? ""}
        readOnly
      />

      {isConflict && (
        <Alert
          tone="danger"
          className="flex flex-wrap items-center justify-between gap-3"
        >
          <span>{t("profile.conflict")}</span>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={handleReloadClick}
          >
            {t("profile.reload")}
          </Button>
        </Alert>
      )}
      {hasUnexpectedError && <Alert tone="danger">{t("errors.generic")}</Alert>}
      {updateProfile.isSuccess && !form.formState.isDirty && (
        <Alert tone="success">{t("profile.saved")}</Alert>
      )}

      <div>
        <Button type="submit" pending={updateProfile.isPending}>
          {updateProfile.isPending ? t("profile.saving") : t("profile.save")}
        </Button>
      </div>
    </form>
  );
}

/** Client-side messages are translation keys; server messages are shown as sent. */
function translateValidation(
  message: string | undefined,
  t: ReturnType<typeof useTranslation>["t"],
) {
  if (message === "tooShort") {
    return t("profile.validation.tooShort", { min: DISPLAY_NAME_MIN });
  }
  if (message === "tooLong") {
    return t("profile.validation.tooLong", { max: DISPLAY_NAME_MAX });
  }
  return message;
}
