# Ripple — clear questions and passage of time

## Player-facing result

The two notebook questions explicitly say to inspect both lines, show 0/2 → 2/2, and explain prediction versus opportunity. The confirmation button says “Thêm bước con người xem xét”; HUMAN REVIEW remains a smaller explanatory label. The existing question IDs, prerequisites and reducer actions are retained. The player is reconstructing An's recorded thought process.

The last second of the 2026 design beat and each milestone closes the image. The environment changes under full cover. Each incoming scene displays its date, elapsed years and a short narrative bridge, then opens into the rendered environment:

- 2029: “Ba năm sau / Câu hỏi vẫn còn.”
- 2035: “Sáu năm tiếp theo / Không còn một mình.”
- 2045: “Mười năm tiếp theo / Trước một khởi đầu.”
- 2046: “Hai mươi năm sau buổi chiều ấy / AION.”

The 2046 `world` beat now lasts 13 seconds rather than 9, allowing its title, scene opening, AION introduction and connection to the old notebook to be read in sequence. Existing world saves with elapsed ≤9 remain valid. Save version, evidence, milestone count, reveal boundary and chair cue IDs are unchanged. Resuming an untimed year replays its short introduction; it never invents completed evidence. The title is not replayed when resuming a world save already past it.

The cover follows the existing game clock, so pausing does not advance it. Reduced motion uses a flat fade. Shader/texture stalls are capped in the presentation clock for these beats; they cannot swallow an entire year title in a single frame. Chapter 00, classroom geometry/camera/light, the chair sequence and the letter interface are not edited by this pass. No new voice playback or image asset is added.

## Files

- `src/ripple/SketchQuestions.tsx`: notebook interaction.
- `src/ripple/timePassage.ts`: year text, cover timing and stalled-frame clock guard.
- `src/ripple/YearPassageOverlay.tsx`, `src/ripple/timePassage.css`: animated cover and date presentation, desktop/mobile and reduced motion.
- `src/ripple/RippleControls.tsx`: integration and inert underlying controls during passage.
- `src/ripple/story.ts`, `src/ripple/state.ts`: clearer opening captions and 2046 beat pacing.
- `src/chapter/ChapterGame.tsx`: passes the game clock/settings, hides conflicting subtitles during the title and applies the scoped clock guard.
- `tests/ripple-passage.test.ts`, `scripts/review-ripple-passage.mjs`: regression checks and real browser evidence.

## Actual validation

- Typecheck: PASS after renaming an initially conflicting Windows module name to `YearPassageOverlay.tsx`.
- Scoped lint: PASS, `node node_modules/eslint/bin/eslint.js src/ripple src/chapter/ChapterGame.tsx tests/ripple-passage.test.ts`.
- Unit: PASS, 16 tests, `node node_modules/vitest/vitest.mjs run tests/ripple.test.ts tests/ripple-passage.test.ts tests/future-chair.test.ts`.
- Production build: PASS, `npm run build`. Existing JSON import-attribute and large-chunk warnings remain. Main cinematic chunk 808.64 kB / 221.91 kB gzip; this is not an FPS measurement and includes concurrent project work.
- Browser: PASS, `node scripts/review-ripple-passage.mjs`, reusing the running dev server at 4198. Keyboard first-note activation, both-note gating, all four date transitions, AION introduction, mobile touch, reduced-motion fade and reload during an untimed year were exercised. No browser page errors in the completed desktop run.

The first runtime attempt exposed the import-name collision. A later attempt exposed a real GPU-stall timing skip at 2045; the clock guard fixes that issue and a unit case covers a 20-second stalled frame. The final runtime passed without relaxing phase deadlines. Full-game regression and physical-device performance were not rerun for this scoped presentation change.

Evidence: `sketch.png`, `year-2029.png`, `year-2035.png`, `year-2045.png`, `year-2046.png`, `aion-introduction.png`, `mobile-sketch.png`, `mobile-year.png`, `desktop.json`. All screenshots are captured from the actual game. No preview server or port was started for this task; the existing 4198 server remains running.
