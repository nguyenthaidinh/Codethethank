# THE UNWRITTEN LESSON — Main menu

Sprint 01 integration update: Start now enters Chapter 00 (`src/chapter/ChapterGame.tsx`); Continue supports both Chapter 00 and legacy S02–S03 checkpoints. `GameShell` is the only menu implementation file changed for this integration. The original implementation history below predates this change; see `docs/chapter-00-qa.md` for current QA.

Menu implementation, 16 November 2026. This module is intentionally isolated from the concurrent cinematic renderer/recording work.

## Run

```powershell
npm run dev -- --port 4187 --strictPort
npm run build -- --outDir menu-dist
npm run preview -- --port 4188 --outDir menu-dist --strictPort
```

Open `/` for the menu. Existing `?qa=1` and `?record=1` routes still enter the original cinematic gate, preserving the other workstream's test/recording flow. Build output is `menu-dist/`, not the other workstream's `dist/`.

## Architecture and changed files

- `src/menu/GameShell.tsx`: lazy gameplay loading, error boundary, transition and dependency injection.
- `MainMenu.tsx`, `MenuUI.tsx`, `menu.css`: logo, controls, modal focus/Escape, responsive layout, tokens, reduced motion, language availability and save state.
- `SceneBackground.tsx`: independently transformed city/room/desk/canopy/foreground planes; clouds, warm light, window lights, steam and dust. Complete original SVG fallback when artwork fails. Animations pause in hidden documents. Reduced motion stops environmental movement; Low removes particles/steam, camera drift and mouse parallax; Auto selects Low for narrow screens or low core counts.
- `MenuAudio.ts`: gesture-gated original synthesized ambient notes, wind/city noise and interaction cues. Suspends when hidden; closes on departure/unmount. No remote audio.
- `GameAudio.ts`: extends the existing AudioDirector to apply independent music/effects levels without changing AudioDirector itself.
- `preferences.ts`, `saveBridge.ts`: validated persistent preferences and existing V3 checkpoint decoding. Direct initial-state handoff works even when storage is blocked.
- `src/main.tsx`: mounts GameShell.
- `src/cinematic/CinematicGame.tsx`: only adds optional `initialSave`, `autoStart`, `createAudio` integration points, handles autoplay without blocking gameplay, and replaces the public old project name. No story, reducer, renderer or recording logic rewritten.
- `index.html`: official brand in title and description.
- `public/menu/`: three local WebP art planes, 667,348 bytes total. Originals in `menu-artifacts/sources/`.
- `tests/menu.test.ts`, `tests/menu-e2e/`, `playwright.menu*.config.ts`: isolated unit, integration and existing gameplay regression coverage.
- `scripts/inspect-menu.mjs`, `scripts/encode-menu-assets.mjs`: reproducible viewport captures and PNG→WebP format conversion preserving alpha.

## Honest integration boundaries

The active runtime in this repository is currently the S02–S03 proof-of-feel. New Game starts its existing `arrival` beat; Continue restores its real V3 checkpoint. This change does not invent or replace a separate S00 opening or expand the story. The menu's graphics selector governs the menu environment; the existing gameplay renderer retains its own adaptive quality. English stays disabled until a complete translation exists. Ambient notes are synthesized, not recorded acoustic piano. Targeted browser checks use Chromium; Safari/iOS and physical GPU/device performance have not been certified.

Existing progress is replaced only after the explicit in-menu restart confirmation. The menu reads the existing `project2011.cinematic.v3` key without renaming it. User settings use `unwritten.menu.preferences.v1`. No founder identity or reveal is present in the menu.

## Verification

Final results: lint PASS; TypeScript check + production build PASS; 10/10 unit tests PASS; 11/11 menu E2E tests PASS against the production preview (19.7 seconds); existing `cinematic-input.spec.ts` gameplay regression PASS (desktop drag, keyboard, subtitles, offline completion). All five captured viewports fit without horizontal or vertical page overflow. Chromium reported no page errors in the checked error-handling flows.

The first concurrent production test run had two 5-second launch assertion timeouts while another software-rendered 3D playthrough ran in parallel. Running the identical menu suite alone passed all 11 tests without changing assertions. Run browser/GPU suites sequentially on this host; this is not certification of performance on physical devices. Screenshots were visually reviewed after the final production build.

```powershell
npm run lint
npm test
npm run build -- --outDir menu-dist
$env:MENU_TEST_URL = 'http://127.0.0.1:4188'
npx playwright test --config playwright.menu.config.ts
npx playwright test --config playwright.menu-regression.config.ts
node scripts/inspect-menu.mjs
```

Viewport captures: `menu-artifacts/desktop.png` (1366×768), `wide.png` (1920×1080), `mobile.png` (390×844), `small.png` (360×640), `landscape.png` (844×390).

The production build reports the existing Three.js gameplay chunk above 500 KB. It remains lazy loaded; the menu does not download it until launch (except explicit QA/recording routes). No dependencies were added, no deployment or push performed, and no other chat was interrupted.

## Artwork provenance

Created with the built-in `image_gen` tool using the prompt set in `ASSET-PROMPTS.txt`. The supplied reference screenshot was not used as a background or copied into the game. The three generated planes are independent art assets, composited with code-generated framing, atmospheric layers and parallax; they are not a flattened UI screenshot. PNG sources are preserved; only format conversion was used for the final WebPs. No third-party stock/model assets or external font requests.

Final assets: `public/menu/city-sunset.webp`, `public/menu/desk-memory.webp`, `public/menu/canopy.webp`.
