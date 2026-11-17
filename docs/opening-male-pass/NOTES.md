# Opening voice and camera — 2026-11-17

Scope: opening only; classroom, letter, save schema and story interactions were not edited in this pass.

Changes:
- Seven new local male Vietnamese narrator clips (Nam Minh, -3% rate). Existing spoken text retained. AION and later dialogue remain subtitle-only.
- Opening extended from 53 to 60 seconds; captions, architectural cues and ambience follow the new schedule. Every clip has at least 0.4 seconds of timing margin.
- Continuous Hermite camera path replaces per-segment smoothstep stops; gentler atrium route and intentional final settle. Exterior remains visible until the camera enters the atrium.
- New audio URLs prevent old voice cache reuse. Prior catalog, narration timing and manifest are backed up in this folder.

Runtime files: src/future/OpeningCamera.ts, FutureWorld.ts, direction.ts; opening cue times in src/chapter/ChapterGame.tsx; src/speech/catalog.json; public/voice/vi-namminh. Build script: scripts/generate-opening-male.py. Manifest: docs/opening-readability-proof/voice-manifest.json.

Actual verification:
- PASS: node --max-old-space-size=384 --v8-pool-size=1 node_modules/typescript/bin/tsc --noEmit
- PASS: node --max-old-space-size=256 --v8-pool-size=1 node_modules/eslint/bin/eslint.js src tests
- PASS: node node_modules/vitest/vitest.mjs run tests/opening-camera.test.ts tests/speech.test.ts --maxWorkers=1 (7 tests: camera velocity continuity, clip timing, audio hashes, pause/mute and narration policy).
- PASS: node --max-old-space-size=384 --v8-pool-size=1 node_modules/vite/bin/vite.js build --outDir dist-opening-review. Existing large bundle warning remains; CinematicGame 779.96 kB.
- BLOCKED: runtime smoke via scripts/smoke-opening-male.mjs. First Chromium attempt crashed before page creation. Low-memory retry also produced no evidence before tool host transport failure. No runtime screenshots, completed E2E or video claimed. System had roughly 1 GB commit space free; codex-computer-use process private memory was approximately 43.9 GB. Unrelated user processes were not terminated.
- Initial unrestricted typecheck/lint crashed from memory pressure; the bounded runs above passed. First test run had a test lookup error (raw versus normalized speech hash); corrected to use the same normalization as runtime, then all 7 passed.
- Full game regression and physical mobile playtest were not run. Voice suitability and visual smoothness still require human review.

Preview: http://127.0.0.1:4219/ (dist-opening-review). This preserves other preview origins and their saves. No push or deployment.
