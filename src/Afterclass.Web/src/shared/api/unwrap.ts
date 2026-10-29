/**
 * Returns the body of a successful generated-client response. Error statuses never reach here
 * because the fetch adapter throws, so this narrows Orval's `{ data, status }` union to its 2xx members.
 */
export function unwrap<TResponse extends { status: number; data: unknown }>(
  response: TResponse,
): Extract<TResponse, { status: 200 | 201 | 202 | 204 }>["data"] {
  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Unexpected status ${response.status} reached unwrap`);
  }
  return response.data as Extract<
    TResponse,
    { status: 200 | 201 | 202 | 204 }
  >["data"];
}
