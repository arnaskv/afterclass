import { getAntiforgeryToken } from "@/shared/api/client/fetcher";

/**
 * Signs out with a real form post so the browser follows the redirect to the identity provider's
 * end-session page. The antiforgery token travels as a form field.
 */
export async function signOut(): Promise<void> {
  const token = await getAntiforgeryToken();

  const form = document.createElement("form");
  form.method = "post";
  form.action = "/api/auth/logout";
  form.hidden = true;

  const tokenField = document.createElement("input");
  tokenField.type = "hidden";
  tokenField.name = "__RequestVerificationToken";
  tokenField.value = token;
  form.append(tokenField);

  document.body.append(form);
  form.submit();
}
