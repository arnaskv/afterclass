import { http, HttpResponse } from "msw";

import type {
  CurrentUserResponse,
  ProfileResponse,
} from "@/shared/api/generated/model";

export const testUser: CurrentUserResponse = {
  subject: "user-1",
  name: "Ona Savininkė",
  email: "owner@afterclass.local",
};

export const testProfile: ProfileResponse = {
  displayName: "Ona Savininkė",
  email: "owner@afterclass.local",
  version: 1,
};

export const ANTIFORGERY_TOKEN = "test-antiforgery-token";

/** Default happy-path API. Tests override individual endpoints with server.use(...). */
export const handlers = [
  http.get("/api/auth/me", () => HttpResponse.json(testUser)),
  http.get("/api/auth/antiforgery", () =>
    HttpResponse.json({ requestToken: ANTIFORGERY_TOKEN }),
  ),
  http.get("/api/profile", () => HttpResponse.json(testProfile)),
  http.put("/api/profile", async ({ request }) => {
    const body = (await request.json()) as {
      displayName: string;
      version: number;
    };
    return HttpResponse.json({
      ...testProfile,
      displayName: body.displayName,
      version: body.version + 1,
    });
  }),
];
