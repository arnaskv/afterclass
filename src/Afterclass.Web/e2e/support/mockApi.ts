import type { Page, Route } from "@playwright/test";

export interface MockApiOptions {
  signedIn: boolean;
}

interface Profile {
  displayName: string;
  email: string;
  version: number;
}

/** Stubs the API at the browser's network boundary with an in-memory profile. */
export async function mockApi(page: Page, { signedIn }: MockApiOptions) {
  const profile: Profile = {
    displayName: "Ona Savininkė",
    email: "owner@afterclass.local",
    version: 1,
  };
  const savedNames: string[] = [];

  const json = (route: Route, status: number, body: unknown) =>
    route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(body),
    });

  // Match on the pathname: a "**/api/**" glob would also catch Vite modules such as /src/shared/api/....
  await page.route(
    (url) => url.pathname.startsWith("/api/"),
    async (route) => {
      const request = route.request();
      const path = new URL(request.url()).pathname;

      if (path === "/api/auth/antiforgery") {
        return json(route, 200, { requestToken: "e2e-token" });
      }
      if (!signedIn) {
        return json(route, 401, { status: 401, title: "Unauthorized" });
      }
      if (path === "/api/auth/me") {
        return json(route, 200, {
          subject: "user-1",
          name: "Ona Savininkė",
          email: profile.email,
        });
      }
      if (path === "/api/profile" && request.method() === "GET") {
        return json(route, 200, profile);
      }
      if (path === "/api/profile" && request.method() === "PUT") {
        if (request.headers()["x-xsrf-token"] !== "e2e-token") {
          return json(route, 400, {
            status: 400,
            type: "https://afterclass.app/problems/antiforgery",
          });
        }
        const body = request.postDataJSON() as {
          displayName: string;
          version: number;
        };
        profile.displayName = body.displayName;
        profile.version += 1;
        savedNames.push(body.displayName);
        return json(route, 200, profile);
      }
      return json(route, 404, { status: 404, title: "Not Found" });
    },
  );

  return { savedNames };
}
