# AION atrium: rendering cost and clarity — 2026-11-17

## Changes

- `src/future/LiveScienceDisplay.ts`: moving research curves now use a GPU shader and a shared time uniform. The 1024×512 background and text remain a static full-resolution texture. Curves animate continuously with derivative-based edge smoothing; the old canvas was redrawn/uploaded five times per second.
- `src/future/FutureWorld.ts`: integrates the live-display shader, raises the hardware-rendering minimum scale from 0.60 to 0.85, starts portrait hardware rendering at 0.90, and raises the drawing-width cap from 1440 to 1920 pixels. Software WebGL has a separate 0.65 floor. UI/subtitles retain CSS resolution.
- `src/future/GrandArchitecture.ts`: thin architectural glass uses Lambert lighting instead of another PBR/IBL layer over walls and bridges. Glass is a lighter approximation; its tint, opacity, geometry and light response remain. Reflective metal, floor textures and Nexus materials retain their existing PBR path.
- Camera, narrative, voice, classroom, cast and letter source were not edited. All 60 protected hashes match (`scope-check.json`).

## Actual browser comparison

Chromium headless at 1280×720, Intel Iris Xe / ANGLE D3D11. Same cinematic, voice and measurement script; screenshots captured after the timed interval. Sequential shared-machine measurements, not a guarantee on other devices.

| Measure | Before | Final |
|---|---:|---:|
| Atrium 25–45 s: mean frame interval | 26.17 ms | 16.67 ms |
| Atrium p95 frame interval | 83.4 ms | 16.7 ms |
| Atrium frames over 50 ms | 91 | 0 |
| Entrance 15–25 s: mean frame interval | 22.42 ms | 17.57 ms |
| Repeated live-canvas uploads during timed run | 145 | 0 |
| Actual buffer at final sample | 1024×576 (0.80) | 1088×612 (0.85) |

The atrium sustained approximately 60 FPS in this measured window while using a sharper drawing buffer. City mean frame interval increased from 19.20 to 23.02 ms in these runs, consistent with the higher clarity floor; this pass prioritizes the requested atrium and avoids excessive resolution reduction. Individual causes cannot be isolated from this combined change and shared-machine measurement.

Evidence: `before.json`, `final.json`, `before.png`, `final.png`, `regression.json`. The old minimum was 0.60, but this particular baseline run ended at 0.80; do not describe the comparison as a doubling of pixels.

## Validation executed

- PASS: `node node_modules/typescript/bin/tsc --noEmit`.
- PASS: `node node_modules/eslint/bin/eslint.js src/future tests/live-science-display.test.ts`.
- PASS: `node node_modules/vitest/vitest.mjs run tests/live-science-display.test.ts tests/opening-render-budget.test.ts tests/opening-camera.test.ts tests/speech.test.ts --maxWorkers=1` — 16 tests.
- PASS: `node node_modules/vite/bin/vite.js build --outDir dist-atrium-review`. Existing large-chunk warning remains (CinematicGame 779.96 kB; FutureWorld 74.25 kB).
- PASS: with `PROFILE_OUT=docs/atrium-clarity-pass`, `PROFILE_END=45`, run `node scripts/profile-opening.mjs http://127.0.0.1:4221/ before` and `node scripts/profile-opening.mjs http://127.0.0.1:4222/ final`. Final run reaches player control, completes all seven male clips, reports no JS/console/shader errors, and passes touch with reduced-motion preference plus disabled-WebGL fallback/skip.
- Reviewed the final runtime screenshot. No new video, physical-device mobile test or full later-chapter regression in this scoped pass.

Preview: http://127.0.0.1:4222/ — **Bắt đầu hành trình**. No push/deploy.
