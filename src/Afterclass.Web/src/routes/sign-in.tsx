import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { SignInPage } from "@/features/auth/SignInPage";

const signInSearchSchema = z.object({
  returnUrl: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/sign-in")({
  validateSearch: signInSearchSchema,
  component: SignInRoute,
});

function SignInRoute() {
  const { returnUrl } = Route.useSearch();
  return <SignInPage returnUrl={returnUrl} />;
}
