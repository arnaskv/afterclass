import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/ui/Button";
import { Card, CardDescription } from "@/shared/ui/Card";

import { signInUrl } from "./signInUrl";

export function SignInPage({ returnUrl }: { returnUrl: string | undefined }) {
  const { t } = useTranslation();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleSignInClick = () => {
    setIsRedirecting(true);
    window.location.assign(signInUrl(returnUrl));
  };

  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <Card className="w-full max-w-sm animate-fade-in text-center">
        <p className="text-sm font-semibold tracking-wide text-primary uppercase">
          {t("app.name")}
        </p>
        <h1 className="mt-3 text-2xl font-bold">{t("auth.signInTitle")}</h1>
        <CardDescription className="mt-2">
          {t("auth.signInDescription")}
        </CardDescription>
        <Button
          className="mt-6 w-full"
          size="lg"
          pending={isRedirecting}
          onClick={handleSignInClick}
        >
          {isRedirecting ? t("auth.signingIn") : t("auth.signIn")}
        </Button>
      </Card>
    </main>
  );
}
