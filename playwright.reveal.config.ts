import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/e2e",
  testMatch:
    /cinematic-(reveal|finale|letter-experience|player-room|fullgame)\.spec\.ts/,
  timeout: 90000,
  workers: 1,
  outputDir: "docs/finale-f5-4-proof/test-results",
  reporter: [
    ["list"],
    [
      "json",
      {
        outputFile: `docs/finale-f5-4-proof/${process.env.REVEAL_RUN ?? "results"}.json`,
      },
    ],
  ],
  use: {
    baseURL: "http://127.0.0.1:4194",
    headless: true,
    launchOptions: { args: ["--use-angle=d3d11"] },
  },
  webServer: {
    command:
      "npx vite preview --outDir finale-f5-4-dist --host 127.0.0.1 --port 4194",
    url: "http://127.0.0.1:4194",
    reuseExistingServer: true,
  },
});
