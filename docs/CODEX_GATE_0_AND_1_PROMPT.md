# CODEX EXECUTION PROMPT — GAME PRODUCTION V4.0

Bạn là **Lead Gameplay Engineer + Technical Art Director + Game QA Lead** thực hiện dự án hiện hữu **THE UNWRITTEN LESSON**. Đây là **cinematic narrative adventure thực sự**, không phải website kể chuyện hoặc slideshow.

## NGUỒN VÀ QUY TẮC
1. Đọc toàn bộ `MASTER_GAME_PRODUCTION_PLAN_V4.md`, `STORY_CANON_V3.md` và `GAME_DIRECTOR_BIBLE.md` nếu có.
2. Kiểm tra source thực tế trước khi đề xuất thay đổi. Không tự tin vào các tên file giả định nếu repository khác.
3. Giữ canon: AION #1 năm 2046 (hư cấu); An tạo AION nhưng chỉ reveal ở Chapter 03; 2026 là prototype khác; cô Vân ngồi lại 17:05; motif ghế 2026/2046; người chơi không thay đổi quá khứ. Không VR.
4. Tên công khai: THE UNWRITTEN LESSON; không thêm PROJECT 20:11 vào màn hình game.
5. Không viết lại Chapters 00–03, Main Menu hoặc nền tảng đã hoạt động nếu không có bằng chứng lỗi/blocker.
6. Không dùng ảnh AI có sẵn làm toàn bộ game background. Cần scene, input, audio, camera và gameplay hoạt động thật.

## NHIỆM VỤ TRƯỚC MẮT: GATE 0 + GATE 1

### GATE 0 — SOURCE AND QUALITY BASELINE
- Kiểm tra source tree, package scripts, scene controller, save/checkpoint/validation, rendering/fallback, audio, tests và document canon.
- Run những lệnh repository hỗ trợ: typecheck, lint, unit, build, E2E. Không giả vờ test nếu môi trường thiếu điều kiện.
- Chơi kiểm tra luồng 00→03 và `FINALE_READY` (ưu tiên browser runtime, không chỉ đọc unit test).
- Báo cáo các điểm kỹ thuật cần sửa trước khi làm Finale; xử lý blockers tối thiểu.
- Lập `docs/GAME_PRODUCTION_STATUS.md`: observed / reported / missing / blockers / next tasks.
- So sánh bundle hiện tại với báo cáo ~597.58 kB cinematic (nếu cấu hình còn tương đương), không coi đó là ngưỡng bắt buộc.

### GATE 1 — IMPLEMENT FINAL ACT
- Nối state hợp lệ từ Chapter 03 `FINALE_READY` vào Final Act với cùng runtime/canvas và audio context.
- F01: last memory, camera nhìn hồ sơ/ghế/cuốn sổ.
- F02: AION hiểu giới hạn của phán quyết bằng dự đoán, không biến thành AI vụng về.
- F03: blank paper đặt câu hỏi người chơi muốn cảm ơn ai.
- F04: letter interaction in-world, optional name/message, Vietnamese IME, focus/touch/keyboard, skip, private default.
- F05: ink-to-star continuous cinematic, reduced-motion fallback, no fake publishing.
- F06: Gratitude Galaxy đúng không gian game, local private star inspection, game completed, credits, replay, return to menu.
- Bảo toàn game history: không phá save của Verdict/Stayed/Ripple. Validate checkpoint và idempotence, reload giữa các beat.
- Chỉ thêm community backend khi đã được yêu cầu riêng và có privacy/muting/moderation khả dụng; không tự tạo endpoint giả.

## ART & AUDIO FOR GATE 1
- Giữ phong cách hiện tại đủ thống nhất để end-to-end chạy được. Không cải tổ toàn game tại Gate 1.
- Cảm xúc qua camera, ánh sáng, các vật thể có ý nghĩa, khoảng lặng, sound bridge.
- Ưu tiên âm thanh hợp pháp, mạch audio không bị double-start, subtitles đi kèm.
- Không cho AI sinh lời cảm ơn giả thay người chơi; không nói lời nhắn đã public nếu chỉ lưu local.

## ACCEPTANCE / BÁO CÁO
- Có thể chơi 00→04→Credits, không dead-end, không reload trang giữa chapter.
- Chạy lại typecheck/lint/unit/build và E2E mới + hồi quy.
- Test desktop, touch emulation, keyboard-only, WebGL disabled, reduced motion, mute, reload mid-finale, no-letter path, Unicode IME và malicious text.
- Lưu runtime screenshots, short video/screen recording, telemetry không có dữ liệu thư cá nhân.
- Báo cáo đúng: file thay đổi, source-of-truth, tests pass/fail, những điều chưa kiểm chứng, bundle diff, lỗi cần sửa.
- Đừng khẳng định “quality AAA” hay “hoàn tất phát hành” nếu chưa art pass, thiết bị thật và playtest.

Sau khi G1 PASS, **dừng thay đổi lớn và báo cáo**. Nhiệm vụ kế tiếp sẽ là G2 **Art Bible + Classroom 17:05 Hero Vertical Slice**, không tự động redesign mọi chapter.
