# FINALE V5.1 — TECHNICAL REPORT

Date: 17/11/2026. Scope: **F5.1 + F5.2 only**. Status: playable procedural room, ready for Product Owner visual review. Not approved final production art.

## Audit and implementation decision

| Area | Existing implementation | Decision |
|---|---|---|
| Finale state | `src/finale/state.ts`, version 1, guarded reducer, completion flags | Byte-for-byte preserved |
| Finale visuals | `FinaleVisual` in `RippleWorld`, paper-to-star/galaxy | Add room only in question/paper/letter/review |
| Cinematic runtime/camera | Chapter timeline, one existing room renderer/camera, pause-aware phase clock | Reuse clock and camera; no extra render loop |
| AudioDirector | Shared bus plus `ChapterAudio.finaleMix`, gesture unlock and inherited write cue | Unchanged; captured from real master bus |
| Save/Continue | `readFinale`, separate private letter storage, menu save bridge | No schema, keys or privacy changes |
| Menu | Existing GameShell/Continue | Unchanged |
| Design tokens | Existing styles span green/paper/gold Finale and restrained AION blues | Add Finale-scoped navy/steel/cyan/amber/ivory tokens |
| Fallback | Existing canvas replacement on WebGL unavailable/lost | Add live procedural room drawing using same phases |

Room geometry is integrated into the existing scene and renderer, not a screenshot background. The monitor interaction is a native button projected onto the actual screen plane and invokes the existing pause-aware action. The push-in is 1.8 seconds, reduced-motion compatible. The old private editor is retained with a scoped integration surface; no F5.3 data model, public consent, preview workflow or server was implemented.

## Concurrent-work protection

The workspace has no `.git` metadata, so a Git diff/worktree was unavailable. Before edits, all existing `src` files were hashed; original Finale source was copied to `finale-v5-1-proof/baseline`. Each existing implementation file was checked against its saved bytes before editing.

This task edited exactly these existing source files:

- `src/finale/FinaleVisual.ts`: create/dispose the room, select room phases, retain legacy visuals elsewhere.
- `src/finale/FinaleControls.tsx`: monitor target, present-day caption and import scoped styles. Existing editor and ending actions preserved.
- `src/finale/Fallback.ts`: dispatch the room phases to the live Canvas fallback.

At the first verification, all other pre-existing source files matched the starting hashes. During the final fullgame run, another chat updated `src/cinematic/FallbackWorld.ts`, `src/cinematic/WorldRenderer.ts` and `src/ripple/{Fallback.ts,RippleControls.tsx,RippleWorld.ts,story.ts}`. This task did not edit, revert or absorb ownership of those changes. See `concurrent-source-changes.json` for attribution, plus `source-before.json`, `source-after.json`, `changed-existing-source.json`, and `finale-changes.diff`. The recorded fullgame, video and before/after performance comparison refer to the isolated build created before those concurrent changes; a separate integration verification is recorded below.

New implementation files:

- `src/finale/PlayerRoom.ts`: owned scene resources, geometry, lighting, responsive first-person camera, screen projection.
- `src/finale/PlayerRoomFallback.ts`: live Canvas composition, matching zoom and monitor target.
- `src/finale/player-room.css`: Finale-only tokens and interaction/editor surfaces.

QA changes:

- `tests/e2e/cinematic-player-room.spec.ts`: desktop keyboard, mobile touch, Canvas fallback, camera movement, persistence, viewport overflow, runtime errors and timing samples.
- `playwright.player-room.config.ts`: dedicated ports/output; does not overwrite the other chat's normal build or Playwright report.
- `scripts/record-player-room.mjs`: actual browser frames + live master audio capture and muxing.
- `tests/future.test.ts`, `tests/story-n2.test.ts`: narrowly extend existing authorized-file lists for Finale presentation. Initial unit run exposed old whole-source hash guards. No behavioral test was deleted or disabled; state/story/audio guards remain in force. No blanket `src/finale/*` exclusion.

Artifacts use `finale-review-dist`, `finale-baseline-dist`, and `docs/finale-v5-1-proof`; the shared `dist` was not overwritten. No push or deployment occurred.

## Verified QA

| Check | Result |
|---|---|
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm test` | PASS — initially 14 files / 50 tests; integrated workspace rerun 15 files / 53 tests |
| `npm run build -- --outDir finale-review-dist` | PASS; existing large-chunk warning remains |
| Existing cinematic-finale regression | PASS — 3 tests |
| Player Room desktop/mobile/fallback | PASS — 3 tests; rerun after final portrait framing and screen clearing |
| Legacy IME, private persistence/erase, Menu/Continue, replay, completion | PASS in existing Finale regression |
| Offline, unavailable storage/audio, reduced motion, 360px | PASS in existing Finale regression |
| Real monitor geometry target + keyboard/tap + camera approach | PASS in added room tests |
| Full journey from Menu without checkpoints | PASS — 1 existing fullgame test, ~6 minutes; see `fullgame-results.json` and `fullgame/` |

The preserved Finale regression covers the legacy completion/galaxy path; the new tests cover the monitor route. No page errors were recorded in the six targeted tests or the fullgame journey. Fullgame also verified completion, the single star cue, preserved canvas, narrator shutdown and no extra navigation. Screenshots were visually reviewed on desktop, 390px portrait and fallback; portrait was pulled back after the first review. Mobile testing uses Chromium emulation, not physical iOS/Android devices. Browser/mobile keyboard behavior on real hardware remains a release acceptance task.

## Concurrent integration recheck

After detecting the other chat’s renderer/Chapter 04 changes, this task rebuilt the isolated preview from the combined workspace. Typecheck, lint, 53 unit tests and production build passed. The renderer still calls `FinaleVisual.update`/`dispose`, and fallback still dispatches Finale using its existing contract. `source-integration-build.json` records this snapshot. `integration-results.json` and `integration/` hold the separate Player Room browser recheck: PASS, 3/3 desktop/mobile/fallback tests (46.4 seconds), including monitor input, camera approach and save/Continue. The complete no-checkpoint journey above was run on the earlier isolated build; it was not rerun against the other task’s new Chapter 04 behavior.

## Performance comparison

Same local browser, matching paper phase, DPR 1, 120 RAF callbacks per sample (first discarded), no video capture during sampling. These are RAF intervals, not GPU timing or comprehensive low-end-device benchmarks.

| Mode | Before median / p95 | After median / p95 | Draw calls before → after |
|---|---|---|---|
| Desktop 1280×720 | 16.7 / 16.8 ms | 16.7 / 16.8 ms | 76 → 45 |
| Mobile emulation 390×844 | 16.7 / 16.8 ms | 16.7 / 16.8 ms | 77 → 34 |
| Canvas fallback 390×844 | 16.7 / 16.7 ms | 16.7 / 16.7 ms | 1 → 1 (logical fallback draw) |

The lower draw count is a simpler Finale scene, not evidence that the whole game is faster. Existing renderer still retains prior scene resources. New scene adds static meshes, 56 instanced keys and 48 dust points. The large cinematic chunk changed from 742.70 kB / 198.88 kB gzip to 750.41 kB / 201.75 kB gzip; Chapter CSS from 19.21 kB / 4.72 kB gzip to 21.71 kB / 5.23 kB gzip. These figures include Vite's existing bundle organization; no global bundling refactor was attempted.

## Runtime evidence

- `after/desktop-room.png`, `after/mobile-room.png`, `after/fallback-room.png`: actual gameplay screenshots.
- `after/*-computer.png`: retained private editor integration at the near camera.
- `runtime/player-room-with-audio.mp4`: 1280×720 H.264 + AAC, ~19.55 s, actual gameplay with ambient sound, monitor activation, push, editor and pause/resume.
- `runtime/live-audio.webm`: original master-bus capture. No substituted soundtrack or post-normalization.
- `runtime/recording.json`: capture method, before/after telemetry and error list. Video export cadence is 24 fps, not a render-rate claim.
- Audio verified present by ffprobe/volumedetect: mean -53.6 dB, peak -23.9 dB. The inherited ambience is deliberately quiet and includes a stronger interaction cue.
- `performance-comparison.json`, `before/*-performance.json`, `after/*-performance.json`: raw local measurements.

## Quality gate / limits

Engineering gates above passed; final visual consistency and production-art approval belong to Product Owner. The room has first-person framing, a real geometry-aligned monitor interaction, animation, existing lifecycle-safe audio, preserved progression and a live fallback. Art is procedural with simple materials: no authored PBR set, baked contact shadows, custom high-detail props or bespoke room foley. Legacy paper shortcut, private editor, star reveal and completion are deliberately retained. The inherited world telemetry still labels the parent research scene as era 2046; the new room's narrative label is the present. No story year/schema was rewritten just to relabel debug telemetry.

Review locally at `http://127.0.0.1:4188/` while the dedicated preview runs. The game retains normal save/Continue; test checkpoint seeding is isolated to Playwright contexts. **Stop here for Product Owner approval. Do not advance automatically to F5.3.**
