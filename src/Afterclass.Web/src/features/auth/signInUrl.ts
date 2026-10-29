/** The API validates returnUrl again and only accepts app-relative paths. */
export function signInUrl(returnUrl: string | undefined): string {
  const params = new URLSearchParams({ returnUrl: returnUrl ?? "/" });
  return `/api/auth/login?${params.toString()}`;
}
