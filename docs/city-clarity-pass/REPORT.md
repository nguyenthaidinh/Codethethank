# City opening performance — 2026-11-17

## Scope and implementation

- `src/future/VisibleCityBatch.ts`: conservative per-building sphere/frustum tests, packing visible instances into one draw per original model mesh/material. Original geometry and transforms remain intact. Upload instance matrices only when visibility membership changes; include edge-intersecting buildings and release instance resources on disposal.
- `src/future/FutureWorld.ts`: uses visible city batches, precompiles opaque and fade variants for the exterior, and retains opaque depth rejection until the entrance dissolve actually begins. Skyline GLB surfaces use Lambert lighting with their existing colour maps and geometry; the AION landmark and atrium retain their reflective materials. This trades backdrop specular detail for cheaper lighting, not model silhouette or image resolution.
- No camera, narration, resolution-floor or environment-layout edits. All 62 protected camera/story/classroom/voice/letter/atrium source hashes match `scope-check.json`.

## Browser results

Chromium headless, 1280×720, Intel Iris Xe / ANGLE D3D11; sequential runs on the shared host. The city measurement covers 3–15 seconds; the partial entrance measurement covers 15–20 seconds. No screenshots during these windows. The optional initial city capture occurs before measurement, outside the measured 3–15-second window.

| Measure | Before | Final |
|---|---:|---:|
| City mean frame time | 23.02 ms | 18.78 ms |
| City median | 16.7 ms | 16.7 ms |
| City p95 | 33.4 ms | 33.4 ms |
| City frames >50 ms | 3 | 1 |
| Partial entrance mean | 20.48 ms | 17.78 ms |
| Render buffer at ~20 s | 1088×612 | 1088×612 |
| Draw calls at ~20 s | 56 | 41 |
| Triangles at ~20 s | 217,488 | 146,660 |

Mean city frame time improved about 18%, at unchanged resolution. Slow frames remain and p95 did not improve; this is not a locked 60 FPS claim. The intermediate culling-only result is retained as `culling-only.json`; the final lighting pass adds further improvement. `final-city.png` was inspected and retains the skyline shapes, detail and AION composition.

## Executed validation

- PASS: `node node_modules/vitest/vitest.mjs run tests/visible-city-batch.test.ts tests/live-science-display.test.ts tests/opening-render-budget.test.ts tests/opening-camera.test.ts tests/speech.test.ts --maxWorkers=1` — 18 tests, including conservative edge culling, transform preservation, no unchanged-buffer uploads and reappearance after culling.
- PASS: `node node_modules/typescript/bin/tsc --noEmit`.
- PASS: `node node_modules/eslint/bin/eslint.js src/future tests/visible-city-batch.test.ts`; final skyline material pass checked again with `src/future`.
- PASS: `node node_modules/vite/bin/vite.js build --outDir dist-city-review`. FutureWorld 76.55 kB. Existing large CinematicGame chunk warning remains.
- Browser measurement: `PROFILE_OUT=docs/city-clarity-pass`, `PROFILE_END=20`; run `node scripts/profile-opening.mjs http://127.0.0.1:4222/ before`, then `http://127.0.0.1:4223/ final` (with `PROFILE_CITY_CAPTURE=1` on final). Raw measurements and errors are in `before.json` and `final.json`. Full-opening/mobile assertions are recorded in `regression.json` after completion.
- No physical mobile testing, later-chapter full regression, new recording, push or deploy.

Preview: http://127.0.0.1:4223/ — choose **Bắt đầu hành trình**.
