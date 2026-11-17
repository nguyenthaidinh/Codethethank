# AION 2046 — Chapter 03 art pass

Scope: the later 2046 research workspace in The Ripple. The opening, 2026 classroom, letter UI, dialogue, chapter reducer and checkpoint validation were preserved.

## Runtime changes

- `src/ripple/FutureStudio2046.ts`: window architecture, distant skyline, architectural light loops, compute banks, an animated instanced data loom, desk, task chair and planters. Static geometry is merged by material; resources and asynchronous texture completion have disposal guards.
- `src/ripple/FutureResearchHUD.tsx`: restrained research identity, record interaction, founder reveal title and memory controls. Existing reducer actions and memory button accessibility labels are retained. The founder title appears only after the existing reveal gate.
- `src/ripple/RippleWorld.ts`: enables the new environment only in the 2046 Ripple scene. Adds desktop/portrait establishing shots and reuses the existing detailed actor factory. Founder clothing uses cloned materials. The chair coordinates and audio/cinematic cue timings remain unchanged. The existing Finale environment is retained once Finale state is active.
- `src/ripple/RippleControls.tsx`, `src/ripple/ripple.css`: integrate and style the new controls without changing gameplay prerequisites.

## Asset source

`public/menu/city-sunset.webp` was already in the project and is reused as the distant view outside the windows. No new image was generated or downloaded for this pass. This is a background layer inside the rendered room; the desk, architecture, characters, moving loom, camera and interactions remain runtime geometry. The existing asset's license/provenance was not independently re-audited.

## Validation

- `node node_modules/typescript/bin/tsc --noEmit`: PASS.
- `node node_modules/eslint/bin/eslint.js src/ripple`: PASS.
- `node node_modules/vitest/vitest.mjs run tests/ripple.test.ts`: PASS, 4 tests.
- `npm run build:review`: PASS. Vite reports its existing large-chunk warning; CinematicGame is approximately 802 kB / 219 kB gzip. This is not an FPS measurement.
- `node scripts/smoke-future-late.mjs`: desktop record → reveal → chair callback → three inspected memories → principle, plus portrait/touch record UI. Actual result and telemetry are in `desktop.json`; screenshots are captured from the running browser.

Both desktop runs completed without browser page errors, including the revised opposite-facing window and resting arms. The final portrait adjustment keeps the establishing camera inside the room instead of backing through the opposite window. No full-game regression or physical-device performance claim is made for this visual pass. An earlier desktop sample reported 143 draw calls at resolution scale 1; this alone does not establish device performance.

## Review

The existing preview stays on port 4231. `launcher.html` is copied to the preview output as `_future-review.html`; it offers explicit review checkpoints and a backup/restore option for the current game save. It does not change letter storage. `_research-review.html` is also restored after the production build. These launchers are review artifacts, not public game navigation.

Runtime evidence: `desktop-record.png`, `desktop-reveal.png`, `desktop-memories.png`, `mobile-record.png`. Visual approval remains with the Product Owner.
