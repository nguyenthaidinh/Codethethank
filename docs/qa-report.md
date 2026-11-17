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
# Laptop-first + terminal đỏ — 17/11/2026

**44/44 unit + 5/5 E2E PASS**, typecheck/lint/build PASS; zero skipped/flaky/unexpected. Bản build cuối đã chạy menu → Credits (4.9 phút), laptop đầu tiên với chuột/touch/keyboard, reload checkpoint, thứ tự bằng chứng khác nhau, An chỉ mở sau hồ sơ mẫu, màu chữ thực tế trên WebGL/Canvas, mute/reduced motion. [Lệnh, thay đổi và giới hạn](LAPTOP_FLOW_FIX.md), [JSON cuối](laptop-flow-proof/final-verification.json), [ảnh/video runtime](laptop-flow-proof/review.html). Lần debug đầu phát hiện nhãn chặn click, đã sửa và chạy lại; không tính lần đó là PASS. Điện thoại thật và art review chưa kiểm chứng. Các số liệu bên dưới thuộc những lượt trước.
<!-- LAPTOP_FLOW_FIX:END -->

<!-- CHAIR_CINEMATIC:START -->
# Cô Vân ngồi lại — 17/11/2026

**43 unit + 30 E2E PASS**, typecheck/lint/build PASS. Cut từ insert ghế sang động tác ngồi và khung hai người đã được kiểm tra desktop/mobile/Canvas; có kiểm tra laptop che mặt, vị trí phụ đề, cue ghế một lần, keyboard/touch và narrator-only opening. Menu → Credits và Chapter 02 save/resume/replay đã chạy lại. [Báo cáo](CHAIR_CINEMATIC_PASS.md), [runtime](chair-cinematic-proof/review.html). Thiết bị thật/human art review chưa kiểm chứng.
<!-- CHAIR_CINEMATIC:END -->

<!-- OPENING_REFINEMENT:START -->
# Chỉ dẫn mở đầu + lớp học đọc phụ đề

17/11/2026: **41 unit + 27 E2E PASS**, typecheck/lint/build PASS. Bảy câu narrator, không có giọng ở AION/2026/conversation. Logo tròn và góc thoại/UI đã kiểm tra runtime desktop/mobile emulation. [Báo cáo hiện tại](OPENING_AND_CLASSROOM_REFINEMENT.md), [review](opening-readability-proof/review.html). Các báo cáo 106 clip dưới đây là lịch sử.
<!-- OPENING_REFINEMENT:END -->

<!-- VOICE_SCHOOL:START -->
# Tiếng Việt + Trường Đại học Tây Nguyên — 17/11/2026

Typecheck/lint/build, **40 unit + 25 E2E PASS** (14 gameplay có voice và hồi quy, 11 menu). Menu → Credits với voice bật đã chạy thật. Lỗi tải MP3 vẫn chơi bằng phụ đề. Mute/pause/touch/Canvas/reduced motion/IME/resume đã kiểm tra; điện thoại thật và chất lượng nghe do người đánh giá chưa kiểm chứng. [Báo cáo và lệnh](VOICE_AND_SCHOOL_REPORT.md), [video/review](voice-school-proof/review.html). Các kết quả G2F.1 bên dưới là lịch sử.
<!-- VOICE_SCHOOL:END -->

<!-- G2F1:START -->
# G2F.1 — functional QA

Typecheck/lint/build, 36 unit tests and 47 E2E PASS (36 gameplay + 11 menu, zero skipped/flaky/unexpected). Exact commands, source integrity, media and limitations: [implementation](art/G2F1_IMPLEMENTATION_REPORT.md), [performance](art/G2F1_PERFORMANCE_REPORT.md). Art approval and physical phone/human playtest remain pending.
<!-- G2F1:END -->

# G2F technical QA — 2026-11-17

36 unit + 47 E2E PASS. Typecheck, lint and build PASS. See [exact commands, results, evidence and limits](art/G2F_IMPLEMENTATION_REPORT.md) and [measured performance](art/G2F_PERFORMANCE_REPORT.md). Art approval remains pending; no physical phone/human playtest certification.

---

# QA — cinematic proof-of-feel S02–S03

> Bản hiện tại — **Gate 2R art reset**: xem [QA_REPORT.md](art2r/QA_REPORT.md), [art direction](art2r/ART_DIRECTION.md) và [ảnh/video runtime](art2r/REVIEW.html). Lint/typecheck/build, 30 unit và 39 E2E PASS; art chờ Product Owner, Gate 3 đóng. Hiệu năng thiết bị thật chưa được xác nhận. Phần dưới là lịch sử legacy.

> Sprint 02 trước đây: xem [chapter-01-qa.md](chapter-01-qa.md) cho Chapter 01 và hồi quy.

> Cập nhật Sprint 01: Chapter 00 đã được thêm trước S02–S03. Báo cáo mới và kết quả hồi quy ở [chapter-00-qa.md](chapter-00-qa.md). Phần dưới giữ lịch sử proof-of-feel.

Ngày: 16/11/2026. Môi trường: Windows, Node 22.18, Vite, Playwright Chromium headless. Đây là báo cáo **phân cảnh V3**, không phải chứng nhận hoàn tất game 7 cảnh hoặc kiểm thử toàn bộ menu đang được phát triển đồng thời.

## Phạm vi đã thực thi

- Giữ dữ liệu canon/state V2 để tham chiếu; entry hiện giữ menu mới và runtime cinematic. `/?qa=1` vào thẳng phân cảnh; `/?record=1` ghi demo.
- Phòng lab 3D procedural, camera từ cửa/đến laptop/cửa sổ/ghế/nhân vật/tờ giấy; render thích ứng, fallback Canvas 2D khi GPU lỗi.
- Quan sát laptop và báo cáo ngay trong thế giới; hai props cung cấp mục tiêu, danh sách bị loại và giới hạn hỗ trợ. Không card điều tra/Next.
- Cô Vân vào, kéo ghế, ngồi lại; hồ sơ An chọn bằng chạm hoặc kéo vào laptop; kết quả `NOT RECOMMENDED` trên màn hình máy thật.
- Audio opt-in: mưa, quạt, chuông, cửa, bước chân, ghế, phím, verdict và vài nốt thưa; mix đổi theo focus. Duck ambience xuống 0.18 ở verdict, giữ khoảng lặng; cue ghế/verdict đúng một lần.
- Phụ đề ngắn, mute, volume/music/SFX, reduced motion, pause/keyboard, save/resume phiên bản riêng, thông báo storage/audio/GPU lỗi trung thực.

## Lệnh và kết quả thực

| Lệnh | Kết quả |
|---|---|
| `npm run lint` | PASS |
| `npm run typecheck` | PASS sau khi thêm `src/vite-env.d.ts` cho khai báo Vite dùng bởi menu |
| `npm test` | PASS, 10 tests / 3 files tại lần chạy cuối (gồm 3 test menu được thêm đồng thời) |
| `npm run build` | PASS; có cảnh báo chunk cinematic >500 kB chưa nén, khoảng 146 kB gzip sau lazy load |
| `npm run test:e2e -- --trace off` | PASS, 4/4; 3.3 phút. Desktop normal click/audio/recording, mobile 390 tap/resume, 360 GPU/audio/storage fallback, desktop drag/keyboard/offline |
| `npx playwright test cinematic.spec --trace off` | PASS, 1/1 sau điều chỉnh góc camera cửa; đã ghi lại video desktop |
| `npm audit` | 0 vulnerabilities tại lần chạy |
| FFprobe / FFmpeg `volumedetect` | MP4 có H.264 + AAC stereo 48 kHz, không phải track rỗng; có trích khung hình để xem lại |

Các lần FAIL trong quá trình sửa không được tính là PASS: timeline chậm theo FPS; hotspot chưa ổn định khi xuất hiện; forced click trong lúc camera di chuyển; cue phát lặp do reset beat sau RAF. Đã sửa đồng hồ theo thời gian thực, camera tween hữu hạn, khởi tạo tọa độ hotspot ngay, dùng click thường và reset beat bằng layout effect. Đã thêm assertion mỗi cue ghế/verdict chỉ xuất hiện một lần. Một build trúng lúc tác vụ menu đang ghi thiếu `menu.css` đã bị loại khỏi kết quả QA; không dùng test trên build cũ để chứng nhận build đó.

## Bằng chứng

- `proof-of-feel/desktop-with-audio.webm`: bản ghi đầy đủ từ canvas game và master bus Web Audio thật.
- `proof-of-feel/proof-60s.mp4`: trích 60 giây từ bản ghi; không tạo thêm frame AI hay ghép soundtrack ngoài.
- `proof-of-feel/mobile-muted.webm`: chứng cứ mobile tap/reduced motion, cố ý không có audio track.
- `proof-of-feel/01-room-desktop.png` … `06-stay.png`: ảnh browser thực.
- `proof-of-feel/mobile-390-profile.png`, `mobile-390-verdict.png`, `mobile-360-fallback.png`.
- `proof-of-feel/video-contact-sheet.png`: các frame trích từ chính MP4.
- `proof-of-feel/telemetry.json`: trạng thái camera, audio và cue từ lượt desktop.

## Giới hạn và quyết định gate

- **Chức năng slice: PASS.** Không phát hiện blocker trong các đường đã test; không có uncaught page error ở playthrough desktop/mobile.
- **Chưa chứng minh mục tiêu 30/60 FPS trên thiết bị thật.** Môi trường headless có render thích ứng; telemetry cuối các lượt đo khoảng 9.5–13.5 FPS, recording thực có thể thấp hơn. Không gọi đây là bản polish/performance cuối.
- Chưa kiểm thử Safari/iPhone/Android phần cứng thật. Reduced motion và touch đã thử bằng giả lập Chromium.
- Âm thanh là procedural foley/ambience; chưa có diễn viên lồng tiếng. Phụ đề mang toàn bộ thoại.
- Menu được giữ theo yêu cầu người dùng và đang được tác vụ khác phát triển; suite này tập trung S02–S03 qua route trực tiếp.
- **Chưa mở rộng S00/S01/S04/S05/S06 bằng runtime mới.** Không lấy bản web V2 cũ để đánh dấu Gate 3. Cần chốt cảm giác chơi của phân cảnh trước khi mở rộng theo shotlist.
- Chưa deploy, push hoặc nộp bài. Production output local ở `dist/`.

## Cập nhật cuối

Đã xác nhận góc cửa desktop bằng playthrough PASS 1/1 và xem các khung trích từ bản ghi mới. MP4 cuối dài 60.013 giây, H.264 960×540 và audio AAC, lấy trực tiếp từ canvas và master bus của game. Preview trực tiếp `http://127.0.0.1:5173/?qa=1` trả HTTP 200. Menu và preset mobile được giữ nguyên. Gate chức năng S02–S03 đạt; chất lượng cảm giác chơi và hiệu năng thiết bị thật chưa được chốt để mở rộng toàn game.

## Sprint 03

Chapter 02 thay placeholder mở đầu bằng cảnh đối thoại/sổ hoàn chỉnh. Xem [báo cáo riêng](chapter-02-qa.md) và `chapter-02-proof/` để phân biệt chứng cứ mới với ảnh/video legacy. Kết quả cuối sprint này nằm trong báo cáo riêng, không suy ra từ kết quả của Sprint 02.

## Sprint 04 — The Ripple

Xem [QA Chapter 03](chapter-03-qa.md) cho gate triển khai, state/save, build, E2E mới và hồi quy. Chứng cứ mới ở `chapter-03-proof/`; video raw canvas có âm thanh Chapter 03 riêng, khác video legacy.

## Sprint 05 — Final Act

[Báo cáo Final Act](final-act-qa.md) là kết quả triển khai đoạn kết mới, gồm test toàn game từ menu thật, riêng tư của thư, branches skip/storage/audio và hồi quy. Chứng cứ riêng trong `final-act-proof/`. Community hiện LOCAL ONLY, không có backend/đăng công khai.

## Production V4 — Gate 2 / Classroom Hero

[Báo cáo G2 và lệnh thực tế](art/G2_REPORT.md); [ảnh trước/sau và video](art/REVIEW.html). Baseline trước khi sửa: lint/typecheck/build,30 unit,23 gameplay,11 menu PASS. Bản cuối:30 unit,23 regression,5 hero PASS; fullgame từ menu tới Credits5.8 phút PASS. Menu lần đầu10/11 (timeout5s ở Start/audio), chạy lại nguyên bộ11/11 PASS; không đổi assertion, timeout hay runtime. Status giữ cờ lỗi đầu và log retry. Ảnh đối chiếu8 góc, build hash, gallery desktop/mobile và phát/tua video53.195s đã xác minh. Source không đổi sau khóa test. Art approval, thiết bị thật và chi phí SwiftShader tăng còn cần review; dừng G2, không deploy/push/G3.
