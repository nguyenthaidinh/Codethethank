# Sprint 03 — Chapter 02: THE ONE WHO STAYED

Ngày kiểm chứng: 2026-11-16. Phạm vi: nối Chapter 01 tới cảnh cô Vân ngồi lại, hai trang sổ, dòng ghi chú và trang phác thảo mở đầu phần kế tiếp. Không tuyên bố hoàn tất toàn game bảy cảnh.

## Các gate triển khai

| Gate | Thay đổi và kết quả |
|---|---|
| 1 — Audit | Giữ menu, ChapterGame, nested VerdictSave, WorldRenderer/FallbackWorld và AudioDirector. Exit Chapter 01 đã có cô bước vào nhưng Chapter 02 trước đây chỉ là placeholder kéo ghế/câu hỏi. Không có AGENTS.md ở root. Không có metadata Git để xuất diff. |
| 2 — Entrance | ChapterGame.tsx + verdict/story.ts: bước chân/cửa, lựa chọn hướng nhìn về cửa có thể bỏ qua, hai câu chào theo sprint. Teacher entrance được lưu đúng phase; Continue không giả định cô đã vào xong. Không reload document giữa chương. |
| 3 — Chair | cinematic/motifs.ts giữ seed, thời lượng, tọa độ và camera insert dùng lại cho callback 2046. WorldRenderer kéo ghế 1.25 giây, giữ tới 2.6 giây rồi ngồi; ChapterAudio giảm nhạc, giữ mưa. Foley tổng hợp cùng một buffer có seed, không phải file thu âm thật. |
| 4 — Dialogue/notebook | stayed/story.ts tách lời thoại/timing khỏi UI; stayed/state.ts quản lý checkpoint. Cô nghe, An cúi đầu, camera medium/over-shoulder rồi focus cuốn sổ. Notebook.ts dựng texture bằng Canvas trên vật thể 3D, có lật trang. Phải xem cả hai câu hỏi; không có bảng điểm/đáp án đạo đức. |
| 5 — Unwritten line | StayControls.tsx + stayed.css: kéo, chạm hoặc Enter khôi phục đúng câu đã có trong ký ức. Reducer chặn viết sớm và xử lý thao tác lặp idempotent. Bút di chuyển, chữ hiện dần, phụ đề giữ nội dung rõ trên màn hình nhỏ. |
| 6 — Closing | Camera nhìn cửa sổ, rain gain giảm .14 → .07, ánh sáng ấm lên. Sau đó trở lại trang phác thảo có thể quan sát: FINAL JUDGMENT / câu hỏi về hỗ trợ. Đây là cầu nối tương tác, chưa phải toàn bộ gameplay Chapter 03. Có xem lại ký ức và skip từng cue đã xem. |
| 7 — QA | Kết quả cuối được ghi dưới đây sau khi chạy xong. |

## Kiểm chứng

- `npm run typecheck`: PASS.
- `npm run build`: PASS; Vite cảnh báo chunk cinematic ~579.6 kB, gzip ~149.4 kB. Build local trong dist/.
- `npm run lint`: lần đầu FAIL prefer-const trong test mới; đã sửa, lần chạy lại PASS.
- `npm test`: PASS 20 tests / 6 files, gồm điều kiện đọc hai trang, viết một lần, skip chỉ cue đã xem và validation checkpoint.
- E2E Chapter 02 lượt đầu: mobile PASS; desktop đi đến trang cuối nhưng assertion cùng canvas FAIL do test lấy tham chiếu trước khi lazy component mount. Test đã sửa để đợi canvas visible trước khi lấy mốc; không xóa assertion.
- Full E2E sau sửa: PASS 12/12; kết quả chi tiết ở cuối báo cáo.

## Chứng cứ thật

Ảnh browser trong `chapter-02-proof/`: desktop/mobile-chair.png, desktop/mobile-notebook.png, desktop/mobile-written.png. Đã mở kiểm tra trực quan ảnh desktop ghế/sổ và mobile sổ. Ảnh dùng procedural 3D của runtime, không AI mockup. Telemetry JSON ghi state/camera/audio events và thời gian playthrough. Mobile đầu tiên 75.967 giây, gồm một lần reload/Continue, nằm trong nhịp mục tiêu 65–85 giây; không phải benchmark trên điện thoại thật.

## Giới hạn trung thực

- Nhân vật procedural low-poly, cử động giới hạn; không facial capture, diễn viên lồng tiếng hoặc asset thu âm ghế ngoài đời.
- Chữ trên mesh mềm khi adaptive rendering hạ độ phân giải; nội dung quan trọng có phụ đề rõ. Mobile được kiểm bằng Chromium touch emulation, chưa thiết bị thật/Safari.
- Dòng thoại hiện tại là phụ đề, không giả giọng nói. Mute không cản tiến trình.
- Không lộ founder/AION trên model 2026. Không thay mục tiêu công nghệ trước chương kế tiếp.
- Trang phác thảo là điểm bàn giao phần tiếp theo; toàn Chapter 03, montage và ending chưa thuộc bản triển khai này.
- Không deploy, push, DNS, credential hay dịch vụ trả phí.

### Cập nhật lượt cuối

Hai E2E Chapter 02 đã PASS sau khi sửa thời điểm lấy canvas: desktop **77.701 giây**, mobile **75.444 giây**. Cả hai giữ cùng canvas từ checkpoint vào cảnh tới cuối (mobile lấy mốc mới sau reload chủ động), đủ hai ghi chú, written/nextInspected đúng và không pageerror. Desktop kiểm tra chair cue một lần và rain mix kết .07; mobile kiểm tra audio null, reduced motion, touch và checkpoint trang đầu. Đã kiểm tra preview local port 5173 trả HTTP 200.

### Bộ hồi quy gameplay cuối

`npx playwright test --trace off`: **PASS 12/12, 11.7 phút** trên production build cuối. Bao gồm 2 Chapter 02 mới, 3 Chapter 01, 3 Chapter 00 và 4 kiểm tra legacy/input/mobile. Luồng tích hợp từ menu qua Chapter 00 → 01 → 02 kiểm tra cùng canvas và audio context, teacher chỉ hiện sau hai bằng chứng, kết quả AN giữ nguyên. Video do test legacy xuất ra vẫn chỉ là chứng cứ legacy, không gắn nhãn video Chapter 02.

`npm run typecheck` và `npm run lint` cũng PASS sau khi thêm test keyboard fallback. Không sửa runtime sau build cuối; các thay đổi tiếp theo chỉ là test/tài liệu.


## Kết luận Gate 7

**PASS trong phạm vi kiểm chứng:** lint, typecheck, production build; **20 unit tests**, **13 gameplay E2E** (12 suite chính + 1 keyboard fallback) và **11 menu E2E**. `npx playwright test tests/e2e/cinematic-stayed-fallback.spec.ts --trace off`: PASS 1/1 (21.5 giây). `npx playwright test --config playwright.menu.config.ts --trace off`: PASS 11/11 (31.5 giây), gồm 5 viewport, settings, focus bàn phím, Start/Continue, autoplay và lỗi storage/audio. Ảnh `fallback-keyboard.png` đã mở kiểm tra; fallback ưu tiên khả năng chơi, hình nhân vật đơn giản hơn WebGL.

Bản production đã sẵn ở `dist/`. Preview dev `http://127.0.0.1:5173/`; Start mới, hoàn thành Chapter 00/01 để vào cảnh, hoặc Continue checkpoint đã có. Không thêm nút bỏ qua vật chứng để vào chương mới. Các bộ E2E Chapter 02 dùng checkpoint hợp lệ tại ranh giới chương để kiểm thử riêng; suite Chapter 01 kiểm chứng đường vào từ menu thật.

File chính đã sửa/thêm: `src/stayed/{story.ts,state.ts,Notebook.ts,StayControls.tsx,stayed.css}`, `src/verdict/{state.ts,story.ts}`, `src/chapter/{ChapterGame.tsx,ChapterAudio.ts}`, `src/cinematic/{director.ts,WorldRenderer.ts,FallbackWorld.ts,AudioDirector.ts,motifs.ts}`; tests stayed/unit, stayed E2E, fallback E2E và assertion chair trong verdict E2E. README, qa-report, CINEMATIC_GAME_HANDOFF liên kết báo cáo này. Không sửa source menu.
