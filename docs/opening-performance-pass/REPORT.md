# Opening performance pass — 2026-11-17

Runtime changes are limited to `src/future/FutureWorld.ts` and the new `src/future/OpeningRenderBudget.ts`. Camera path, timing, voice, classroom, cast, letter and save source were not changed: all 60 protected hashes match (`scope-check.json`).

## Changes

- Split city instances into spatial batches, allowing frustum culling instead of submitting a bounding volume spanning both sides of the whole city.
- Keep city buildings opaque for early depth rejection. Only the headquarters exterior shell needs the existing entrance dissolve. Stop rendering the occluded skyline and updating its traffic after entering below the glazing.
- Adapt the 3D drawing buffer to sustained load throughout the scene, rather than sampling only the first 80 frames. Resolution is bounded, isolated stalls are ignored, and quality recovery waits until cinematic playback ends to avoid repeated buffer reallocations. DOM subtitles and UI remain full resolution.
- Disable mipmap regeneration for live display textures; defer invisible chart updates during the city fly-through.

Tradeoff: on this GPU, drawing-buffer scale reached 0.6 (768×432 at a 1280×720 viewport). This reduces 3D detail under load; the camera composition, authored geometry and UI resolution remain unchanged.

## Measured comparison

Chromium headless, 1280×720, Intel Iris Xe via ANGLE/D3D11. Same camera and male narration. CPU sampling interval 2 ms. Screenshots were taken after the measurement window, not during it. Sequential runs on a shared machine are indicative, not a controlled device certification.

| Segment | Mean frame ms before → final | p95 ms before → final | Frames >50 ms before → final |
|---|---:|---:|---:|
| City, 3–15 s | 46.22 → 19.77 | 99.9 → 33.4 | 74 → 4 |
| Entrance, 15–25 s | 35.67 → 20.39 | 83.3 → 50.0 | 50 → 16 |
| Atrium, 25–35 s | 29.75 → 22.33 | 116.7 → 66.6 | 46 → 34 |

The entrance mean frame interval improved approximately 43%. Slow frames remain, especially inside the atrium. CPU profiles show predominantly idle main-thread samples, supporting GPU/rendering load as a primary bottleneck; this is an inference, not a direct GPU timer measurement.

Raw evidence: `before.json`, `after.json` (intermediate), `final.json`; actual browser screenshots: `before.png`, `after.png`, `final.png`. Final resolution changed four times, all downward during the cinematic, versus six changes in the intermediate pass.

## Executed checks

- PASS: `node node_modules/typescript/bin/tsc --noEmit`
- PASS: `node node_modules/eslint/bin/eslint.js src/future tests/opening-render-budget.test.ts`
- PASS: `node node_modules/vitest/vitest.mjs run tests/opening-camera.test.ts tests/opening-render-budget.test.ts tests/speech.test.ts --maxWorkers=1` — 14 tests.
- PASS: `node node_modules/vite/bin/vite.js build --outDir dist-opening-perf-review`. FutureWorld 73.54 kB; pre-existing large CinematicGame chunk warning remains.
- Profiling commands: `node scripts/profile-opening.mjs http://127.0.0.1:4220/ before`, then `http://127.0.0.1:4221/ after` and `final`. Final desktop measurement and assertions for reaching player control, seven started/completed male clips and no page errors passed. The combined final command later timed out because its Canvas test incorrectly expected a `ready` field that fallback telemetry does not expose. This was a test harness error; it was corrected to check the Canvas renderer identity.
- PASS corrected mobile check: `node scripts/smoke-opening-perf-mobile.mjs`. Touch/reduced-motion preference with WebGL and WebGL disabled both reach player control via skip, without page errors. Evidence: `mobile.json`.
- Physical mobile, long sessions and full later-chapter regression were not run. No camera, lighting or story redesign; no deployment/push.

Preview: http://127.0.0.1:4221/ — choose **Bắt đầu hành trình**.
