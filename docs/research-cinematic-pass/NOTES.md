# Research cinematic framing and interface

This pass edits only `src/ripple/`: `ResearchCinematography.ts`, `ResearchEraHUD.tsx`, `RippleWorld.ts`, `RippleControls.tsx`, `ResearchJournal2029.tsx` and scoped `ripple.css`.

- Research-only key/rim/screen-fill lights: warm key in 2029, neutral/cool fill in 2035. Lower general illumination gives the face and equipment clearer separation; no shadow-map or post-processing pass added. Lights are disabled outside these two eras.
- Camera moves beside the desk, on the front side of An, with a short subtle dolly and stable reduced-motion framing. Portrait has its own closer composition. An looks toward the right display, exposing the face without changing classroom actor behavior. Initial front-of-monitor camera was visually rejected because monitor backs occluded An; final side framing resolves that.
- Shared modern chapter HUD: compact era/date, three-point timeline, next-action icon and comfortable touch target. Removed the large poetic heading from the workspace view. Journal content and all progression/checkpoint logic remain.
- No edits by this pass to 2026/classroom, voice, opening or letter source. Hash audit observed concurrent changes to ClassroomCinematography.ts, FallbackWorld.ts and WorldRenderer.ts from the other active work; those files were neither edited nor reverted here. Letter files match baseline.

Checks: typecheck, ESLint src/ripple, Vite build PASS; four existing tests/ripple.test.ts PASS. Actual browser flow desktop/touch: 2029 desk → journal → 2035; screenshots and JSON in this directory. Final tighter framing is verified using scripts/smoke-research-cinematic.mjs. No full regression or physical-device/FPS certification in this visual pass. Existing large bundle warning remains. No push/deploy.

Preview: http://127.0.0.1:4231/_research-review.html — select 2029 or 2035, then Tiếp tục. The preview is isolated from previous save origins.
