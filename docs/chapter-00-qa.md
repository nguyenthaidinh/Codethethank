# Gameplay Sprint 01 — The First Signal

Ngày 16/11/2026 (Asia/Saigon). Phạm vi: Chapter 00 → khám phá lớp 2026 → nối S03 hiện có. Không phải chứng nhận hoàn tất S00–S06.

## Gate 1 — Audit

Start trước sprint đi thẳng vào `CinematicGame` (arrival của S02). Nền tảng có camera focus, mưa/foley, nhân vật cô Vân, save v3 và menu hoàn chỉnh. Thiếu hội nghị 2046, interaction tín hiệu và memory transition. Không tìm thấy tài liệu có tên Cinematic Game Handoff; đối chiếu `STORY_CANON_V3.md`, shotlist, các tài liệu cinematic hiện có và code thực tế. Giữ menu, assets menu, save cũ, đường QA/recording S02–S03. Không cài dependency mới.

## Gates 2–7 — Code đã triển khai

| Gate | Kết quả và tệp chính |
|---|---|
| 2: Hội nghị | `src/chapter/SummitWorld.ts`: môi trường Canvas 2.5D có phối cảnh/camera, ban công, khán giả chuyển động nhẹ, sân khấu AION và terminal. Cinematic 30 giây, fade từ đen, introduction ở 10–15 giây, tín hiệu từ 15 giây. Không tên founder. |
| 3: Tín hiệu | `director.ts`, `ChapterGame.tsx`: mouse/tap/keyboard focus phản hồi ánh sáng/âm thanh; click dolly tới terminal; hành động thứ hai mở hồ sơ với bốn trường canon. Skip chỉ bỏ cinematic, không tự mở khóa. |
| 4: Chuyển cảnh | Cùng component tree, không route navigation/reload. Hội trường fade ra, khoảng lặng, mưa và chuông, bước chân; phòng lab được dựng dưới màn đen, mở từ cửa sổ rồi camera vào phòng. |
| 5: Lớp học | Tái dùng `WorldRenderer.ts`, An ngồi một mình, không có cô Vân trước khi người chơi tiếp tục. Thêm focus/anchor đồng hồ và cửa. Fallback 2D có camera focus, cửa và ghế trống. |
| 6: Đồ vật | Sáu tương tác: cửa sổ, đồng hồ, tài liệu, laptop, ghế trống, cửa lớp. Mỗi thao tác đổi camera, âm thanh/phụ đề và evidence. Có Camera Return. Tài liệu và laptop cung cấp mục tiêu tối ưu, danh sách bị loại và giới hạn số suất hỗ trợ. |
| 7: Handoff/save | Yêu cầu ≥3 đồ vật, bắt buộc tài liệu + laptop. Hành động trên laptop nối `enter` của S03; cô Vân vào/kéo ghế và thử hồ sơ An dùng logic cũ. `SliceSave.chapter` mở rộng có kiểm tra schema; save cũ vẫn hợp lệ. Continue ở transition trở lại exploration, không phát hội nghị lần nữa. |

Menu chỉ sửa `GameShell.tsx` để preload/lazy-load và lựa chọn chapter hay legacy save. Không sửa art, bố cục, điều hướng hoặc nội dung MainMenu.

Audio dùng bốn bus Music/Ambience/SFX/Voice kế thừa AudioDirector; âm mô phỏng nguyên bản, không fetch tài nguyên ngoài. Chưa có diễn viên lồng tiếng; lời AION và đối thoại truyền qua phụ đề. Autoplay không được dùng làm điều kiện để tiến hành gameplay. Pause/ẩn tab dừng timeline; reduced motion cắt camera, tắt chuyển động khán giả; tất cả mechanic vẫn giữ.

## Gate 8 — Kết quả thực thi

| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm test` | PASS — 13 tests / 4 files |
| `npm run build` | PASS — có cảnh báo chunk cinematic khoảng 571 kB, 146.6 kB gzip; lazy load |
| `npx playwright test cinematic-chapter.spec --trace off` (lượt đầu) | PASS 2/2 — desktop Start → An verdict; mobile Skip/tap/Continue/reduced motion/mute |
| `npm run test:e2e -- --trace off` (hồi quy và fallback) | PASS 7/7, 5.8 phút: ba test Chapter 00 + bốn test S02–S03 |
| `npx playwright test cinematic-chapter.spec cinematic-mobile.spec --grep 'Chapter 00\|360:' --trace off` | PASS 4/4, 3.5 phút trên build cuối sau chỉnh tỷ lệ fallback dọc và kế thừa mức âm thanh menu |
| `npx playwright test --config playwright.menu.config.ts --trace off` | PASS 11/11, 21.3 giây, dev server 4187: Start mới, Continue save cũ, âm thanh/autoplay, settings, lỗi tài nguyên/storage/audio, năm viewport |

## Chứng cứ browser thật

`docs/chapter-00-proof/`: `01-summit-desktop.png`, `02-case-2026.png`, `03-rain-window.png`, `04-laptop-desktop.png`, `05-signal-mobile.png`, `06-laptop-mobile.png`, `07-fallback-360.png`, `desktop-telemetry.json`. Ảnh được chụp từ gameplay chạy bằng Playwright, không mockup. Telemetry kiểm tra cue bell chỉ phát một lần, audio context running, evidence đủ sáu props. E2E kiểm tra cùng URL và chỉ một navigation document từ Start đến verdict.

Trong quá trình xem ảnh đã phát hiện fallback dọc kéo méo hình/chữ; đã sửa giữ tỷ lệ đồng nhất và chạy lại test liên quan. Bản cuối cũng truyền mức Music/Effects từ menu vào ChapterAudio, thay vì chỉ truyền cờ bật/tắt. Không đánh dấu kết quả của build trước là chứng nhận cho các sửa đổi này.

Kết luận Gate 8: PASS chức năng trong phạm vi đã kiểm tra. Không có pageerror ở các playthrough có assertion bắt lỗi. Check audio bus trên build cuối xác nhận Music = 0.055 và Effects ≈ 0.65 ở hội nghị theo mức menu mặc định; chuông chỉ phát một lần khi chuyển về lớp. Menu không bị dựng lại. Preview `http://127.0.0.1:5173/` đã trả HTTP 200; chọn Start để chơi từ hội nghị. Production output ở `dist/`. Không có thay đổi code sau các lượt kiểm tra cuối, chỉ cập nhật tài liệu.

## Giới hạn còn lại

- Art direction là procedural hình học/2.5D và phòng 3D nhẹ, chưa phải đồ họa photorealistic hay chất lượng bản phát hành cuối.
- Chưa chứng nhận 30/60 FPS hoặc Safari/iPhone/Android phần cứng thật. Playwright Chromium desktop/mobile là môi trường đã kiểm tra. Phòng lab giảm độ phân giải tự động; chữ trên vật thể có thể mềm, thông tin quan trọng được lặp lại bằng phụ đề rõ nét.
- Voice bus có sẵn nhưng chưa có voice-over. Tiếng khán giả/hành lang là mô phỏng tổng hợp.
- Video cũ trong `proof-of-feel/` chỉ chứng minh S02–S03. Sprint này dùng screenshot + automated gameplay assertions, không nhận video cũ là Chapter 00.
- Chưa triển khai S04–S06 mới; chưa deploy/push, không dịch vụ trả phí.
