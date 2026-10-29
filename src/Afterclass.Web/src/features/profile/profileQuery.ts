import { queryOptions } from "@tanstack/react-query";

import {
  getGetProfileQueryKey,
  getProfile,
} from "@/shared/api/generated/endpoints/profile/profile";
import { unwrap } from "@/shared/api/unwrap";

export const profileQueryOptions = () =>
  queryOptions({
    queryKey: getGetProfileQueryKey(),
    queryFn: async ({ signal }) => unwrap(await getProfile({ signal })),
  });
