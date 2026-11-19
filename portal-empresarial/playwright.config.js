import { defineConfig } from "@playwright/test";
const port = Number(process.env.CONECTA_TEST_PORT || 4173);
const baseURL = "http://127.0.0.1:" + port;
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.js",
  use: {
    baseURL,
    viewport: { width: 1366, height: 768 },
  },
  webServer: {
    command:
      "npm run preview -- --host 127.0.0.1 --port " + port + " --strictPort",
    url: baseURL,
    reuseExistingServer: false,
  },
});
