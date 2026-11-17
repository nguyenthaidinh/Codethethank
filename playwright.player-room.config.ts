import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/e2e",
  testMatch: /cinematic-(player-room|finale|fullgame)\.spec\.ts/,
  timeout: 90000,
  workers: 1,
  outputDir: "docs/finale-v5-1-proof/test-results",
  reporter: [
    ["list"],
    [
      "json",
      {
        outputFile: `docs/finale-v5-1-proof/${process.env.ROOM_RUN ?? "results"}.json`,
      },
    ],
  ],
  use: {
    baseURL: process.env.ROOM_BASELINE
      ? "http://127.0.0.1:4189"
      : "http://127.0.0.1:4188",
    headless: true,
    launchOptions: { args: ["--use-angle=d3d11"] },
  },
});
