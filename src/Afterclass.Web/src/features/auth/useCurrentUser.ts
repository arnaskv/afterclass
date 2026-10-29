import { useSuspenseQuery } from "@tanstack/react-query";

import { currentUserQueryOptions } from "./currentUser";

/** Only for routes under the authenticated layout, which has already loaded the user. */
export function useCurrentUser() {
  return useSuspenseQuery(currentUserQueryOptions()).data;
}
