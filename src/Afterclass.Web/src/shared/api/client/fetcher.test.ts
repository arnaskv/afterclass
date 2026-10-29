import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "@/mocks/server";

import { ApiError } from "./apiError";
import { apiFetch } from "./fetcher";

describe("apiFetch", () => {
  it("returns Orval's { data, status, headers } shape", async () => {
    server.use(http.get("/api/thing", () => HttpResponse.json({ id: 1 })));

    const result = await apiFetch<{ data: unknown; status: number }>(
      "/api/thing",
    );

    expect(result).toMatchObject({ data: { id: 1 }, status: 200 });
  });

  it("handles empty responses", async () => {
    server.use(
      http.delete("/api/thing", () => new HttpResponse(null, { status: 204 })),
    );

    const result = await apiFetch<{ data: unknown; status: number }>(
      "/api/thing",
      { method: "DELETE" },
    );

    expect(result).toMatchObject({ data: undefined, status: 204 });
  });

  it("throws ApiError with the Problem Details body", async () => {
    server.use(
      http.get("/api/thing", () =>
        HttpResponse.json(
          { status: 403, title: "Forbidden" },
          {
            status: 403,
            headers: { "Content-Type": "application/problem+json" },
          },
        ),
      ),
    );

    const error = await apiFetch("/api/thing").catch(
      (caught: unknown) => caught,
    );

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 403, message: "Forbidden" });
  });

  it("refreshes a rejected antiforgery token once and retries", async () => {
    let tokenRequests = 0;
    const sentTokens: (string | null)[] = [];
    server.use(
      http.get("/api/auth/antiforgery", () => {
        tokenRequests += 1;
        return HttpResponse.json({ requestToken: `token-${tokenRequests}` });
      }),
      http.post("/api/thing", ({ request }) => {
        const token = request.headers.get("X-XSRF-TOKEN");
        sentTokens.push(token);
        if (sentTokens.length === 1) {
          return HttpResponse.json(
            {
              status: 400,
              type: "https://afterclass.app/problems/antiforgery",
            },
            {
              status: 400,
              headers: { "Content-Type": "application/problem+json" },
            },
          );
        }
        return HttpResponse.json({ ok: true });
      }),
    );

    const result = await apiFetch<{ status: number }>("/api/thing", {
      method: "POST",
      body: "{}",
    });

    expect(result.status).toBe(200);
    expect(sentTokens).toHaveLength(2);
    expect(sentTokens[1]).not.toBe(sentTokens[0]);
  });
});
