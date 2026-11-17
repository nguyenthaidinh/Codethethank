# 2045 → 2046 — AION cinematic arrival

The existing closing cover/date/opening sequence is preserved. Under the 2046 title, a wide camera is positioned before the cover opens. One continuous curved dolly reveals the room and data loom, then settles toward the desk and old notebook. Camera position, focus and field of view match exactly at `world` → `record`, eliminating an extra reframe at the interaction handoff.

Architectural light appears first, followed by the core/status lights and finally the desk bounce. The window view develops from a dusk tint to its existing sunset color. The instanced loom opens from a compact structure into its normal layered form. Its rotation uses accumulated render time so phase changes no longer reset its angle. No extra meshes, draw passes, realtime shadows, postprocessing or image downloads were introduced.

The large research heading is delayed until the latter part of the shot and fades in. A separate portrait path stays inside the glazing. Reduced motion uses a stationary, fully lit camera view. Background staff are relocated beside the compute bays in 2046 to remove an observed overlap with the loom; their original positions are restored for other eras and the Finale environment.

## Scope

- `src/ripple/FutureArrival.ts`: shared light/activation timing and continuous camera path.
- `src/ripple/FutureCinematography.ts`: future-only light integration.
- `src/ripple/FutureStudio2046.ts`: window/light/loom activation and continuous rotation.
- `src/ripple/RippleWorld.ts`: integrates the arrival camera and lighting only in the 2046 workspace; adjusts 2046 background staff placement.
- `src/ripple/FutureResearchHUD.tsx`, `src/ripple/RippleControls.tsx`, `src/ripple/ripple.css`: delayed, gently appearing heading.
- `tests/future-arrival.test.ts`, `scripts/review-future-arrival.mjs`: targeted validation and actual browser evidence.

No edits to classroom 2026 sources, the letter, story dialogue, save schema, phase durations, chair motif, voice or audio modules. No server was started or restarted; the existing dev server at port 4198 was reused.

## Validation

- Typecheck PASS.
- Scoped lint PASS: `node node_modules/eslint/bin/eslint.js src/ripple tests/future-arrival.test.ts`.
- Unit PASS, 21 tests: `node node_modules/vitest/vitest.mjs run tests/ripple.test.ts tests/ripple-passage.test.ts tests/future-chair.test.ts tests/future-arrival.test.ts`.
- Build PASS: `npm run build`. The existing JSON import-attribute and large-chunk warnings remain outside this scoped change.
- Browser PASS: `node scripts/review-future-arrival.mjs`. Valid saved 2045 milestone → 2046 reveal → record button; moving camera; continuous final framing; no premature founder music; no page errors on desktop. Portrait reduced-motion camera remains stationary across the interaction handoff. Actual state snapshots are in `desktop.json` and `mobile.json`.

The first visual review found background staff intersecting the data structure. Their 2046 positions were corrected and the browser/build checks repeated. Screenshots: `opening.png`, `core.png`, `desk.png`, `mobile-reduced.png`. `before.png` is the prior task's actual runtime capture from `docs/ripple-time-pass/aion-introduction.png`. `arrival-muted.webm` records the full browser view including the title, cover and HTML subtitles; it is muted visual evidence, not an audio recording.

No full-game run, physical-device measurement or claim of final art approval. Draw-call observations are scene samples, not a device FPS benchmark. No deploy or push.
