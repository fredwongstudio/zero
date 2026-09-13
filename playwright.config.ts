import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:3101",
    channel: "chrome",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npx next dev --hostname 127.0.0.1 --port 3101",
    url: "http://127.0.0.1:3101",
    reuseExistingServer: false,
    env: {
      ZERO_TEST_BUILD: "true",
      ZERO_ENABLE_PREVIEW: "true",
      ZERO_PUBLIC_AGENT: "false",
      ELEVENLABS_API_KEY: "test-placeholder-not-a-real-key",
      NEXT_PUBLIC_ELEVENLABS_AGENT_ID: "agent_test_placeholder",
    },
  },
});
