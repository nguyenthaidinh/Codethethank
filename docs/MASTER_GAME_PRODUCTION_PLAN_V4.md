# THE UNWRITTEN LESSON
## GAME PRODUCTION MASTER PLAN V4.0 — FROM PLAYABLE PROTOTYPE TO DEFINITIVE EDITION

**Trạng thái:** Baseline kế hoạch / chưa audit source trong phiên này  
**Ngày lập:** 16/11/2026  
**Chủ đề:** Cinematic narrative adventure, environmental storytelling, interactive learning and gratitude  
**Tên công khai:** THE UNWRITTEN LESSON — không hiển thị “PROJECT 20:11” trên giao diện game  
**Nền tảng:** Desktop web và mobile web; **không VR/WebXR**  
**Quy tắc nguồn:** Story Canon V3.0 và các kết quả Sprint 03–04 do người dùng cung cấp là căn cứ. Khi tài liệu mâu thuẫn với thực tế repository, audit và báo cáo sai khác, không tự sửa canon.

---

# 1. Executive Summary

THE UNWRITTEN LESSON kể về năm 2046, khi AION là AI đa năng đứng đầu thế giới hư cấu của trò chơi. Người chơi khám phá nguồn gốc một nguyên tắc quan trọng của AION qua buổi chiều 17:05 năm 2026: An, lúc đó là sinh viên CNTT, bị chính mô hình đánh giá thử nghiệm của mình xếp `NOT RECOMMENDED`; cô Vân không sửa code hộ hay hứa thành công, mà lắng nghe, đặt câu hỏi về mục tiêu của thuật toán và ở lại để An tự tìm hướng đi. An trưởng thành qua nhiều năm nghiên cứu, trở thành nhà sáng lập AION. Motif chiếc ghế được lặp lại giữa hai thời đại để truyền tải ảnh hưởng của sự tin tưởng.

**Tầm nhìn sản phẩm:** Game có môi trường sống, camera có chủ đích, âm thanh theo sự kiện, tương tác mang tính kể chuyện, nhân vật nhất quán và kết thúc chạm cảm xúc. Không sản xuất một website có hình nền và hộp thoại Next.

**Chỉ tiêu trải nghiệm thiết kế (giả thuyết, chưa đo):** tuyến truyện chính 10–15 phút, khám phá tùy chọn thêm thời gian; bản showcase có thể biên tập gọn nhưng không phá logic chương. Thời lượng cuối cùng phải quyết định bằng playtest trên người chơi mới, không ép code để đạt con số.

**Chiến lược:** Hoàn thành Chapter 04 trước để có một game trọn vẹn; khóa kỹ thuật; chọn một phân cảnh hero để nâng cấp mỹ thuật và diễn xuất, đánh giá rồi mới áp dụng art pipeline xuyên game; tiếp theo nâng âm thanh, gameplay feel, accessibility, QA và phát hành.

# 2. Baseline, bằng chứng và giới hạn xác nhận

| Thành phần | Tình trạng theo báo cáo Codex | Việc cần kiểm chứng trực tiếp |
|---|---|---|
| Main Menu | Có Start, Continue, Settings | UI có chiều sâu; action thực; resize; không rò spoiler |
| Chapter 00 | Chơi được, AION 2046, tín hiệu 2026 | Camera, âm thanh, tương tác đầu tiên, tính dễ hiểu |
| Chapter 01 | Chơi được, mô hình đánh giá | Mini-game có agency, rõ logic dự đoán vs hỗ trợ |
| Chapter 02 | Gate 7 PASS theo báo cáo | Motif kéo ghế, sổ 2 trang, save/Continue, diễn xuất |
| Chapter 03 | Gate 9 PASS theo báo cáo | Montage, Founder Reveal, chair match-cut, FINALE_READY |
| Chapter 04 | Có đặc tả Sprint 05, chưa xác nhận code | Xây dựng và E2E end-to-end |
| Rendering | Three.js/WebGL, Canvas fallback | Asset quality, motion, color, performance device thật |
| Audio | AudioDirector, ambience & foley tổng hợp | Độ tự nhiên, mix, headphone/mobile, quyền sử dụng |
| Testing | 24 unit + 17 gameplay E2E + 11 menu E2E theo báo cáo | Chạy lại từ repo, xác minh video/screenshot |

**Giới hạn:** Không có bản audit repository trực tiếp trong tài liệu này. Số lượng test và build là lời báo cáo, không phải chứng nhận độc lập. Không tự coi game đã đạt visual quality vì test pass.

# 3. Product pillars & nguyên tắc sáng tạo

1. **Narrative authenticity:** AION cực mạnh, điềm tĩnh, hiểu giới hạn dự đoán; An không được “cứu” bằng một câu nói; cô Vân có vai trò qua hành động và câu hỏi.
2. **Play, don't click through:** người chơi có hành động điều tra, quan sát, kết nối, thử nghiệm, tái dựng. Mỗi tương tác có điều kiện, feedback và hệ quả narrative.
3. **Cinematic restraint:** ánh sáng, blocking, camera, nhạc nền và khoảng lặng có dụng ý. Không lạm dụng glitch, neon tím, HUD khổng lồ, text explanation.
4. **Cohesive world:** 2026 gần gũi, thực; 2046 công nghệ tiên tiến nhưng có vật liệu, kiến trúc, scale và chuyển động có lý; hai thời đại chung motif.
5. **Inclusive & resilient:** âm thanh không được là điều kiện duy nhất để hiểu game; phụ đề, touch, keyboard, reduced motion, save, fallback hoạt động.
6. **Privacy by design:** lời tri ân mặc định riêng tư; chỉ công khai khi có opt-in, backend kiểm duyệt và thông báo trạng thái đúng sự thật.

## Core gameplay loop

**Notice → Inspect → Infer → Act → Witness → Remember.** Mọi chương nên có tối thiểu một hành động khám phá tự chủ, một điều kiện mở khóa có ý nghĩa và một phản hồi môi trường/camera/âm thanh rõ ràng. Không cần thêm hệ thống điểm, chiến đấu, inventory phức tạp hay morality meter.

## Narrative canon — các điều cấm phá

- 2026 là **prototype của An**, không phải AION.
- Thời khắc cuộc gặp là **17:05**, khoảng tan học. “20:11” chỉ là mã nội bộ/ngày 20/11, không đưa thành tên thương mại công khai.
- **Founder An** chỉ lộ đúng cú twist ở Chapter 03, không bị spoiler từ menu, file hình, credits hoặc UI.
- Dự đoán tốt trên một chỉ số không cho quyền phán quyết về giá trị/tương lai con người; không truyền tải “AI vô ích” hay “được cô động viên là chắc chắn thành công”.
- Người chơi **không thay đổi lịch sử**, chỉ phục hồi, kết nối và hiểu ký ức.
- Không có VR/WebXR, không đăng nhập bắt buộc, không tự đăng lời nhắn công khai.

# 4. Phạm vi sản phẩm — Feature matrix

| Mức | Nhóm tính năng | Yêu cầu |
|---|---|---|
| P0 | Full story | Main Menu + Chapters 00–04 + Credits + Replay, không dead-end |
| P0 | Scene continuity | Không reload giữa chương, save/Continue nhất quán, đúng story prerequisites |
| P0 | Finale | Trang giấy, lời nhắn tùy chọn, ink-to-star, không gian kết và trạng thái Completed |
| P0 | Baseline QA | Desktop, mobile emulation, keyboard, touch, fallback, build, unit/E2E |
| P1 | Hero art slice | 2026 classroom đầy đủ vật liệu, lighting, props, camera, characters |
| P1 | Character polish | Rig hoặc animation có chuyển trọng tâm, ánh mắt, cử chỉ, blocking |
| P1 | Cinematic pass | Opening AION, 17:05, chair motif, founder reveal, finale có shotlist và timing |
| P1 | Sound pass | Ambience chuyển lớp, Foley vật lý, mix, soundtrack riêng hợp lệ |
| P1 | Gamefeel | Hit feedback, camera focus, hints, pacing, onboarding không rườm rà |
| P1 | Usability/performance | Mobile thật, Safari, reduced motion, WebGL failure, long session |
| P2 | Community Galaxy | Backend, moderation, opt-in publish, rate limit, report/remove flow |
| P2 | Localization | Tiếng Anh đầy đủ; chỉ bật khi copy, phụ đề, UI đã QA |
| P2 | Voice acting | Lồng tiếng tiếng Việt bằng diễn viên/nguồn được phép, QC phát âm |
| P2 | Showcase mode | Kịch bản demo rút gọn; không được hủy integrity của game chính |

# 5. Workstream A — Chapter 04 / The Final Act

**Đầu vào bắt buộc:** checkpoint `ripple.phase = finale` / FINALE_READY và nested save hợp lệ. Không mở đường tắt phá preconditions.

| Beat | Trải nghiệm game | Tương tác và outcome |
|---|---|---|
| F01 Last Memory | Notebook, hồ sơ, chiếc ghế xuất hiện qua camera trong lab | Người chơi focus ký ức, không chỉ xem recap |
| F02 The Lesson | AION xác nhận giới hạn của phán quyết dự đoán | 2–3 câu thoại ngắn, tránh giảng đạo |
| F03 The Question | Tờ giấy trắng là điểm dừng tĩnh, camera hướng về trang | Người chơi quyết định viết hoặc bỏ qua |
| F04 A Letter Never Sent | Tương tác trên giấy; nhập tiếng Việt Unicode/IME | Tên người nhận và lời nhắn tùy chọn; private default |
| F05 Ink to Star | Nét chữ/ánh sáng chuyển động liên tục theo camera | Star chỉ tạo theo nội dung thực có; skip không sinh lời giả |
| F06 Galaxy & Ending | Không gian game có chiều sâu; sao người chơi có focus | Xem lại nội dung cục bộ, menu, chơi lại, credits |

**F04 Data rules:** Trường optional; giới hạn độ dài phù hợp; hỗ trợ Unicode và nhập dấu khi IME đang composition; kiểm tra text trống, line-wrap, escape khi render; không nhét nội dung riêng tư vào telemetry; bản lưu cục bộ có thao tác xóa. Nếu chưa có backend, chỉ lưu/hiển thị cục bộ và không nhận là đã được đăng công khai.

**F05 Cinematic:** giấy là vật thật trong scene → bút dừng → âm thanh môi trường hạ → vệt sáng tách chữ → camera theo vệt → mở không gian sao. Phải có bản reduced-motion/fallback có cùng ý nghĩa.

**F06 Completion contract:** `gameCompleted=true` chỉ xảy ra sau chuỗi kết hợp lệ; Continue sau hoàn thành đưa tới ending hoặc menu theo hành vi định nghĩa; New Game phải hỏi xác nhận trước khi ghi đè save; Replay không gửi lại lời nhắn.

**Definition of Done A:** 1 lượt chơi từ Start đến Credits hoàn chỉnh; test bỏ qua thư; test letter unicode; test reload giữa transition; không phải chỉ screenshot.

# 6. Workstream B — Art Direction / World Building

## 6.1 Art Bible trước khi vẽ lại toàn bộ

Codex/nhóm art tự quyết phong cách sau khi so sánh tối thiểu hai phương án có build chạy. Cần tạo **Art Bible V1** gồm: visual pillars, color tokens theo thời đại, material library, lighting ratios, proportions/scale, asset naming, environment mood, quality tiers, UI overlay rules và danh sách điều cấm.

**Định hướng:** 2026 thật, gần gũi; chiều muộn vàng lạnh xen ánh mưa, bàn gỗ, cửa kính, quạt, laptop, vết bút. 2046: tinh tế, quy mô, vật liệu kim loại/kính/bê tông và ánh sáng có điểm nhấn; tránh “hologram khắp mọi nơi”. Không hardcode tím tím theo ảnh AI tạo trước. Galaxy: không gian giàu chiều sâu, chủ đạo cảm xúc, không giống màn hình dashboard sao.

## 6.2 Chọn hero vertical slice

**Ưu tiên classroom 17:05 (Chapter 01–02)** để làm chuẩn chất lượng: môi trường có cửa sổ mưa, props thật, cô Vân kéo ghế, notebook có tương tác, An có cử chỉ, audio chiều mưa, camera dolly/close-up và gameplay đủ. Đánh giá bằng bản chạy màn hình, không dùng concept image thay thế.

Nếu hero slice không đạt, **không nhân rộng** pipeline cho ba chương còn lại. Điều chỉnh trước.

## 6.3 Scene-specific improvements

| Scene | Art & environment goals | Signature shot |
|---|---|---|
| Main Menu | Trụ sở AION nhìn từ không gian có chuyện kể, menu tối giản | Slow idle camera, không lộ Founder |
| Chapter 00 | Hội nghị AION thể hiện quy mô qua camera, đám đông, staging | Reveal AION → abnormal signal |
| Chapter 01 | Lớp học sống, học liệu, vật thể điều tra có affordance | Laptop evaluation / `NOT RECOMMENDED` |
| Chapter 02 | Bối cảnh liên tục, hành động kéo ghế đáng nhớ | Chair insert + quiet dialogue |
| Chapter 03 | Montage nhiều năm, lab 2046 rõ tính chất công việc | Founder reveal + 2026/2046 match-cut |
| Chapter 04 | Không gian kết có chiều sâu nhưng không phô diễn VFX quá mức | Ink-to-star, star reveal |

**Asset pipeline:** Asset Registry (ID, path, source/license, LOD, owner, target size), hierarchy rõ, prefetch từng chapter, cleanup/dispose mesh/textures/material, kiểm tra color space và tone mapping, performance profiles. Không lấy ngẫu nhiên ảnh/video không rõ giấy phép hoặc nhãn hiệu thật.

# 7. Workstream C — Characters, Acting & Camera

**Nhân vật:** An 2026, An 2046, cô Vân, nhà nghiên cứu trẻ; nhân vật phụ hội nghị ở silhouette hoặc low-cost representations. Khóa silhouette/height/proportions, màu tóc/trang phục, dấu hiệu nhận dạng xuyên thời gian, không để An 2046 trở thành một người khác.

**Animation cần ưu tiên:** idle có breathing/weight-shift; quay đầu về nguồn âm; tay chạm laptop, nhấc bút, đẩy cuốn sổ; cô Vân kéo ghế, ngồi xuống; An 2046 tái hiện hành động; ánh mắt và khoảng lặng tự nhiên. Không nhất thiết facial mocap nếu đầu tư body language tốt.

**Camera language:** shot identifiers + shotlist riêng; fixed composition cho chair match-cut; tránh camera luôn di chuyển; không làm motion gây buồn nôn; cut phải có điểm nhìn; các đoạn người chơi tương tác phải trao lại camera control đúng lúc.

**Gate chất lượng:** Một người chưa biết cốt truyện xem cảnh chair 2026 và 2046 (không phụ đề) vẫn nhận ra hành động được lặp lại có chủ đích. Khác biệt thời đại rõ, cảm xúc không phụ thuộc vào thoại dài.

# 8. Workstream D — Audio & Music

**Sound Bible:** bốn bus Music / Ambience / Foley-SFX / Voice; gain và ducking theo dialogue/camera; âm riêng cho 2026 (mưa, quạt, hành lang, giấy, bút, ghế) và 2046 (lab, sân khấu, city); transition có bridge, không chuyển layer đột ngột.

**Motif xuyên game:** chair `chair.the-one-who-stayed` phải giữ cùng cue identity; có thể thay buffer tổng hợp bằng foley thu thật, nhưng đảm bảo sync, deterministic replay và e2e không phá. Rain từ hội trường sang ký ức mở đầu; pen/notebook trở lại finale.

**Âm nhạc:** theme chính ít nốt có thể biến tấu các thời đại; 2026 piano/ambient ấm, 2046 texture tối giản; không lạm dụng swell cảm xúc. Tác phẩm/asset phải tự sáng tác hoặc có quyền phù hợp. Lồng tiếng là giai đoạn riêng, không giả vờ đã có nếu chỉ là subtitle.

**QA âm thanh:** mute không chặn tiến trình; không duplicate AudioContext/cue sau Continue; kiểm tra headset/mobile speaker; hỗ trợ subtitles; nghe thử ở âm lượng thấp; bảo đảm SFX chair không quá chói.

# 9. Workstream E — Gameplay & UX Deepening

| Hệ | Hiện có | Nâng cấp cần làm | Tiêu chí |
|---|---|---|---|
| Exploration | Focus objects | Affordance bằng ánh sáng/cử chỉ, không icon khắp nơi | Người mới biết thử thao tác trong 20–30s |
| Evaluation | Chạy mô hình, bằng chứng | Giải thích rõ mục tiêu và giới hạn, kết quả có nguyên nhân | Không nhầm `NOT RECOMMENDED` là điểm giá trị con người |
| Notebook | Hai trang, dòng viết | Page-turn tactile, phản hồi âm/giấy/pen, hint tinh tế | Mouse/touch/keyboard đều xong |
| Montage | Quan sát 3 vật thể | Nhịp thời gian đa dạng, vật thể có ý nghĩa thay vì timeline | Người chơi kể lại 3 mốc chính |
| Chair | Match-cut có motif | Tối ưu blocking, acting, sync nhạc | Người chơi nhận ra callback |
| Gratitude | Đang thiết kế | Lời nhắn tùy chọn, biến nét mực thành sao | Không bế tắc nếu skip/offline |

**UX rules:** Không dùng điểm empathy, sao thưởng, vòng quay, các game mechanic lạc tông. Hint nhẹ nếu không tiến triển; không để required hitbox quá nhỏ; ưu tiên affordance tự nhiên. Mỗi tương tác cần feedback trong khoảng một nhịp ngắn, không giới hạn thái quá bằng animation.

**Pacing pass:** phân biệt thời gian cinematic có thể skip, tương tác bắt buộc và khám phá phụ. Sau full story, đo median/P90 first-time completion; nếu quá dài, sửa điểm nghẽn thật chứ không ép thời gian thoại.

# 10. Technical Architecture & Engineering Rules

Theo báo cáo hệ thống có React + TypeScript + Vite, Three.js, WorldRenderer/FallbackWorld, AudioDirector, ChapterGame, saved nested VerdictSave/Stayed/Ripple, Vitest và Playwright. **Không viết lại lõi nếu không có bằng chứng kỹ thuật bắt buộc**.

## Module boundaries đề xuất

- `story/`: canon, script, localized lines, beat/shot IDs (đường dẫn thực tế kiểm từ repo).
- `game/`: chapter state transitions, checkpoints, guard/validation.
- `world/`: 3D scenes, fallback, asset registry, camera/lighting.
- `interaction/`: raycast/hit areas, focus, input, hints.
- `audio/`: buses, cues, scheduling, narration/subtitles.
- `ui/`: menu, captions, settings, contextual overlays, accessibility.
- `finale/`: letter state, private local draft, star scene, optional community adapter.
- `tests/`: unit, integration, E2E, screenshots, performance traces.

Đây là **logical boundaries**, không bắt Codex chuyển hết cấu trúc folder đang có. Đặt theo code hiện hữu và ưu tiên incremental migration.

## Checkpoint contract

Lưu `schemaVersion`, `chapter`, `phase`, prerequisite milestones, seen cue IDs, elapsed hợp lệ; validate theo phase, chống skip, chống double event, idempotent write; có chiến lược migrate save cũ; không ghi lời cảm ơn vào analytics; test reload mid-cut/mid-input/mid-audio.

## Performance budget (mục tiêu cần benchmark, không phải số hiện đạt)

- Desktop cấu hình trung bình: target 60 FPS khi gameplay (p95 frame time < 25ms nếu khả thi).
- Mobile tầm trung: target 30 FPS ổn định trong cảnh nặng; giảm shadow/particles/LOD tự động.
- Không có loading trắng/đen vô thời hạn; preloading & progress có retry/fallback.
- Đo bundle size baseline ~597.58 kB cinematic ungzip theo báo cáo Sprint 04; mọi thay đổi lớn phải so sánh, không áp trần tùy tiện.
- Test long session, memory leak, renderer resource cleanup, audio graph cleanup và focus/resume.

# 11. Production Roadmap — theo Quality Gates, không ép ngày

| Gate | Hạng mục | Deliverable | Quyết định Go/No-Go |
|---|---|---|---|
| G0 | Source Audit | Architecture map, current evidence, issue register, performance baseline | Chạy lại tests và chơi Chapters 00–03 |
| G1 | Final Act | Chapter 04 + ending + completion save | Full-flow từ Start tới Credits qua desktop và fallback |
| G2 | Art Bible + Hero Slice | Art Bible, asset register, classroom 17:05 visual pass | Nhóm duyệt bản chạy, không duyệt chỉ screenshot |
| G3 | Character / Camera | Character bible, acting, shotlist, chair match-cut | Motif rõ khi bỏ phụ đề, không phá input |
| G4 | Sound / Music | Sound Bible, mixes, sound bridge, chair Foley | Headphone/mobile QA; mute/subtitles hoạt động |
| G5 | Gameplay Pass | Better affordance, hit feedback, hints, pacing | Playtest task success, không dead-end |
| G6 | Whole Game Polish | Chapters 00–04 thống nhất art/camera/audio | Không còn cảnh lệch phong cách, FPS chấp nhận |
| G7 | Usability & Accessibility | Test report desktop/mobile/Safari/fallback | Không blocker, save/resume đạt |
| G8 | Release Candidate | Build, credits, licenses, release notes, trailer/screenshots thật | Regression pass, ký RC tag, rollback sẵn |

**Không được bỏ gate chỉ vì đã có pass unit/E2E cũ.** Test kỹ thuật và game quality có tiêu chí riêng.

# 12. Task Backlog ưu tiên

| ID | Ưu tiên | Công việc | Dependency | Evidence of Done |
|---|---|---|---|---|
| AUD-01 | P0 | Audit full repo, reproducible build | Không | Report + typecheck/lint/test/build |
| AUD-02 | P0 | Audit save / chapter transitions / old checkpoints | AUD-01 | Save compatibility matrix |
| FIN-01 | P0 | Entry từ FINALE_READY | AUD-02 | E2E transition |
| FIN-02 | P0 | AION final narrative | FIN-01 | Scene playable, canonical lines |
| FIN-03 | P0 | Letter input / IME / skip / private | FIN-02 | Unicode & privacy tests |
| FIN-04 | P0 | Ink-to-star / reduced motion fallback | FIN-03 | Runtime clip + E2E |
| FIN-05 | P0 | Galaxy / completed / credits / replay | FIN-04 | Full-play E2E |
| ART-01 | P1 | Art Bible + style variants | FIN-05 | Approved tokens/environment guide |
| ART-02 | P1 | Asset audit & licensing | ART-01 | Asset registry |
| ART-03 | P1 | Classroom 17:05 hero environment | ART-02 | Runtime review + performance |
| CHR-01 | P1 | Character bible & silhouettes | ART-01 | Character sheets + game renders |
| CHR-02 | P1 | Chair acting + pose continuity | CHR-01, ART-03 | Side-by-side runtime recording |
| CAM-01 | P1 | Cinematic shotlist + camera pass | ART-03 | Shot state map + QA |
| AUDI-01 | P1 | Sound Bible + audio bus audit | AUD-01 | Cue map + baseline mix |
| AUDI-02 | P1 | Licensed Foley & chair cue refinement | AUDI-01, CHR-02 | Verified chair sync & save |
| PLAY-01 | P1 | Interaction affordance/hints | FIN-05 | Novice playtest |
| PLAY-02 | P1 | Evaluation mechanic clarity | PLAY-01 | Comprehension test |
| PLAY-03 | P1 | Pacing / exploration rework | PLAY-02 | Measured playthrough |
| QA-01 | P0/P1 | Full chapter E2E + accessibility matrix | FIN-05 | Passed regression and blockers resolved |
| QA-02 | P1 | Device testing Windows/macOS/iOS/Android | G6 | Device log/screens/videos |
| PERF-01 | P1 | Scene profiling + GPU degradation | G6 | Frame-time & memory comparison |
| REL-01 | P1 | Credits, licenses, documentation, release build | QA-01, QA-02 | Signed-off RC |
| COM-01 | P2 | Community publishing & moderation, opt-in | FIN-05 | End-to-end moderation + privacy |

# 13. Test Strategy & Definition of Done

**Hai tuyến đánh giá độc lập:**

- **Technical QA:** types, lint, unit, E2E, Save/Continue, camera and audio cleanup, low quality fallback, errors, asset license and release.
- **Experience QA:** understanding story, noticing clues, emotional engagement, action feedback, cinematic pacing, coherence of visual world, ease of controlling the game.

## Ma trận kiểm thử quan trọng

1. New Game / Continue / restart after completion; save schema malformed; legacy save migrate.
2. Reload trong chapter 02 notebook, chapter 03 chair callback, finale handwriting/ink-to-star.
3. Input desktop mouse + keyboard, mobile touch + keyboard fallback, IME tiếng Việt, viewport 390px, landscape.
4. Mute từ đầu, bật âm sau Start, hệ thống autoplay restriction; audio context suspension/resume.
5. WebGL disabled, GPU thấp, reduced motion, subtitles off/on, keyboard focus rõ.
6. Mất network ở Finale: thư vẫn hoàn thành riêng tư, không báo “đăng thành công”.
7. XSS/HTML injection trong lời nhắn, nội dung quá dài, emoji, newline, spam/công khai nếu backend có.
8. Time spent, player deaths/stalls = không có dead-end; scene prompt không leak Founder trước reveal.
9. Assets render đúng, camera không xuyên mesh, animation không bị reset, FPS và memory ổn định trên thiết bị thật.
10. Complete story flow, tất cả credits/attributions và link quay lại menu có thể truy cập.

## Đánh giá playtest đề xuất (mục tiêu nội bộ, không phải kết quả)

- 5–8 người chưa biết game chơi độc lập trên thiết bị khác nhau.
- Ít nhất 80% tự hiểu thao tác điều tra ban đầu mà không cần người hướng dẫn.
- Ít nhất 80% kể lại đúng vì sao kết quả `NOT RECOMMENDED` có giới hạn.
- Ít nhất 80% nhận ra mối liên hệ giữa hành động kéo ghế 2026–2046.
- Người chơi phân biệt rõ An thành công nhờ nỗ lực dài hạn chứ không vì được “tiên tri”.
- Thu video/notes (có đồng ý), quan sát điểm dừng/hẫng; sửa vấn đề lặp lại trước khi tinh chỉnh hiệu ứng phụ.

**Definition of Done cho từng task:** code + tests phù hợp + cảnh thật hoạt động + bản ghi bằng chứng + không regressions + mô tả limitation + cập nhật tài liệu liên quan. Screenshot đơn lẻ không chứng minh gameplay hoàn thành.

# 14. Rủi ro & quyết định giảm thiểu

| Risk | Impact | Mitigation |
|---|---|---|
| Polish rải khắp game, không scene nào đạt chuẩn | Cao | Hero slice trước, art freeze khi đạt gate |
| Thay renderer phá các chapter đã test | Cao | Incremental adapter, automated regression & rollback |
| Nhân vật low-poly thiếu cảm xúc | Cao | Ưu tiên acting/chair/camera/sound trước facial tech |
| Game giống web nhiều UI | Cao | Overlay contextual only; gameplay in-world |
| Finale thành form gửi tin nhắn | Cao | Paper as object, cinematic ink-to-star, skip path |
| Người chơi không hiểu thuật toán | Cao | Giải thích bằng tương tác + human review, not wall of text |
| Thời lượng/kịch bản quá chậm | Trung bình | First-time playtest, cut exposition not meaningful actions |
| Assets không rõ bản quyền | Cao | Asset registry/license approval, original music/assets |
| Mobile Safari/WebGL lỗi | Cao | Real-device smoke, fallback, quality profiles |
| Dữ liệu lời nhắn riêng tư rò rỉ | Cao | Private by default, no analytics content, opt-in & moderation |
| AI outputs sai canon | Trung bình | AION scripted core; generative optional, bounded |

# 15. Phân công triển khai thực tế

Nếu phát triển một người với Codex, tổ chức vai trò như sau:

- **Product Owner / Creative Director (người dùng):** chốt canon, đánh giá cảm xúc, duyệt lựa chọn mỹ thuật, thứ tự ưu tiên, ký nghiệm thu.
- **Codex — Engineering collaborator:** audit, đề xuất kỹ thuật, implement, tests, tài liệu, reproducible evidence; không tự tuyên bố art approved.
- **Playtesters độc lập:** thử game không được hướng dẫn trước, quan sát, góp ý trên câu chuyện/gamefeel.
- **Tài sản ngoài (khi cần):** họa sĩ/3D artist, animator, sound designer, voice actor; chỉ tham gia nếu thực sự có người đảm nhận, không giả định sẵn đội ngũ.

**Working agreements:** mỗi gate một branch/commit khi có Git; report thay đổi file và khả năng rollback; tài liệu `CURRENT_STATUS.md`; bàn giao video/canvas runtime; xác định trước xem thay thế asset có bản quyền hay chưa.

# 16. Chốt kế hoạch thực thi ngay

**Bước 1 — G0 Source Audit:** Codex đọc source và chạy lại tests, xác minh finale entry. Tạo `GAME_PRODUCTION_STATUS.md` cùng baseline, risks, blockers. Không bắt đầu redesign toàn game trước khi có baseline.

**Bước 2 — G1 Final Act:** triển khai Chapter 04 thành game có playable full flow, riêng tư mặc định, end credits và save completed. QA E2E và keyboard/touch/fallback.

**Bước 3 — G2 Art Bible + Classroom Hero Slice:** chỉ sau khi game đã có ending; dựng bản chất lượng cao phòng học 17:05 bằng runtime thật, rồi nghiệm thu rồi mới nhân rộng.

**Bước 4 — G3–G8:** nhân vật, cinematics, sound, gameplay feeling, full QA, release candidate.

**Quy tắc điều hành:** ưu tiên tính nhất quán và trải nghiệm người chơi; không làm theo lịch cứng. Mỗi gate phải có deliverable kiểm chứng được và quyết định Go / Rework / Blocked.
