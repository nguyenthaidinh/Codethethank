# Production V4 — G2 classroom hero slice

Status: G2.1–G2.5 implemented; G2.6 technical checks and evidence complete, with a recorded menu retry. **Ready for Product Owner art review; art is not approved automatically.** No deployment or Gate 3 is authorized by this report.

## G2.1 — source and quality baseline

Observed source: React/TypeScript/Vite, existing Three.js scene, persistent ChapterGame canvas and ChapterAudio context, nested validated saves. No Git metadata in this workspace. Actual source-of-truth files: `src/chapter/ChapterGame.tsx`, `src/chapter/director.ts`, `src/cinematic/WorldRenderer.ts`, `src/cinematic/FallbackWorld.ts`, `src/cinematic/AudioDirector.ts`, `src/cinematic/motifs.ts`; state modules in verdict/stayed/ripple/finale. Canon V3 overrides old project naming/time references.

Existing procedural room: 12 × 13 footprint, window wall, basic corridor, six duplicated workstations, hero desk/laptop/papers, articulated An/Cô Vân, chair/fan/rain. No classroom network assets. Menu has three existing WebP images and is outside this art scope. Static meshes are merged by material; screen/notebook/characters/chair/door/fan stay dynamic. Renderer owns geometry/texture lists; shared RippleWorld factories require care with chair and rig changes.

Visual limitations observed in previous runtime images and confirmed in source: sharp primitive forms, flat Lambert colors, hard BasicShadowMap, very strong warm directional light despite rain, coarse adaptive render target plus 960px output cap, little material variation, repeated workstations, underdeveloped faces/garments and low arm poses. Camera presets and prop projections are already functional and must be preserved for paired evidence.

Telemetry limitation: baseline `world.triangles` is sampled *after* the overlay draw, so the value 2 counts the fullscreen quad, not the classroom. Baseline draw-call value is captured before overlay and is usable. Do not use the triangle field to claim a before/after geometry reduction. New measurement must sample the world render before overlay and disclose the old defect.

Baseline runner: `powershell -File scripts/run-g2-qa.ps1 -Phase Baseline`. Fresh run, no reuse of G1 cached passes. Logs, source/build SHA256, bundle manifest and archived build: `proof/baseline/`. Runtime captures will be frozen under `proof/baseline/runtime/`. No runtime art changes are permitted until the current-source full regression and captures finish.

Baseline completed before runtime modification: typecheck/lint/build PASS, **30/30 unit (8 files), 23/23 gameplay (28.1 minutes), 11/11 menu**. Hero capture run **3 PASS / 1 intentionally skipped** (the unimplemented art-A proposal), 5.1 minutes. Eight browser captures, camera/draw-call JSON, a real canvas+audio movie, original presets, chair motif source and the production ZIP are preserved. Source hash guard checked original WorldRenderer SHA256 before applying art. Work-in-progress art code was staged outside `src` and copied into the runtime only after baseline regression and capture status both passed.

Baseline environment: HeadlessChrome 159 / Windows / ANGLE SwiftShader Vulkan, 1280×720 viewport, 960×540 canvas output. These are automation measurements, not native device performance. Cinematic bundle **606.62 kB / gzip158.03**, same as final G1 copy build.

Art direction decision and review criteria: [Art Bible V1](ART_BIBLE_V1.md). Provenance: [Asset registry](ASSET_REGISTRY.md). Selected B, Stylized Cinematic Realism; proposal A uses a comparable restrained material/light treatment in the same world, not a claim of photorealistic actors.

## G2.2–G2.5 — implementation log

- **G2.2 / environment:** new `src/art/ClassroomArt.ts`, integrated from `WorldRenderer.buildRoom/buildDesk/makeChair`. Plaster, lower paint, terrazzo-like floor, ceiling, framed glazing/sill, physically sized doorway and corridor, desks/frames/keyboards/towers/cables, varied chair positions and small papers/cup, board/signage/clock, cabinet, exterior building/foliage, bag and bound notebook. Original projected anchors retained except chair anchor now follows its actual mesh. `npm run typecheck` and `npm run build`: PASS. No acquired assets or new package.
- **G2.3 / lighting:** cool cloudy window key, restrained warm fill/practical, PCF soft shadows with moving-actor refresh, preserved shadow flags in batching, explicit exposure restore in separate 2046 environments. 1440px output cap, median calibration excluding warm-up. World triangles sampled before overlay; resource counters added. Door POV moved just inside the aperture to avoid the new real wall/door blocking it; paired capture presets remain unchanged. Typecheck/build PASS after resolving a TypeScript empty-array inference error. Grounded A actual-runtime probe **1/1 PASS**; images under `proof/lighting/runtime/`. The initial 2-sample target was removed after measurement; final sample count is **0**.
- **G2.4 / characters + fallback:** rounded shirt torso/collars/cuffs, small face/hair/ear details, same colors/hair identities and joint hierarchy. Student right arm rests toward the workstation; teacher remains calm, existing timing untouched. Existing 2046 character shapes/materials/poses retained; shared chair gets matching geometry with the old future material treatment. Canvas2D classroom palette, window/building depth, workstation rows, desk grain and differentiated figures improved without changing fallback anchors/gates. Typecheck/lint/build PASS. Current intermediate cinematic bundle **638.11 kB / gzip167.62**.
- **Technical art correction during review:** RoundedBoxGeometry is non-indexed, older primitives indexed. The initial mixed-material batches could not merge, producing 221 calls in the lighting probe. Normalize copies to non-indexed geometry before merging; preserve cast/receive flags so the neighboring building does not incorrectly shadow all window light. Final counters are being re-measured in the full hero capture. No assertion was weakened to hide this.
- **G2.5:** `tests/e2e/cinematic-g2-art.spec.ts` drives the actual menu→classroom→evidence→An evaluation→teacher/chair→notebook→written/next path. Additional touch/reduced/mute/reload and fallback/keyboard cases, plus real grounded-A variant. Baseline movie extraction was slow through JSON; after capture uses the browser's Blob download for the same actual MediaRecorder stream, preserving scene and assertions.

Final hero result: **5/5 PASS**, 4.5 minutes, after both Canvas and contact fixes. Visual review found Canvas figures covering the notebook, then the laptop masking Cô Vân; figures now draw behind the desk, aligned with the chair center. A close chair view also exposed the inherited floor/sole gap: classroom ground is now y=0 and hero knees/ankles keep the soles flat while sitting. Runtime assertions check actual world-space sole positions: An≈3.5mm from breathing, Cô Vân≈0mm at the final seated hold, both below1.5cm tolerance. Future rig acting remains unchanged. The final full regression runs on this corrected source. Early after-regression attempts were deliberately interrupted for visual/contact fixes; only the final completed status may be treated as a full PASS.

No story state, save schema/prerequisite, menu redesign, public backend or paid asset acquisition is part of this gate. `CHAIR_MOTIF` constants/audio identity are unchanged. Runtime-generated geometry/maps remain owned and disposed; overlay mesh/material cleanup was also made explicit.

## G2.6 — verification and art review

Final source verification: no runtime files changed after the tested build was frozen. The only source changes from baseline are WorldRenderer/FallbackWorld and the new ClassroomArt module; ChapterGame, save/reducers, audio and menu source hashes are unchanged. [Final aggregate status](proof/after/status.json), [source fingerprints](proof/after/all-source-hashes.json).

| Executed command / group | Actual result |
|---|---|
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm test` | **30/30 PASS**, 8 files |
| `npm run build` | PASS; chunk warning remains |
| `powershell -File scripts/run-g2-qa.ps1 -Phase After -WaitForCapture` / gameplay | **23/23 PASS**, 28.0 minutes; [log](proof/after/gameplay.log) |
| Fullgame case within that suite | **Start→00→04→Credits PASS**, 5.8 minutes, no seeded checkpoint/reload between chapters |
| `powershell -File scripts/capture-g2.ps1 -Phase after` | **5/5 PASS**, 4.5 minutes; [log](proof/after/capture.log) |
| Menu first attempt | **10 PASS / 1 FAIL**: initial audio/start case did not find the game pause button within5s; [failure log](proof/after/menu-initial-failure.log) |
| `npx playwright test --config playwright.menu.config.ts --trace off` unchanged retry | **11/11 PASS**, 22.5s; [retry log](proof/after/menu-retest.log) |
| `powershell -File scripts/finish-g2-proof.ps1` | PASS; both production index hashes checked, 2 matched captures + an audio-enabled warm probe per build |
| `node scripts/inspect-g2-review.mjs` | PASS; 17 images, A/B switch, video playback/seek25s, desktop1366×900 and mobile390×844, no page errors |

The initial menu failure snapshot still showed the menu, not the game error boundary. The unchanged retry's first case passed in2.6s, including expected audio states `closed/running`. A transient cold-dev/preload delay is an inference, not a proven root cause. No assertion or timeout was relaxed, and no menu/runtime source was changed to hide it. Cold-start reliability remains a watch item; aggregate status explicitly retains `initialMenuFailure=true`.

### Runtime evidence and measurement

- [Review gallery](REVIEW.html), [raw comparison and image links](proof/COMPARISON.md), [machine-readable metrics](proof/comparison.json).
- [Art A](proof/after/runtime/proposal-A-grounded-wide.png) and [selected B](proof/after/runtime/01-classroom-wide.png) are both the actual runtime, not concept art or separate mockups.
- [Watchable demo](proof/after/runtime/hero-demo.webm): **53.195s**, actual canvas1280×720 + stereo Opus48kHz. Remux only for finite duration/seek; no frame/audio editing. [Raw recording](proof/after/runtime/teacher-chair-notebook-live-audio.webm), [demo metadata](proof/after/runtime/demo-tracks.json); [volume analysis](proof/after/runtime/audio-analysis.txt): mean−36.9dB / max−18.4dB, so the audio track is not silent. These measurements and cue tests do not certify subjective listening quality on real speakers. HTML subtitles/HUD are outside the canvas; complete browser screenshots include them.
- Six original paired views have camera-eye delta0. Supplementary pairs now make all eight comparison rows match: the teacher arrival hold uses the common `teacher` preset at discussion time≥1.2s; chair uses `chair_insert` at time≥3.2s. Both use validated Continue states, reduced motion and debugger-frozen real browser frames. The doorway POV intentionally changed to avoid the new wall; its original moving views/video remain available rather than being falsely labeled identical. No game source or pixel content is altered for capture. [Proof status](proof/proof-status.json), [baseline build hash/capture status](proof/baseline/matched-status.json), [final build hash/capture status](proof/after/matched-status.json).
- [Review browser validation](proof/review-status.json) confirms all17 images load, video duration53.195s is finite, playback and seeking work, and the review has no horizontal overflow at390px. The gallery is an evidence viewer, not a replacement game.
- Baseline fallback's `[0,0,0]` camera telemetry is a placeholder, not a physical-camera measurement. Its actual 2D projection/anchors are unchanged; visual comparison is the meaningful check.

| Measured item | Before | After / interpretation |
|---|---|---|
| Cinematic chunk | 606,622 bytes / gzip158.03kB | **638,427 bytes / gzip167.73kB**, +31,805 bytes (~5.2% raw); Vite >500kB warning remains. Relative to the older597.58kB reference: +40.85kB, not a mandatory threshold |
| ChapterGame chunk | 45.95kB / gzip15.84 | 45.95kB / gzip15.84; no narrative/controller change |
| Wide world draw calls | 82 | 107, +25; mixed indexed/non-indexed batching bug fixed from interim221 |
| Window draw calls | 38 | 38 |
| Visible world triangles | unavailable: old counter read overlay2 | 28,414 in wide; actual world pass, not overlay |
| Wide allocated resources | not instrumented | 111 geometries / 15 textures / 10 shader programs at capture; counts, not GPU bytes |
| Output canvas | 960×540 | 1280×720 at the same1280×720 viewport |
| Render target observed | quality0.9,1152×648 | quality0.65,832×468; adaptive software tier |
| Entry rAF sample,47 intervals | median49.9ms / P9050ms | **median100.0ms / P90100.1ms**, a remaining software-renderer cost increase |
| Isolated warm probe | not measured | median≈50ms, no audio; different workload, not a substitute for the entry comparison |
| Same audio-enabled state after10s warm-up | median49.9ms / P9050ms | **median66.7ms / P9083.4ms**; adaptive resolution enabled in both, still a measured cost increase |

Performance decision: multisampling+specular version reached ~190ms intervals; removing multisampling reduced the isolated probe to ~83ms; matte diffuse B reduced it to ~50ms. Evidence is retained under `proof/performance-iteration1`, `proof/perf-no-msaa`, `proof/perf-diffuse`. A keeps selected specular materials as a comparison study. **The final entry sample still costs more than baseline**, so performance remains a review item rather than a certified target. No real-phone FPS, GPU memory bytes, Safari or long-session stability claim is made. Dynamic shots may include a shadow refresh pass in the draw-call number; inspect `shadowRefreshed` before comparing them.

### Changed files and protected scope

Runtime: new `src/art/ClassroomArt.ts`; modified `src/cinematic/WorldRenderer.ts` and `src/cinematic/FallbackWorld.ts`. No ChapterGame, director/save/reducer, narrative, AudioDirector, menu, motif constant or independent 2046 environment source change. WorldRenderer's shared chair geometry/output-resolution handling is intentionally checked by Chapter03/full-game regression; future actor material/exposure treatment stays established.

QA/tooling: `tests/e2e/cinematic-g2-art.spec.ts`; `scripts/run-g2-qa.ps1`, `capture-g2.ps1`, `capture-g2-pairs.mjs`, `finish-g2-proof.ps1`, `report-g2.mjs`, `inspect-g2-review.mjs`. Docs/art contains Bible, registry, report, gallery and proof. No dependency added, no generated full-scene bitmap, backend, deploy, push, DNS or paid service.

### Art review and limitations

Observed improvement: articulated room construction, weather depth, varied equipment, legible clock/signs, rounded chair edges, bound notebook, quieter shadows and meaningful warm/cool separation. Desktop/mobile/fallback images were opened and reviewed; the fallback overlap issue was fixed. Automated tests cannot approve the art.

**Product Owner review is pending.** Procedural characters remain visibly simplified; no skinned anatomy, finger deformation, facial acting, authored clothing or natural weight/contact certification. Legacy hero desk height is retained for interaction/pose compatibility; contact/ergonomics need an authored character pass. Canvas2D is an illustrated resilience mode with approximate occlusion, not equivalent 3D fidelity. Low adaptive software resolution softens page/world text (subtitle remains readable). Real devices, headphones/speakers, Safari, GPU-memory/long-session profiling and first-time playtest remain unverified. Do not call this AAA, release-ready or approved for expansion to Gate3.

Stop: G2 implementation/evidence is handed over for review. Do not propagate the art pipeline to other chapters or start G3 without the next instruction.
