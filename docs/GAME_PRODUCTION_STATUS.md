<!-- STORY_V4_N3:START -->
# Story V4 — N3: HUMAN REVIEW và cử chỉ ngồi lại

**53 unit PASS; 5 đường E2E đã xác nhận**, typecheck/lint/build PASS. Lượt đầu 4 PASS / 1 timeout khi ghi/xuất video desktop; đã giảm tải ghi và chạy lại desktop PASS, giữ toàn bộ assertions/deadline gameplay. Menu → Credits PASS; mobile WebGL/Canvas/mute/reduced motion/resume/keyboard PASS. Reveal giữ tại gate cũ, tên An ẩn ở bước align; HUMAN REVIEW không tự động duyệt hỗ trợ. Renderer chỉ đổi chữ; camera/geometry/animation/state/audio giữ nguyên. [Báo cáo](story/N3_RIPPLE_REPORT.md), [runtime](story/n3-proof/review.html), [kết quả tổng hợp](story/n3-proof/final-verification.json). Góc thoại cũ còn bị bàn che; chưa art approval/thiết bị thật. N4 narrative chưa triển khai, không deploy/push.
<!-- STORY_V4_N3:END -->

<!-- STORY_V4_N2:START -->
# Story V4 — N2: nguồn gốc HUMAN REVIEW

**50 unit + 7 E2E PASS**, typecheck/lint/build PASS. AION điều tra nguồn gốc của nguyên tắc đã được kiểm chứng; hai luồng nguyên tắc 2046 / Student07 năm 2026 nối sang N1. Bảy câu giọng dẫn và timing giữ nguyên; kiểm tra runtime xác nhận chỉ người dẫn opening có voice. Menu → Credits, keyboard/resume, mobile/mute/reduced motion và Canvas PASS. Bốn module tương lai đổi nội dung, 74 module khác giữ nguyên. [Báo cáo](story/N2_AION_ORIGIN_REPORT.md), [ảnh runtime](story/n2-proof/review.html). N3/N4 chưa triển khai; điện thoại thật và narrative review chưa xác nhận. Không deploy/push.
<!-- STORY_V4_N2:END -->

<!-- STORY_V4_N1:START -->
# Story V4 — Sprint N0 + N1

**47 unit + 12 E2E PASS**, typecheck/lint/build PASS. Student07 trước An, đề nghị ẩn danh, thoại cô Vân và nguyên tắc REVIEW REQUIRED trên sổ đã chạy. Menu → Credits PASS; mobile/touch/keyboard/Canvas/mute/reduced motion/save-resume đã kiểm tra. 10 bài hồi quy + 2 bài kiểm tra vị trí chữ sau chỉnh trang sổ; chi tiết trong [QA](story/NARRATIVE_QA_REPORT.md), [runtime review](story/proof/review.html), [canon](story/STORY_CANON_V4.md). Save V3 giữ lịch sử đã xác thực, không tự thêm Student07. Chapter00/03/04 chưa chuyển sang V4; N2–N4 chỉ ghi kế hoạch. Chờ Product Owner duyệt narrative; không deploy/push, không mở rộng sprint.
<!-- STORY_V4_N1:END -->

<!-- LAPTOP_FLOW_FIX:START -->
# Sửa đường chọn laptop đầu tiên — 17/11/2026

Observed: bỏ cổng quan sát 3 đồ vật trước khi vào Verdict; laptop đầu tiên hiện CTA ngay. Điều tra 3 bằng chứng vẫn bắt buộc; CTA không phụ thuộc đồ vật đọc cuối. Nhãn không chặn chuột/chạm; cảnh báo đỏ kiểu terminal ở WebGL/Canvas. Verified: **44 unit + 5 E2E PASS**, typecheck/lint/build PASS, menu → Credits không reload giữa chapter; touch/keyboard/mute/reduced motion/resume được kiểm tra trong đường sửa. [Báo cáo](LAPTOP_FLOW_FIX.md), [runtime](laptop-flow-proof/review.html). 45 file cốt truyện/nhân vật/camera/audio/menu được đối chiếu giữ nguyên. Chưa kiểm chứng điện thoại thật/art approval; Gate 3 vẫn đóng.
<!-- LAPTOP_FLOW_FIX:END -->

<!-- CHAIR_CINEMATIC:START -->
# Classroom cinematic — nhịp cô Vân ngồi cạnh An

Observed: insert ghế → cut thấy động tác ngồi → nhịp giữ/push nhẹ → đối thoại bằng shot/cut; tay/gaze liên tục, UI yên hơn. Chỉ 7 câu người dẫn opening có voice. Verified: **43 unit + 30 E2E PASS**, typecheck/lint/build PASS, menu → Credits và Chapter 02 save/resume/replay chạy lại. [Review](chair-cinematic-proof/review.html), [báo cáo](CHAIR_CINEMATIC_PASS.md). Art/thiết bị thật/playtest chờ đánh giá; không mở Gate 3 hay deploy/push.
<!-- CHAIR_CINEMATIC:END -->

<!-- OPENING_REFINEMENT:START -->
# Phạm vi hiện tại — lời dẫn mở đầu, logo và camera lớp học

Đã giới hạn voice vào 7 câu narrator; AION và các nhân vật chỉ phụ đề. Sửa ô trắng quanh logo bằng hình tròn, chỉnh góc cận/hai người và vùng đọc trên desktop/mobile. **41 unit + 27 E2E PASS**, build/typecheck/lint PASS, menu → Credits đã chạy lại. [Nguồn/kết quả](OPENING_AND_CLASSROOM_REFINEMENT.md), [ảnh/video runtime](opening-readability-proof/review.html). Chưa có art approval/điện thoại thật/Safari; Gate 3 vẫn đóng, không deploy/push.
<!-- OPENING_REFINEMENT:END -->

<!-- VOICE_SCHOOL:START -->
# Yêu cầu bổ sung voice / tên trường — 17/11/2026

Observed: 106 đoạn giọng đọc tổng hợp tiếng Việt, nghe/đọc độc lập, dùng chung audio context và nhịp thoại; tên/logo chính thức Trường Đại học Tây Nguyên trong phòng thực hành. Bộ xử lý cốt truyện, tạo hình/camera và motif ghế giữ nguyên.

Verified: typecheck/lint/build, **40 unit + 25 E2E PASS**, menu → Credits với voice bật, video runtime có tiếng 31.2s. [Báo cáo](VOICE_AND_SCHOOL_REPORT.md), [review](voice-school-proof/review.html). Missing: đánh giá giọng bởi người nghe, thiết bị mobile thật/Safari và art approval. Không mở Gate 3, không deploy/push.
<!-- VOICE_SCHOOL:END -->

<!-- G2F1:START -->
# G2F.1 — AION Opening V2

Observed: Citadel, five-level Atrium, Nexus, 53-second narration/choreography and a causal mystery with the existing two-channel/save mechanics. Verified: 36 unit + 47 E2E, typecheck/lint/build PASS; 95/101 baseline files identical. [Runtime review](art/G2F1_REVIEW.html), [report](art/G2F1_IMPLEMENTATION_REPORT.md), [performance](art/G2F1_PERFORMANCE_REPORT.md).

Reported limits: narration is subtitled, staff are distant silhouettes, CPU WebGL is a compatibility tier. Missing: physical phone/Safari/human playtest and Product Owner art approval. No functional blocker found in tested paths. Next task: visual review of G2F.1. **STOP; Gate 3 closed, no deployment/push.**
<!-- G2F1:END -->

# G2F — Opening 2046 / 17 November 2026

Technical checks: typecheck, lint, 36 unit and 47 E2E PASS; build PASS. Runtime [review](art/G2F_REVIEW.html), [report](art/G2F_IMPLEMENTATION_REPORT.md) and [performance](art/G2F_PERFORMANCE_REPORT.md). City→HQ→Core→anomaly→existing classroom is playable. 2026/Main Menu/later art and narrative remain frozen; this does not retroactively approve G2R art.

**Product Owner visual approval pending. Desktop Intel Iris Xe automation measured; physical mobile/human playtest not verified. Gate 3 closed. No deployment/push.**

---

﻿# GAME PRODUCTION STATUS — V4 / GATE 2R ART RESET

Ngày: 16/11/2026. **G0/G1 PASS chức năng; Product Owner đánh FAIL art Gate 2. Gate 2R đang nộp lại hướng Paper & Rain, chờ duyệt art. Gate 3 đóng.** Không khẳng định AAA, release candidate hoặc hiệu năng thiết bị thật.

## Hotfix chữ Việt hiện tại

[Báo cáo và ảnh trước/sau](typography-proof/QA_REPORT.md): thay font serif tiếng Việt bằng Noto Serif đóng gói local, chờ font trước Canvas, giữ grapheme khi wrap/reveal và NFC cho thư sau IME. Root cause được xác nhận bằng font thực dùng của Chromium (Georgia trộn glyph fallback). Bản hotfix PASS typecheck/lint/build, 33 unit và 16 E2E tập trung; không kế thừa 39 E2E cũ như kết quả chạy lại trên hotfix. Gameplay/state/checkpoint và Gate 3 giữ nguyên. Logo tiếng Anh vẫn giữ kiểu chữ cũ.

## Gate 2R — baseline trước hotfix chữ

[Art direction và ba lựa chọn](art2r/ART_DIRECTION.md), [review runtime trước/sau và video](art2r/REVIEW.html), [QA bản reset](art2r/QA_REPORT.md). Dựng lại nhân vật/mặt/trang phục/tay chạm đồ vật, camera cận An và cuốn sổ, treatment màu/ánh sáng và UI classroom. Giữ canon/state/checkpoint/audio/menu. Bản trước reset lưu riêng trong `art2r/proof/before/`. Chỉ mở lại Gate 3 sau khi hero slice được duyệt art; không suy ra từ PASS kỹ thuật.

Bản khóa: lint/typecheck/build, 30 unit, 5 hero, 23 hồi quy game và 11 menu E2E PASS. Start→kết thúc không seed checkpoint PASS. Có 10 ảnh production kiểm tra hash, video WebGL + audio thật 55.701 giây, gallery 15 ảnh đã kiểm tra desktop/mobile, ZIP 13 entry khớp byte. Chỉ 6 source đổi; reducer/motif và toàn bộ source đã test được đối chiếu hash. Cinematic JS 638,427→676,701 bytes (+5.995%). Host SwiftShader warm p50 66.7→116.6 ms, không phải FPS thiết bị thật; chưa xác nhận hiệu năng native/mobile. Art vẫn chờ duyệt, không mở G3 hoặc deploy/push. Chi tiết lỗi UV, native video teardown và khóa file ZIP được giữ trong QA report.

## G2 cũ — lịch sử kỹ thuật, art đã FAIL

[Báo cáo G2](art/G2_REPORT.md), [Art Bible](art/ART_BIBLE_V1.md), [asset registry](art/ASSET_REGISTRY.md), [bộ review trước/sau](art/REVIEW.html). Runtime chỉ đổi WorldRenderer/FallbackWorld và thêm ClassroomArt; giữ menu, canon, save/controller và AudioDirector. Baseline30 unit +23 gameplay +11 menu PASS trước khi sửa runtime. Bản cuối: lint/typecheck/build,30 unit,23 gameplay,5 hero đều PASS; fullgame Start→Credits5.8 phút PASS. Menu ban đầu10/11, sau đó chạy lại nguyên bộ11/11 PASS, không sửa code/assertion/timeout; lỗi đầu được giữ trong báo cáo. Ảnh camera khớp và gallery/video cũng đã kiểm tra. Source hash không đổi sau lúc khóa test. Có tăng chi phí render trên SwiftShader và chưa đo thiết bị thật; art/performance cần review. Không deploy/push hoặc mở rộng G3.

Các mục G0/G1 bên dưới giữ lại làm lịch sử triển khai và bằng chứng trước G2.

## Observed — đã audit/chạy mới trong phiên V4

Đã đọc toàn bộ MASTER_GAME_PRODUCTION_PLAN_V4, STORY_CANON_V3, GAME_DIRECTOR_BIBLE, quy tắc repo và source thực tế. Source đã có Final Act từ Sprint 05; giữ và kiểm chứng phần này, không xây lại menu/Chapters 00–03.

| Hệ | Source-of-truth thực tế | Quan sát |
|---|---|---|
| Entry/menu | main.tsx → menu/GameShell/MainMenu/saveBridge | Start/Continue/settings hoạt động; New Game xác nhận ghi đè; không login |
| Controller | chapter/ChapterGame + chapter/director | rAF, camera, renderer và ChapterAudio dùng chung; không reload theo chapter |
| Save | cinematic/director → readChapter → readVerdict | project2011.cinematic.v3, schema3; nested Stayed/Ripple/Finale version1 |
| Finale entry | VerdictSave.ripple.phase=finale | Phải đủ hai câu hỏi, ba mốc, ba ký ức và Stayed hợp lệ trước begin-finale |
| Completion | FinaleSave.completed | Chỉ đặt sau closing; Continue completed tới ending; xem lại sao không tạo cue lần nữa |
| Thư | finale/letter.ts, key project2011.gratitude.v1 | Tên/lời nhắn tùy chọn, IME, giới hạn60/500 code points; riêng tư, xóa được; không trong save tiến trình/telemetry |
| Render | WorldRenderer → RippleWorld → FinaleVisual; FallbackWorld/Canvas | Cùng canvas cho lớp/lab/finale, camera/props/ánh sáng có phản hồi; fallback không cần WebGL |
| Audio | ChapterAudio kế thừa AudioDirector | Music/Ambience/Foley/Dialogue buses; cue ghế cùng identity/seed; âm tổng hợp local, chưa voice actor |
| Tests active | Vitest + cinematic*.spec.ts + menu-e2e | 30 unit, 23 gameplay, 11 menu; test V2 game/visual/resilience được giữ nhưng không nằm trong suite active |

**Fresh G0:** typecheck/lint/28 unit/build PASS; playthrough từ menu qua 00–03, FINALE_READY tới ending PASS (5.7 phút E2E). Không seed checkpoint cho lượt toàn game. Log/hash riêng: [baseline status](v4-proof/baseline/status.json), [baseline fullgame](v4-proof/baseline/full-game.log).

Không thấy blocker chức năng ngăn vào Finale ở baseline. Tìm được các khoảng thiếu G1 bên dưới và đã xử lý tối thiểu.

## Reported — phân biệt với xác nhận mới

Plan V4 mô tả Chapter04 chưa xác nhận và báo cáo cũ 24 unit/17 gameplay/11 menu. Source Sprint05 có báo cáo 28/21/11 cùng ảnh/video. Đây là lịch sử, không dùng làm PASS mới. Kết quả V4 ở đây đến từ những lệnh/test vừa chạy và log có hash build.

Mục tiêu 10–15 phút, 60FPS desktop/30FPS mobile và các chỉ tiêu playtest trong V4 là giả thuyết/mục tiêu chưa được chứng nhận. Thời lượng E2E gồm automation/ghi hình, không phải số đo người chơi mới.

## G1 — thay đổi đã hoàn thành

1. **F01 focus thực:** ba vật thể hồ sơ2026/ghế/sổ có lựa chọn focus bằng mouse/touch/Tab+Enter. Camera và phụ đề đổi theo vật thể, phản hồi âm giấy/key. Không phát lại full chair cue. Focus là tùy chọn, không thêm bước bắt buộc hoặc thay đổi lịch sử; chọn vật thể mới giữ thêm nhịp quan sát.
2. **Save tương thích:** thêm FinaleSave.memoryFocus nullable, guard theo phase và idempotence. Save Finale cũ thiếu field đọc thành null. Không đổi prerequisite, schema/logic Verdict/Stayed/Ripple hoặc nguồn completed.
3. **Reduced motion:** F05 có khung máy tĩnh/crossfade, 8 thay vì64 spark points; closing không kéo máy dài. Nhánh cinematic thường giữ nguyên. Test so camera ở hai thời điểm transform.
4. **Coverage còn thiếu:** thêm keyboard-only WebGL và touch Canvas fallback qua F01→thư→reload sau starCue→sao→ending→Credits→menu/Continue. Không giữ thư khi bỏ chọn local; không có POST, pageerror hoặc text thư trong telemetry. Reload không phát lại cue.
5. **Tên công khai:** audit phát hiện PROJECT20:11 trong overlay của recording legacy. Đổi đúng một dòng sang THE UNWRITTEN LESSON; giữ ký hiệu ngày20/11 trên giấy. Đã build, retest recording và mở ảnh thật để xác nhận.

F02/F03/F04/F05/F06 hiện hữu được giữ: AION scripted reasoning, tờ giấy in-world, optional/private letter và skip, ink-to-star liên tục, Galaxy có chiều sâu và sao riêng, completed/credits/replay/menu. Không tạo backend/endpoint cộng đồng.

## Lệnh và kết quả thực tế

| Lệnh / nhóm | Kết quả |
|---|---|
| npm run typecheck | PASS G0, G1 và bản copy cuối |
| npm run lint | PASS G0, G1, sau bổ sung Credits test và bản copy cuối |
| npm test | G0 28/28; G1 và cuối **30/30**, 8 files |
| npm run build | PASS; còn Vite warning chunk >500kB, không coi warning là FAIL |
| run-v4-qa.ps1 -Mode Baseline | PASS 1/1 fullgame, 5.7 phút |
| -Mode Gate1: V4 focus/resume | PASS 2/2, 2.4 phút |
| Finale regression | PASS 3/3, 2.5 phút: IME/Unicode/malicious text, reload letter, skip/offline, storage/audio failure |
| Fullgame G1 | PASS 1/1, 6.4 phút: **Start→00→04→Credits**, không checkpoint seed, không reload giữa chapter, save completed |
| Chapter00 | PASS 3/3, 2.5 phút |
| Legacy input/mobile | PASS 3/3, 2.0 phút |
| Ripple | PASS 4/4, 6.4 phút: montage/reveal/chair/Continue |
| Stayed | PASS 3/3, 2.9 phút: notebook/chair/write/mute/reduced/resume/fallback |
| Verdict | PASS 3/3, 3.4 phút: mẫu→An→hai bằng chứng→teacher, mobile/fallback |
| Legacy recording | PASS 1/1, 1.1 phút |
| Menu config | PASS **11/11**, 22.4 giây, gồm5 viewport và keyboard/failure cases |
| -Mode Title sau copy fix | PASS 1/1, 1.1 phút; recording header đã xem ảnh |

**Tổng G1 core: 23/23 gameplay + 11/11 menu.** Runner chạy tuần tự để hạn chế tranh GPU. [Gate1 status](v4-proof/gate1/status.json) complete/passed/exitCode0; từng nhóm có .log cùng folder. Copy fix cuối không sửa logic: đã chạy lại lint/typecheck/30 unit/build và test recording chịu ảnh hưởng; không tuyên bố toàn bộ suite được đo lại trên hash cuối.

Build hash dist/index.html:
- G0: 2BF7C07C388792DE3F69C0028C62955F7F0F388D24C289F4DDE142DBAD2DB47E.
- G1 core: BF77A4C21DAA7F720ACF6190375E18AED7B35021BB47ACB2DF9FFA05132C427F.
- Final copy fix: 04876BA6EAC0AE7B26D67D83666A749A0EDBD5937B33981785FCB8ED71218F19; [title status](v4-proof/title/status.json).

## Bundle / performance baseline

| Chunk | G0 fresh | G1 cuối | So mốc V4 |
|---|---|---|---|
| Cinematic | 605.98 kB / gzip157.81 | **606.62 kB / gzip158.03** | +9.04kB (~1.51%) so597.58; +0.64kB soG0 |
| ChapterGame | 45.00 / gzip15.64 | **45.95 / gzip15.84** | +0.95kB soG0 |

Không thêm dependency hoặc art asset tải ngoài. Stars/particles dùng Points, adaptive rendering và disposal hiện hữu. Headless timings/FPS không thay benchmark thiết bị thật. Không tăng thời lượng thoại để ép mục tiêu 10–15 phút.

## Runtime evidence

- [F01 keyboard/WebGL](v4-proof/runtime/keyboard-memory-chair.png), [touch/Canvas](v4-proof/runtime/touch-memory-chair.png).
- [Reduced motion transform](v4-proof/runtime/keyboard-reduced-transform.png), [sao sau reload](v4-proof/runtime/keyboard-resumed-galaxy.png).
- [Fullgame Credits](v4-proof/runtime/full-game-credits.png), [ending](v4-proof/runtime/full-game-ending.png).
- [Video canvas + master audio](v4-proof/runtime/finale-live-audio.webm): 26.73s, VP8+Opus, max -23.3dB/mean -56.1dB. [Track metadata](v4-proof/runtime/video-tracks.json), [audio analysis](v4-proof/runtime/audio-analysis.txt). Video không chứa HUD/subtitle HTML; ảnh browser có UI. Không dùng ảnh AI giả runtime.
- [Header recording cuối](v4-proof/runtime/legacy-title-final.png). Ảnh đã được mở kiểm tra.
- Telemetry keyboard/touch trong runtime/ không có lời nhắn cá nhân. Nội dung được gõ trong test là dữ liệu QA giả, không dữ liệu người chơi thật.

## File thay đổi V4

Runtime: src/finale/{state.ts,story.ts,FinaleControls.tsx,finale.css,FinaleVisual.ts,Fallback.ts}; dây nối src/chapter/ChapterGame.tsx. Copy đúng một dòng src/cinematic/overlay.ts. Không viết lại Main Menu hoặc logic Chapters00–03.

Tests: tests/finale.test.ts, tests/e2e/cinematic-fullgame.spec.ts; thêm tests/e2e/cinematic-v4.spec.ts và tests/fixtures/finaleReady.ts. Tooling mới scripts/run-v4-qa.ps1 (checkpoint theo hash dist). Docs: status này, README và v4-proof artifacts. Không có Git metadata nên chưa tạo branch/commit.

## Missing / chưa xác minh

- Thiết bị thật/iOS/Safari, loa điện thoại/headphone, long-session heap/GPU profiling, full finale landscape smoke chưa được chứng nhận.
- IME được test bằng composition events trong Chromium, chưa chứng nhận IME hệ điều hành thật.
- Chưa art/acting pass: low-poly/procedural hiện hữu, fallback đồ họa đơn giản; chưa Art Bible/asset registry đầy đủ, chưa G2 hero review hoặc voice acting.
- Chưa playtest người mới (5–8 người), median/P90 pacing, comprehension/emotional callback metrics. Test xanh không phải art approval.
- Community backend/moderation không có và không được yêu cầu. **LOCAL PRIVATE ONLY**, không đăng tự động, không giả hoạt động cộng đồng. Có thể xóa thư; bỏ chọn local chỉ giữ trong phiên.

## Blockers / next tasks / stop rule

Không còn blocker chức năng được quan sát trong phạm vi G0/G1. COPY-01 đã đóng bằng source fix + build/test + ảnh runtime. Production build ở dist/, chưa deploy/push/DNS/credential/chi phí dịch vụ.

**Đóng G0/G1 và dừng thay đổi lớn.** Nhiệm vụ kế tiếp khi có yêu cầu: G2 Art Bible + Classroom17:05 Hero Vertical Slice, đánh giá trên runtime trước khi nhân rộng. Không tự redesign các chapter khác hoặc coi đây là RC/AAA.
