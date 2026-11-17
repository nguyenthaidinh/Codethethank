# Entrance blend — 2026-11-17

Changed only the exterior-opacity function in `src/future/OpeningCamera.ts` and its tests. Camera position/target keyframes, narration, resolution, classroom and letter code were not edited.

The entrance reveal now starts at camera z=84 instead of 72, finishing at z=30 as before. A quintic smoothstep gives zero first and second derivatives at both boundaries, softening the start/end of the dissolve while preserving the existing camera choreography. This is a transition-timing refinement, not a claimed GPU/FPS improvement.

PASS: TypeScript `tsc --noEmit`; ESLint on changed source/test; Vite build to `dist-entrance-review`; 11 tests in `opening-camera.test.ts` and `speech.test.ts`. Existing bundle-size warning remains.

Runtime check: `PROFILE_OUT=docs/entrance-blend-pass PROFILE_END=21 node scripts/profile-opening.mjs http://127.0.0.1:4225/ entrance` (environment variables set via PowerShell). Evidence: `entrance.json`, `entrance.png`. This checks through the active entrance blend; no full-game regression or physical-mobile claim for this small pass.

Preview: http://127.0.0.1:4225/ — Bắt đầu hành trình. No push/deploy.
