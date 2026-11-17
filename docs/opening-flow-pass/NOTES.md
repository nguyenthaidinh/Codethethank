# City → AION entrance camera pass — 2026-11-17

## Implemented scope

Only `src/future/OpeningCamera.ts` and `src/future/FutureWorld.ts` changed in runtime source.

- Re-authored the approach: descend before reaching the entrance, pass below glazing at z=47 and below the bridge at z=28, then rise gradually towards Nexus. Removed the previous rapid drop followed immediately by an upward camera tilt.
- Quintic Hermite interpolation shares velocity and acceleration at joins. Automated checks cover monotonic forward travel, doorway/bridge clearance, angular speed under 5 degrees/second through the entrance, and no intermediate camera stop.
- Camera follows the authored path directly during opening playback, avoiding the extra frame-dependent position/look-target lag. Interactive camera damping remains.
- Exterior shell previously disappeared in one frame and overlapped the interior Nexus. It now dissolves over the approach from z=72 to z=30, using independent exterior material instances so interior surfaces and lighting are unaffected. No new geometry or scene redesign.
- Prepare GPU programs and textures before opening readiness. Reuse transform scratch objects and update projection only when FOV changes.
- Narration, its 60-second schedule, audio bus, save contracts, classroom and letter source were not edited by this pass. All seven Nam Minh clips remain identical.

## Validation

- PASS: `node node_modules/typescript/bin/tsc --noEmit`
- PASS: `node node_modules/eslint/bin/eslint.js src tests`; after the shell fix, reran ESLint on the three changed source/test files.
- PASS: `node node_modules/vitest/vitest.mjs run tests/opening-camera.test.ts tests/speech.test.ts --maxWorkers=1` — 10 tests.
- PASS: `node node_modules/vite/bin/vite.js build --outDir dist-opening-flow-review`; FutureWorld 72.52 kB, existing CinematicGame large-chunk warning remains.
- Runtime command: `node scripts/smoke-opening-flow.mjs`. The current result is written to `runtime.json`; screenshots are `opening-15.png`, `opening-21.png`, `opening-25.png`, `opening-30.png`, `mobile-reduced.png`. The earlier pre-dissolve successful walkthrough is retained as `runtime-before-shell-fix.json`.
- Browser test checks the full opening to player control, seven completed male voice clips, no page errors, touch/reduced-motion startup and skip. Captured desktop frame timings include screenshot overhead and concurrent machine load; these are not a physical-device benchmark or a guaranteed frame rate.
- Final browser run PASS on desktop and mobile emulation. All seven clips completed, no page errors. Desktop RAF median 16.7 ms, p95 133.3 ms, maximum 300 ms across 1,495 samples. Remaining slow frames mean this pass establishes smoother camera choreography, not consistently high rendering performance.
- No full-game regression or physical mobile playtest in this scoped pass. No claim of visual approval.

## Scope evidence and preview

`protected-hashes.json` records 58 classroom, actor, speech, voice-asset and Finale files before work. A comparison found only concurrent changes to `src/finale/public-sharing.css` and `src/finale/public-sharing.ts`; this pass did not edit or revert them. Classroom and narrator hashes match.

Preview: http://127.0.0.1:4220/ — choose **Bắt đầu hành trình**. Other preview builds were left intact. No push or deployment.
