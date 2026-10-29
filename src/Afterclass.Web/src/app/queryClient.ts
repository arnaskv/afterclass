import { QueryClient } from "@tanstack/react-query";

import { isApiError } from "@/shared/api/client/apiError";

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // Client errors (401, 403, 404, validation) won't fix themselves by retrying.
        retry: (failureCount, error) => {
          if (isApiError(error) && error.status >= 400 && error.status < 500) {
            return false;
          }
          return failureCount < 2;
        },
      },
    },
  });
}
