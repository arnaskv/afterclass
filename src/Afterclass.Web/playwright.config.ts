import { defineConfig, devices } from "@playwright/test";

const port = 5173;

/**
 * Mocked browser journeys: the real SPA with the API stubbed at the network boundary (see e2e/support).
 * Real-API smoke tests against an isolated AppHost will live in a separate project later.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "mocked-chromium",
      testMatch: /.*\.mocked\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        // Lets environments with a preinstalled Chromium skip `playwright install`.
        launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
          ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
          : {},
      },
    },
    {
      name: "mocked-mobile",
      testMatch: /.*\.mocked\.spec\.ts/,
      use: {
        ...devices["Pixel 7"],
        launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
          ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
          : {},
      },
    },
  ],
  webServer: {
    command: `npm run dev -- --port ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
    // Point the dev proxy at a closed port so no request can reach a real API by accident.
    env: { API_HTTP: "http://127.0.0.1:9" },
  },
});
