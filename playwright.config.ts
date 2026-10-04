import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3200);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    locale: "fr-FR",
    trace: "retain-on-failure",
    launchOptions: {
      // Use a preinstalled Chromium when provided (e.g. sandboxed environments)
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
      args: process.env.PLAYWRIGHT_CHROMIUM_PATH ? ["--no-proxy-server"] : [],
    },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], locale: "fr-FR" } },
    { name: "mobile", use: { ...devices["Pixel 7"], locale: "fr-FR" } },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: process.env.E2E_SKIP_BUILD ? `npx next start -p ${PORT}` : `npm run build && npx next start -p ${PORT}`,
        url: baseURL,
        timeout: 240_000,
        reuseExistingServer: !process.env.CI,
      },
});
