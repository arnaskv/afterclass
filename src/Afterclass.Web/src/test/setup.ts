import "@testing-library/jest-dom/vitest";
import "@/shared/i18n";

import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";

import { server } from "@/mocks/server";

// jsdom has no origin-relative fetch; resolve app-relative API paths like the browser would.
const originalFetch = globalThis.fetch;
globalThis.fetch = (input, init) =>
  originalFetch(
    typeof input === "string" && input.startsWith("/")
      ? new URL(input, "http://localhost")
      : input,
    init,
  );

beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());
