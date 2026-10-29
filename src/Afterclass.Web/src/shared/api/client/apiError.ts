export interface ProblemDetailsLike {
  type?: string | null;
  title?: string | null;
  status?: number | null;
  detail?: string | null;
  errors?: Record<string, string[]>;
}

/** A non-success HTTP response. `problem` holds the parsed Problem Details body when the API sent one. */
export class ApiError<TProblem = ProblemDetailsLike> extends Error {
  readonly status: number;
  readonly problem: TProblem | undefined;

  constructor(status: number, body: unknown) {
    const problem = isProblemDetails(body) ? (body as TProblem) : undefined;
    super(
      isProblemDetails(body) && body.title
        ? body.title
        : `Request failed with status ${status}`,
    );
    this.name = "ApiError";
    this.status = status;
    this.problem = problem;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function hasStatus(error: unknown, status: number): boolean {
  return isApiError(error) && error.status === status;
}

/** Field errors from an ASP.NET Core validation problem, keyed by lower-camel-case field name. */
export function getFieldErrors(error: unknown): Record<string, string[]> {
  if (!isApiError(error) || error.status !== 400) {
    return {};
  }

  const errors =
    (error.problem as ProblemDetailsLike | undefined)?.errors ?? {};
  return Object.fromEntries(
    Object.entries(errors).map(([field, messages]) => [
      field.charAt(0).toLowerCase() + field.slice(1),
      messages,
    ]),
  );
}

function isProblemDetails(body: unknown): body is ProblemDetailsLike {
  return (
    typeof body === "object" &&
    body !== null &&
    ("title" in body || "status" in body || "type" in body)
  );
}
