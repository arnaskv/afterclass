import { queryOptions } from "@tanstack/react-query";

import {
  getCurrentUser,
  getGetCurrentUserQueryKey,
} from "@/shared/api/generated/endpoints/auth/auth";
import { unwrap } from "@/shared/api/unwrap";

/** The signed-in user. Rejects with a 401 ApiError when there is no session. */
export const currentUserQueryOptions = () =>
  queryOptions({
    queryKey: getGetCurrentUserQueryKey(),
    queryFn: async ({ signal }) => unwrap(await getCurrentUser({ signal })),
    staleTime: 5 * 60_000,
  });
