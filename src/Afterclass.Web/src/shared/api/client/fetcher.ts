import { ApiError } from "./apiError";

export { ApiError } from "./apiError";

/** Orval types hook errors as `ErrorType<Problem>`; every failed request rejects with an {@link ApiError}. */
export type ErrorType<TProblem> = ApiError<TProblem>;

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const ANTIFORGERY_HEADER = "X-XSRF-TOKEN";
const ANTIFORGERY_PROBLEM_TYPE = "https://afterclass.app/problems/antiforgery";

// In memory only, never persisted. A full page load (sign-in, sign-out) starts without a token.
let antiforgeryToken: string | undefined;

export async function getAntiforgeryToken(
  signal?: AbortSignal | null,
): Promise<string> {
  if (antiforgeryToken) {
    return antiforgeryToken;
  }

  const response = await fetch("/api/auth/antiforgery", {
    credentials: "same-origin",
    headers: { Accept: "application/json" },
    signal: signal ?? null,
  });
  if (!response.ok) {
    throw new ApiError(response.status, await readBody(response));
  }

  const { requestToken } = (await response.json()) as { requestToken: string };
  antiforgeryToken = requestToken;
  return requestToken;
}

/**
 * The single fetch adapter behind every generated client. It sends the session cookie, attaches the
 * antiforgery token to unsafe requests, turns failures into {@link ApiError}, and returns the
 * `{ data, status, headers }` shape Orval's fetch client expects.
 */
export async function apiFetch<T>(
  url: string,
  init: RequestInit = {},
): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const isUnsafe = !SAFE_METHODS.has(method);

  const send = async (token: string | undefined) => {
    const headers = new Headers(init.headers);
    headers.set("Accept", "application/json");
    if (init.body !== undefined && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    if (token) {
      headers.set(ANTIFORGERY_HEADER, token);
    }

    return fetch(url, { ...init, method, headers, credentials: "same-origin" });
  };

  let response = await send(
    isUnsafe ? await getAntiforgeryToken(init.signal) : undefined,
  );
  let body = await readBody(response);

  // Tokens are bound to the session, so a stale one gets a single transparent retry.
  if (isUnsafe && isAntiforgeryRejection(response, body)) {
    antiforgeryToken = undefined;
    response = await send(await getAntiforgeryToken(init.signal));
    body = await readBody(response);
  }

  if (!response.ok) {
    throw new ApiError(response.status, body);
  }

  return {
    data: body,
    status: response.status,
    headers: response.headers,
  } as T;
}

async function readBody(response: Response): Promise<unknown> {
  if (
    response.status === 204 ||
    response.headers.get("Content-Length") === "0"
  ) {
    return undefined;
  }

  const text = await response.text();
  if (!text) {
    return undefined;
  }

  const contentType = response.headers.get("Content-Type") ?? "";
  return contentType.includes("json") ? (JSON.parse(text) as unknown) : text;
}

function isAntiforgeryRejection(response: Response, body: unknown): boolean {
  return (
    response.status === 400 &&
    typeof body === "object" &&
    body !== null &&
    (body as { type?: unknown }).type === ANTIFORGERY_PROBLEM_TYPE
  );
}
