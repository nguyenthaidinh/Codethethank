# THE UNWRITTEN LESSON — Art Bible V1

Historical G2 direction: Product Owner rejected its art. Current art source-of-truth is [Gate 2R — Paper & Rain](../art2r/ART_DIRECTION.md), with [runtime review](../art2r/REVIEW.html) and [QA](../art2r/QA_REPORT.md). Gate 3 remains closed pending visual approval.

Original scope: Production V4 / G2, classroom 17:05, Vietnam, 2026. Canon authority: `../STORY_CANON_V3.md`; directing: `../GAME_DIRECTOR_BIBLE.md`; scope: `../MASTER_GAME_PRODUCTION_PLAN_V4.md` and the supplied G2 brief. The following records the superseded direction, not permission to redesign other chapters.

## Direction decision

| Criterion | A — Grounded Cinematic Realism | B — Stylized Cinematic Realism (selected) |
|---|---|---|
| Story | Familiar institutional room, documentary restraint | Familiar room, shaped around An, an empty chair and a notebook |
| Characters | Existing procedural faces are an obvious mismatch for photographic surfaces | Simplified anatomy and sculpted silhouettes can belong to the same world |
| Implementation | Requires authored scans/models, careful UVs and animation to deliver genuine realism | Beveled forms, generated surface maps and shared rig can be produced coherently in this repository |
| Production effort | High; material and character fidelity must advance together | Moderate; concentrate detail where camera and hands meet |
| Mobile | Rich surfaces and shadows consume a larger budget | Shared maps, merged static geometry and resolution tiers give practical flexibility |
| Maintenance | More external asset provenance and LOD work | Deterministic code-native assets with explicit disposal |

Recommendation: B. Its goal is believable space and deliberate shapes, not photorealism. A is offered as a restrained material/light treatment in the same runtime for comparison, not falsely presented as a finished realistic character pipeline. Runtime: `?art=stylized` (default) and `?art=grounded`, preserving game state and controls. B uses textured matte diffuse surfaces; A retains specular material treatment on selected props. After measured cost, multisampling is disabled; keep soft shadow filtering and geometry bevels. This is an explicit performance/art tradeoff, not an unmeasured FPS claim.

## Visual pillars

1. An ordinary place that matters. University lab architecture, utilitarian equipment and traces of a difficult presentation; no decorative futuristic interface in 2026.
2. Cool rain, warm company. Overcast light from the left window wall, warm local practical illumination at the shared desk. The teacher changes the emotional center without a victory glow.
3. Hands, paper, chair. Preserve readable negative space around these props. Background detail stays quieter than the evidence.
4. Quiet imperfection. Slightly displaced chairs, spare cables, uneven stacks, used chalk/markers, an abandoned bag; avoid cloning an identical workstation six times.
5. A continuous room. The same geometry, anchors, camera language and audio context remain in use through investigation, evaluation and the teacher scene.

## Palette and material library

| Role | Target colors | Treatment |
|---|---|---|
| Upper plaster | `#b6b7a8`, `#c5c4b5` | Chalky, low contrast mottling, rough surface |
| Lower institutional paint | `#667e78`, `#71877e` | Desaturated green grey, slightly worn at skirting |
| Rain and outdoors | `#899da3`, `#637e83` | Cooler than interior; distance haze, restrained contrast |
| Timber | `#9b7954`, `#b18d63` | Grain along desk length, worn edges, matte finish |
| Steel and electronics | `#354846`, `#263439` | Limited specular response; no mirror desk or glossy floor |
| Chair upholstery | `#526d61` | Recognizable olive green across the motif |
| Paper | `#e1d6b9` | Warm off-white; dark ink, readable at close range |
| An | Sage shirt, dark trousers, short dark hair | Retain identity; collar, cuff and hair shapes add clarity |
| Cô Vân | Muted ochre blouse, dark trousers, tied hair | Calm silhouette; no costume/identity replacement |

Generated surface maps must be subtle at actual gameplay resolution. Text belongs on physical signs, papers and screens; no full-scene raster background. Textures use sRGB for color, no external photographs. Gameplay text is Vietnamese; 17:05 clock and university signage must be correct. No AION logo in this room.

## Light and atmosphere

- Soft cloudy window key from the left, cooler than the lamp; restrained hemisphere fill preserves readable shadow sides.
- Interior fixtures are practical light sources represented in geometry. Desk practical directs attention to the work surface; its existing story-controlled gain is retained.
- Soft contact and cast shadows with bounded map resolution. Dynamic shadow refresh must follow the chair/teacher without freezing their old positions.
- No bloom/postprocessing dependency, purple wash, firefly field, high-gloss reflections or harsh sunny stripes on a rainy afternoon.
- Rain remains outside the glazing. Deterministic window streaks can add scale. Reduced motion holds weather and fan; no additional particle field inside the room.
- Rain/fan/footsteps/chair/pen timing belongs to existing AudioDirector, not a new art-specific AudioContext. Preserve chair cue identity.

## Space, proportions and props

Existing world units are approximately meters, but the legacy hero desk is 0.98 high. Preserve its interaction plane for G2; do not silently change anchors/poses to chase nominal dimensions. Door width ~1.5, clear height ~2.9, room ~12 × 13 × 3.8. Add proper jambs, lintels, sill depths and wall construction. Keep the entrance route clear.

Desk edges have a small radius rather than a perfectly sharp cube. Thin steel frame, feet, back panel and cable route establish construction. Workstations vary by powered-off screens, notebooks, keyboard angle and chair displacement. Personal props use small silhouettes and surface detail rather than large unreadable wall text. Teacher's path and all focal props must stay unobstructed.

The static room uses merged meshes by material. Detail may increase triangle count while keeping draw calls bounded. Reuse surface maps and materials. Avoid one material/texture per decorative fastener.

## Character standards

Retain root/body/head/arm/leg/shin joint hierarchy and animation contracts. Keep An's short hair and sage top, Cô Vân's bun and ochre top. Add appropriate collars, garment seams, restrained facial features, ears and shoe forms; use rounded/contoured forms where visible. Poses remain driven by existing narrative timing. Hands must read as resting/working rather than detached props.

These are procedural stylized rigs, not final authored character assets. Skin deformation, facial performance, finger articulation, cloth and natural seated weight remain limitations. Do not describe them as production-final or AAA. Any future replacement requires rig/retarget and chair-contact review in both eras.

Classroom ground is world y=0. The legacy 4cm floor gap is corrected; hero standing hip0.8425 and seated hip0.59 preserve chair/desk composition. Knee angle follows the measured0.4 thigh and0.4425 knee-to-sole distance; ankle cancels torso pitch so soles stay flat while sitting. Runtime E2E checks world-space sole height within1.5cm (including4mm breathing). This is a contact correction for the 2026 hero rigs, not full foot IK or a replacement of the established 2046 acting.

## Camera and interaction composition

Freeze baseline camera presets for paired before/after captures. Wide: foreground desk and chair lead toward the rainy wall and teaching area. Window: layered sill/glass/rain/trees/building rather than an empty bright rectangle. Laptop: preserve unobstructed display and evidence on the right. Entrance: teacher path reads against the doorway. Notebook: avoid raised decorative objects crossing the viewing ray.

The chair insert uses the exact `CHAIR_MOTIF` eye/target/FOV and timings. No art pass may casually move it. Portrait presets retain their wider framing; all hotspots remain projected from the existing physical anchors. Optional future camera improvements require additional captures rather than replacing the paired baseline angle.

HUD stays secondary, with existing subtitles, pause, mute and input hints. No new inventory panels, website cards or objective dashboard.

## Asset specifications and lifetime

- Code-native room geometry and textures; no new dependency or external service needed.
- Small repeatable color maps up to 512² (fabric128²); glazing512×1024. Board1024×512; small signs512×256; close-up legacy papers/screens retain their existing 1024–1200 px maps. Prefer shared maps, not duplicate per prop.
- Bevels only where silhouettes/closeups justify them. Repeated tiny props use simple geometry.
- Generated assets build once when the classroom renderer initializes, not per frame. Dynamic screen/notebook maps update only when content changes.
- Track all owned geometries, textures and materials; dispose with the existing renderer. Merged source geometries are also owned and disposed. No network asset preloading required.
- Registry records source, license/provenance, paths, lifetime and limitations. No unlicensed asset packs, borrowed screenshots or AI concept images as game evidence.

## Quality tiers and consistency

WebGL is primary. Keep a bounded desktop render target and adaptive low tier; record actual target/output sizes and draw calls rather than claiming a device FPS. Mobile uses the same scene with portrait camera presets and bounded render resolution. Canvas fallback keeps coherent palette, architecture cues, same gameplay and input path; it is an illustrated resilience mode, not the same rendering fidelity.

Reduced motion suppresses added atmospheric movement; it must not suppress story progression. Mute must not affect animations or gates. New art cannot alter save schemas, prerequisites, evaluation results, evidence or Founder Reveal.

Chapter 00, menu, 2046 environments, Finale and Galaxy remain outside this art pass. Shared chair/character improvements must preserve identity and rig compatibility; verify Chapter 03 match-cut. Do not spread this pipeline to all chapters before Product Owner review.

## Review contract

Evidence must come from the real game, with fixed viewport, focus and camera metadata: wide, window, workspace, entrance, chair, notebook, portrait and fallback. Keep baseline captures frozen. Include a moving camera/chair/notebook recording with real audio. Performance data is automation-host telemetry, not real-phone certification. Automated PASS validates functionality; visual approval remains with Product Owner.
