# Opening hitch prevention — 2026-11-17

## Scope and changes

- `src/future/FutureWorld.ts`: renders the city, entrance fade, interior and terminal into the hidden canvas while readiness is false, then restores the first shot. Geometry uploads and vertex-array setup now happen during preparation, in addition to shader compilation. A non-blocking GPU fence is polled with a bounded timeout before exposing playback; disposal/context loss remain supported.
- Actual canvas size changes are skipped when dimensions already match. Redundant pixel-ratio assignments no longer recreate the drawing buffer.
- `src/future/OpeningRenderBudget.ts`: supports locking the drawing-buffer scale through the opening. Desktop hardware starts at 1.0, portrait at 0.9; the existing 1920-pixel drawing-width cap and software-renderer limits remain. Interactive adaptation resumes afterwards. The lock clears stale timing samples, so they cannot immediately trigger a post-cinematic resize.
- `src/chapter/ChapterGame.tsx`: only the opening narrator's start is gated on renderer readiness. This prevents preparation from consuming the first spoken line behind an unprepared scene. Same clips, voice, script and timeline.
- All 62 protected camera/story/classroom/voice/letter/atrium files match `scope-check.json`. No classroom or letter edits. Warm-up draws dispatch no gameplay events and write no save/checkpoint state.

Tradeoff: a short preparation step occurs before playback; locked resolution prioritizes a stable, sharp cinematic over dynamic resolution on overloaded hardware. It cannot eliminate stalls caused by unrelated machine/GPU load. A real viewport resize still requires resizing the buffer.

## Measurements and their limit

Chromium headless, Intel Iris Xe / ANGLE D3D11, 1280×720. In this session **the old build also ran near 60 FPS**, so the reported intermittent hitch was not reproduced under the current machine load. Earlier session profiles recorded `setSize` costs and mid-cinematic resolution changes; the new lock prevents that path even under the unit test's sustained slow-frame input.

Both current before/after runs measured city 3–15 s and entrance 15–25 s at approximately 16.67 ms mean frame time, with zero frames above 50 ms. The final run recorded no GPU buffer allocation, program linking, live texture upload or canvas resize during the timed window. These results validate the protected playback path, **not a claimed speedup over today's already-smooth baseline**.

Raw evidence: `before.json`, `final.json`, `final-city.png`, `final.png`; full opening/mobile outcome: `regression.json`.

## Validation

- PASS: `node node_modules/vitest/vitest.mjs run tests/visible-city-batch.test.ts tests/live-science-display.test.ts tests/opening-render-budget.test.ts tests/opening-camera.test.ts tests/speech.test.ts --maxWorkers=1` — 19 tests.
- PASS: `node node_modules/typescript/bin/tsc --noEmit`. Initial typecheck exposed the WebGL1/WebGL2 union at the fence API; a runtime feature guard fixed it before the final build.
- PASS: `node node_modules/eslint/bin/eslint.js src/future src/chapter/ChapterGame.tsx tests/opening-render-budget.test.ts`.
- PASS: `node node_modules/vite/bin/vite.js build --outDir dist-opening-hitch-review`. Existing large-chunk warning remains; FutureWorld 77.62 kB.
- Browser command: `PROFILE_OUT=docs/opening-hitch-pass`, `PROFILE_END=25`, `node scripts/profile-opening.mjs http://127.0.0.1:4223/ before`; final uses `http://127.0.0.1:4224/ final` and `PROFILE_CITY_CAPTURE=1`. The harness checks full opening to control, seven completed male clips, console/page errors, touch/reduced-motion preference and disabled-WebGL fallback/skip.
- No physical mobile or long-session stress certification; no later-chapter full regression or new video. No push/deploy.

Preview: http://127.0.0.1:4224/ — choose **Bắt đầu hành trình**.
