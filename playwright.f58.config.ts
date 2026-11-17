import { defineConfig } from "@playwright/test";
process.env.GAME_PROOF_OUT ??= 'backend/proof-f58/regression-artifacts';
process.env.ROOM_PROOF_OUT ??= 'backend/proof-f58/room-regression';
process.env.LETTER_PROOF_OUT ??= 'backend/proof-f58/letter-regression';
export default defineConfig({
  testDir: "tests/e2e",
  testMatch: /cinematic-(letter-experience|finale|player-room)\.spec\.ts/,
  timeout: 90000,
  workers: 1,
  outputDir: "backend/proof-f58/regression",
  reporter: [
    ["list"],
    ["json", { outputFile: "backend/proof-f58/regression.json" }],
  ],
  use: {
    baseURL: "http://127.0.0.1:4198",
    headless: true,
    launchOptions: { args: ["--use-angle=d3d11"] },
  },
  webServer: {
    command: "npx vite preview --config vite.f58.config.ts",
    url: "http://127.0.0.1:4198",
    reuseExistingServer: true,
  },
});
