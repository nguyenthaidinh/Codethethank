# 2035 — Điều mô hình không nhìn thấy

## Playable loop

The 2035 research table now opens a persistent experiment instead of a six-second autoplay beat. The player loads academic data, runs the simulated profile, adds the access log and runs again. Both sources can be switched on/off; the contextual run can be performed first. Mouse pointer capture supports dragging cartridges into the machine. Touch and keyboard activation provide equivalent loading/toggling.

Two separately retained outputs show the same simulated profile: academic data alone yields NOT RECOMMENDED; adding the limited-equipment context calls for REVIEW REQUIRED. This is a deterministic fictional decision-support experiment, not a real predictive model or automatic approval. The original 2026 historical result is unchanged. The player marks the omitted context, then records the finding before the validated 2035 exit and existing 2045 transition unlock.

The console, cartridges and paper printouts are code/SVG/CSS assets. Both 3D desk monitors change with the real experiment state, and the room simulation changes with the active information source. A closer table camera is scoped to active 2035 gameplay. The Canvas fallback displays the same case/result. A short optional colleague note explains the equipment access issue. The final readability pass exposes source contents directly and keeps the mobile footer reachable.

## Source

- `src/ripple/experiment2035.ts`: narrative evidence, typed state, reducer, validation and objectives.
- `src/ripple/LabBench2035.tsx`, `src/ripple/lab2035.css`: physical console presentation, pointer/touch/keyboard controls, run progress and printouts.
- `src/ripple/state.ts`: optional nested checkpoint and prerequisite-checked entry/exit.
- `src/ripple/RippleControls.tsx`, `src/ripple/ResearchEraHUD.tsx`, `src/ripple/story.ts`: entry, controls and interaction-driven captions.
- `src/ripple/ResearchStudio.ts`, `src/ripple/RippleWorld.ts`, `src/ripple/Fallback.ts`: actual display/camera/simulation response in 2035.
- `src/chapter/ChapterGame.tsx`: excludes internal experiment ticks from click sound playback. Narration remains opening-only.
- `tests/experiment2035.test.ts`, `tests/ripple.test.ts`: experiment and progression checks. Existing E2E flows call `tests/e2e/helpers/lab2035.ts` to play the new required section rather than bypass it. Current proof scripts use the updated entry label.

No edits to 2026 classroom art/camera, the letter interface/data, Main Menu, founder reveal, chair cue IDs, or 2045 gameplay. This pass implements 2035 only.

## Save compatibility

`RippleSave.version` stays 1. `lab2035` is optional so previously completed saves remain valid without fabricated experiment evidence or forced replay. A player still entering 2035 gets the new activity. A partial experiment persists loaded/enabled sources, completed trials, discovery and an in-flight run. Its progress follows the existing game clock; a year introduction suspends it on resume and paused controls stop ticking.

New checkpoint data rejects invalid source sets, impossible run masks/timing, false discovery flags and incomplete evidence carried past the 2035 boundary. Duplicate runs and repeated actions are idempotent. The following chapters retain their previous entry contracts.

## Actual checks

- Typecheck / production build: PASS, `npm run build`.
- Scoped lint: PASS for changed Ripple sources, ChapterGame, new tests and updated E2E fixtures.
- Unit: PASS, 27 tests across Ripple progression, the experiment, passage, future chair and future arrival.
- Browser: PASS, `node scripts/review-lab2035.mjs`, using the existing server at 4198. Covers real desktop drag/drop, no progression after waiting, both runs, mid-run reload, discovery and transition to 2045. Touch runs contextual data first, then disables context for the control; keyboard activation, reduced motion and forced WebGL-off Canvas fallback also pass. Actual states/errors are in `desktop.json`, `mobile.json` and `fallback.json`.
- Final screenshots were refreshed after increasing readability and showing source contents. No full-game/physical-device performance claim; the long E2E fixtures were updated but not run in full for this pass.

Existing build warnings remain: inconsistent opening-track JSON import attributes and large chunks. Concurrent repository work is present, so the whole bundle delta is not attributable solely to this feature. No new dependency, service, server port, deploy or push.

## Review

`http://127.0.0.1:4198/docs/lab2035-pass/play.html` offers an explicit review checkpoint with backup/restore of the previous cinematic save. It does not touch letter storage. Choose play, then Continue in the existing menu. Runtime captures: `desktop-start.png`, `desktop-control.png`, `desktop-compared.png`, `desktop-discovery.png`, `mobile-compared.png`, `fallback-compared.png`; `desktop-muted.webm` is a real browser visual recording without audio.

## Follow-up: help inside the game

`lab2035Help.ts` now supplies configuration-aware next actions. `LabBench2035.tsx` adds the always-available “Cần giúp?” control, an inline guide and a highlighted target. After 20 game-clock seconds without meaningful progress, the guide opens automatically. It waits during the year cover, machine runs and active dragging. Changing only switches does not keep deferring assistance indefinitely. Dismissal restarts the delay.

“Chỉ vị trí cần bấm” scrolls/focuses the real control and never activates it. The guide updates after each user action. The B-first situation explicitly says which source to turn off, then which Run button to press. The main objective no longer uses “đối chứng”. Mobile uses a sticky help row. No new save fields, progress bypass, voice or 2026/letter change.

Actual follow-up checks: typecheck/build and scoped lint PASS; 11 targeted unit tests PASS (`experiment2035.test.ts`, `lab2035-help.test.ts`). `node scripts/review-lab2035-help.mjs` PASS: actual 20-second auto-open, manual touch help, correct source → Run → mark → finish highlights, locating without executing an action, keyboard completion and dismissal. Screenshots and telemetry: `../lab2035-help-pass/automatic.png`, `mobile-manual.png`, `mobile-target.png`, `desktop.json`. These are browser captures; mobile means emulation. Existing build warnings remain. The existing port 4198 was reused.
