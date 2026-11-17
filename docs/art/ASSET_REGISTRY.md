# G2 asset registry

> Cập nhật 17/11/2026 theo yêu cầu thêm tiếng Việt và nhận diện trường: các dòng G2 bên dưới là lịch sử. Bản hiện tại có hai nguồn mới được ghi dưới đây; không dùng ảnh AI làm bối cảnh.

| ID mới | Asset | Nguồn / quyền / cách dùng |
|---|---|---|
| school.tnu | `public/school/tay-nguyen-university-logo.png` | Website chính thức Trường Đại học Tây Nguyên; logo nguyên bản, quyền của nhà trường, không coi là CC0. Biển hiệu 3D/Canvas. Nguồn/hash trong `public/school/PROVENANCE.txt`. |
| voice.vi | `public/voice/vi/*.mp3` | Giọng tổng hợp offline Piper/VAIS-1000, Michael Hansen/rhasspy; dữ liệu CC BY 4.0. Theo yêu cầu mới chỉ còn 7 câu của người dẫn mở đầu. 99 clip trước chuyển vào lịch sử ngoài production. [Phạm vi hiện tại](../OPENING_AND_CLASSROOM_REFINEMENT.md). |

No externally acquired asset, AI-generated background, paid service or new package is used for this gate. All existing and new room surfaces are code-generated in this repository. Attribution below describes provenance, not a third-party license claim for the repository itself.

| ID | Path / producer | Source / author | License / attribution / restriction | Lifetime / tier |
|---|---|---|---|---|
| room.legacy | `src/cinematic/WorldRenderer.ts` | Existing repository, procedural geometry | Project-owned source; no external attribution required | Baseline, WebGL |
| room.fallback | `src/cinematic/FallbackWorld.ts` | Existing repository, Canvas2D | Project-owned source | WebGL unavailable/context loss |
| props.hero | `WorldRenderer.buildDesk` | Existing repository: laptop, papers, notebook, lamp, mug, pen | Project-owned; on-screen content follows Canon V3 | Geometry + owned CanvasTextures; screen/notebook dynamic |
| character.an / character.van | `WorldRenderer.human` | Existing procedural articulated rig | Project-owned; not external scanned/rigged actors | Shared rig contract; both eras checked |
| chair.stayed | `WorldRenderer.makeChair`, `src/cinematic/motifs.ts` | Existing procedural chair + deterministic cue | Preserve identity, pivot, scale, camera and cue timing | Shared 2026/2046 callback |
| weather.rain | `WorldRenderer.buildRain` | Existing deterministic line geometry | Project-owned | Exterior only; static in reduced motion |
| audio.classroom | `src/cinematic/AudioDirector.ts`, `src/chapter/ChapterAudio.ts` | Existing WebAudio synthesis | No sampled third-party recording or soundtrack | User-gesture unlock; shared context/disposal |
| overlay.text | `src/cinematic/overlay.ts`, story/narrative modules | Existing project Vietnamese copy + browser fonts | Canon text; system Arial/monospace fonts, no bundled font acquisition | Screen/subtitle content stays separate from decorative textures |
| engine.three | npm `three`, installed 0.187.x | Three.js contributors | MIT, existing dependency; addon geometry shares package license | Existing WebGL runtime |

| room.hero.v1 | `src/art/ClassroomArt.ts` | New deterministic project code | Project-owned; no acquired pack/image/attribution dependency | Single geometry LOD, static batching; owned arrays disposed by WorldRenderer |
| surface.wood / floor / paint | `ClassroomArt.map` | Generated strokes/grain/speckle, seed1705 | Original code-native color maps, no photographic input | Shared 512² sRGB maps, repeat wrapping, anisotropy4 |
| surface.fabric | `ClassroomArt.map` | Generated weave | Original code-native | Shared128² sRGB map |
| surface.glazing | `ClassroomArt.build` | Deterministic drawn streaks/droplets | Original transparent surface, not an AI scene backdrop | 512×1024 RGBA, static; original exterior rain animates |
| signage.lab | `ClassroomArt.label` | Project Vietnamese lab text, system Arial | No real institution/brand claim; Canon-safe | Board1024×512, clock/door/instructions512×256, generated once |
| geometry.bevel | `three/addons/geometries/RoundedBoxGeometry.js` | Three.js contributors | MIT, already-installed Three package; license `node_modules/three/LICENSE` | One bevel segment; normalize to non-indexed copies for static merging |
| menu.city (inherited, unchanged) | `public/menu/city-sunset.webp`; source `menu-artifacts/sources/city-sunset.png` | Prior menu asset; conversion recorded in `scripts/encode-menu-assets.mjs` | Original creator/license not documented in the inspected asset notes; release provenance remains to be confirmed | Existing menu only; not used to build the classroom or as runtime evidence |
| menu.desk | `public/menu/desk-laptop.webp` | Built-in imagegen edit of inherited `desk-memory.webp`, 2026-11-17: replaces framed group photo with laptop | Generated edit; inherited surrounding desk art provenance remains as previously recorded. No character identity asserted for the removed photograph | Transparent 1672×941 WebP; SVG laptop fallback; menu only. See `docs/menu-laptop-pass.md` |
| menu.canopy (inherited, unchanged) | `public/menu/canopy.webp`; source `menu-artifacts/sources/canopy.png` | Prior menu asset | Same inherited provenance gap; no new acquisition/reuse in G2 | Existing menu only |

Selected B uses matte diffuse materials; optional A uses restrained specular materials on props with the same geometry. Zero multisamples after the measured software-renderer cost; PCF soft shadow map1024², bounded adaptive render target. No separate normal/roughness texture maps or environment-map downloads. Texture resolution/disposal are explicit; renderer resource counts are diagnostics, not measured GPU memory bytes.

Procedural character limitations and unresolved visual approval are recorded in Art Bible and G2 report. Runtime source files are the asset source of truth. Preview comparison uses `?art=stylized` (default) / `?art=grounded`, affecting rendering only, without changing save/gates. Both use the existing game, not a mockup application.
