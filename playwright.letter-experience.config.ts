import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/e2e",
  testMatch: /cinematic-(letter-experience|finale|player-room)\.spec\.ts/,
  timeout: 90000,
  workers: 1,
  outputDir: "docs/finale-f5-3-proof/test-results",
  reporter: [
    ["list"],
    [
      "json",
      {
        outputFile: `docs/finale-f5-3-proof/${process.env.LETTER_RUN ?? "results"}.json`,
      },
    ],
  ],
  use: {
    baseURL: "http://127.0.0.1:4193",
    headless: true,
    launchOptions: { args: ["--use-angle=d3d11"] },
  },
  webServer: {
    command:
      "npx vite preview --outDir finale-f5-3-dist --host 127.0.0.1 --port 4193",
    url: "http://127.0.0.1:4193",
    reuseExistingServer: true,
  },
});
