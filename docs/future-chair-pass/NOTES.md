# 2046 — An chooses to stay

## Scene changes

The young researcher is now handling an incomplete case awaiting HUMAN REVIEW. They ask whether to stop because information is missing. An notices the empty chair; the existing 2026 echo remains unchanged. In 2046 he pulls the chair, sits beside the researcher and asks to see the file. This gives the repeated gesture an immediate purpose instead of following an unrelated forecast of research success.

This pass edits only `approach`, `chair` and the default `reconstruct` caption in `src/ripple/story.ts`. Concurrent changes to the reflection/conclusion captions are retained. No new voice playback is added.

The original 1.25-second chair sound, low camera insert, six-second chair phase, checkpoint schema and cue IDs remain. The camera now rises outside the right edge of the desk, then settles into a two-person composition. The original reflection angle hid An behind the monitor; the new desktop/portrait shot is checked for face framing and monitor occlusion. Reduced motion uses a stable eye-level shot.

The founder stays standing through the reveal and approach instead of snapping from seated to standing. His hand reaches the moving backrest, releases before he steps around it, then rests on his lap. The researcher turns toward An. Future-only key/rim/bounce lights give warm faces and cool separation from the city windows.

## Files

- `src/ripple/FutureCinematography.ts`: 2046 lighting and conversation shots.
- `src/ripple/FutureChairPerformance.ts`: founder blocking, backrest contact, sitting and attention.
- `src/ripple/RippleWorld.ts`: integrates these only in the 2046 Ripple environment, preserving the separate Finale environment.
- `src/cinematic/WorldRenderer.ts`: adds one `acting: this.actors` dependency to the Ripple constructor. No classroom render branch, rig factory or classroom camera/light source is edited by this pass.
- `src/ripple/FutureResearchHUD.tsx`: stable accessible name for the existing record action.
- `src/ripple/story.ts`: the three caption changes described above.
- `tests/future-chair.test.ts`, `scripts/review-future-chair.mjs`: scoped checks and real browser captures.
- `docs/future-late-art-pass/launcher.html`: adds the explicit approach checkpoint to the existing review launcher, with the same save backup/restore behavior.

## Checks and evidence

- Typecheck: PASS via `npm run build:review` and the direct TypeScript check.
- Scoped lint: PASS, `node node_modules/eslint/bin/eslint.js src/ripple src/cinematic/WorldRenderer.ts tests/future-chair.test.ts`.
- Unit: PASS, 10 tests across `tests/ripple.test.ts` and `tests/future-chair.test.ts`. The first run caught an assertion against dialogue concurrently revised in another session; the assertion was corrected to the current uncertainty/verification wording, without changing that dialogue.
- Production review build: PASS. Existing large-chunk warning remains, plus an inconsistent JSON import-attribute warning in the opening voice/pacing modules outside this change. Current CinematicGame is 806.66 kB / 221.25 kB gzip; concurrent work was included, so the full bundle delta cannot be attributed to this pass alone.
- `node scripts/review-future-chair.mjs before`: PASS; baseline screenshots in `before/`.
- `node scripts/review-future-chair.mjs after`: captures the real approach → 2026 echo → chair → reflection → reconstruction; checks the chair cue remains unique and the three memories unlock the principle. The script also checks touch/muted/reduced-motion reload during the chair scene. Actual outcomes are in `after/runtime.json` and `after/touch-resume.json`.

The protected-file hash check confirmed classroom geometry, classroom camera/light/performance modules and letter controls/data remained byte-identical. `src/stayed/story.ts` changed concurrently in another session; it was not edited or reverted here. No full-game or physical-device performance claim is made.

Preview remains on `http://127.0.0.1:4231/_future-review.html`. Choose “Xem cảnh An kéo ghế ngồi lại”, then Continue. No additional preview server, port, deployment or push.

Final browser check: desktop and touch/mute/reduced-motion/mid-chair reload both PASS. `after/chair-live-audio.mp4` is a 20.12-second recording of the live game canvas and its AudioDirector output, converted from the retained WebM. FFprobe confirms video and audio tracks; audio mean is −46.1 dB and peak −30.4 dB. HTML subtitles/UI are shown in the runtime screenshots rather than baked into the canvas video. No character speech was added.
