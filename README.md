# PROJECT 20:11 — THE UNWRITTEN LESSON

Phiên bản hiện tại giữ **menu chính**, có **Chapter 00 — The First Signal**, **Chapter 01 — The Verdict**, **Chapter 02 — The One Who Stayed**, **Chapter 03 — The Ripple** và **Chapter 04 — The Unwritten Lesson**. Start mở hội nghị AION 2046, tín hiệu dẫn về phòng lab 17:05; người chơi điều tra, cùng cô Vân xem lại câu hỏi, nối ký ức qua 20 năm rồi tạo một ngôi sao tri ân riêng tư hoặc kết thúc trong im lặng.

Trạng thái production mới nhất: [V4 Gate 0 + Gate 1](docs/GAME_PRODUCTION_STATUS.md). Các báo cáo sprint bên dưới giữ lịch sử; V4 bổ sung focus ký ức ở F01 và camera reduced-motion, không mở đợt art redesign G2.

```sh
npm ci
npm run dev
```

Mở địa chỉ Vite in ra, chọn “Bắt đầu hành trình”. Menu mặc định tắt âm thanh; dùng nút ♪ để bật. Sau cinematic 30 giây (có Skip), chạm tín hiệu rồi mở hồ sơ. Trong lớp, khám phá ba đồ vật rồi dùng laptop để vào Chapter 01. Đọc bản thuyết trình, sổ thiết kế và dữ liệu; chạy một hồ sơ mẫu, sau đó thử AN. Đối chiếu hai vật chứng khác nhau với kết quả để cô Vân xuất hiện. Chuột, chạm, Tab/Enter được hỗ trợ; Esc tạm dừng; `?` gợi ý. Continue giữ checkpoint và các liên kết. Save S02–S03 cũ vẫn đọc bằng tuyến legacy; chọn hành trình mới để trải nghiệm Chapter 01 mới.

```sh
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npx playwright test --config playwright.menu.config.ts
npm run preview
```

Playwright hiện kiểm tra runtime cinematic mới. Các test `game.spec.ts`, `visual.spec.ts`, `resilience.spec.ts` được giữ làm tham chiếu V2, không nằm trong suite active và không chứng minh sản phẩm V3 hoàn tất.

Chứng cứ Chapter 01 nằm trong `docs/chapter-01-proof/`, báo cáo ở `docs/chapter-01-qa.md`. Chapter 00 có `docs/chapter-00-proof/` và `docs/chapter-00-qa.md`. Chứng cứ legacy S02–S03 ở `docs/proof-of-feel/`. `docs/screenshots/` là ảnh V2 cũ, không phải chứng cứ cho các chapter mới.

**Route kiểm chứng:** `/?chapter=1` mở trực tiếp Chapter 00 mới; `/?qa=1` giữ đường kiểm tra S02–S03 cũ. **Ghi hình S02–S03:** mở `/?record=1`, bắt đầu chơi có âm thanh, cuối phân cảnh chọn tải bản ghi. Video WebM ghi trực tiếp canvas và master bus Web Audio. Chức năng ghi này chưa bao gồm Chapter 00; không dùng video cũ làm chứng cứ cho chương mới.

Build tĩnh ở `dist/`. Tất cả tài nguyên P0 đóng gói local; không gọi API hay tải font ngoài. Mở build bằng HTTP server, không nhấp trực tiếp `file://index.html`. Chưa deploy, push hoặc nộp bài.

## Sprint 03 — Chapter 02

Chapter 02 hiện nối trực tiếp sau hai đối chiếu ở Chapter 01: cô Vân bước vào, kéo ghế, ngồi cùng An, mở hai trang sổ và đưa sổ về phía An. Xem cả hai ghi chú, sau đó chạm/kéo nét bút hoặc dùng Tab/Enter để khôi phục câu hỏi cuối. Cảnh đóng bằng cửa sổ mưa và trang phác thảo cho phần tiếp theo. Có tự chạy thoại, Tiếp lời, xem lại/skip cue đã xem và Continue giữa cảnh.

Báo cáo Sprint 03: [Chapter 02 QA](docs/chapter-02-qa.md). Ảnh runtime desktop/mobile và telemetry: `docs/chapter-02-proof/`. Chapter 02 hoàn chỉnh trong phạm vi sprint; Chapter 03 được mở rộng ở Sprint 04 bên dưới. Recording legacy ở `/?record=1` không phải chứng cứ cho Chapter 02.


## Sprint 04 — Chapter 03: The Ripple

Từ trang phác thảo đã xem ở cuối Chapter 02, chọn **Nối hai câu hỏi**. Chạm cả hai dấu bút và khôi phục NEXT SUPPORT STEP trên laptop. Quan sát vật thể ở ba mốc 2029, 2035, 2045; sau đó đối chiếu hồ sơ 2046 để mở reveal. Cảnh ghế nối hai thời điểm; chạm ba vật thể ký ức rồi khớp chúng để tới checkpoint chương cuối. Tương tác bằng chuột, tap hoặc Tab/Enter; có mute, phụ đề, reduced motion và Continue giữa montage/callback.

[QA Chapter 03](docs/chapter-03-qa.md), ảnh và telemetry ở `docs/chapter-03-proof/`. Video `desktop-live-audio.webm` là canvas/audio runtime thật của Chapter 03. Điểm bàn giao Sprint 04 là FINALE_READY; Gratitude Galaxy và chương tri ân cuối đã được nối tiếp ở Sprint 05 bên dưới.

## Sprint 05 — Final Act

Sau Chapter 03, chạm tờ giấy trắng. AION nối lại bài học rồi hỏi người chơi; chạm giấy để viết tên/ngắn lời tri ân (đều tùy chọn), chọn gợi ý hoặc bỏ qua. Đọc lại trước khi tạo sao. Giấy và nét mực chuyển thành ánh sáng trong cùng canvas; chạm sao của mình để xem, rồi tới title và các nút menu/replay/credits.

**Riêng tư:** không backend cộng đồng, không đăng công khai, không login. Checkbox cho phép lưu bản nháp trên thiết bị hoặc chỉ giữ trong phiên. Xóa nội dung đã lưu tại giấy/ngôi sao; tiến trình game vẫn giữ. Không hứa giữ lời nhắn sau reload nếu người chơi đã chọn chỉ lưu trong phiên hoặc storage bị chặn. Nội dung thư không nằm trong save tiến trình hay telemetry.

[QA Final Act](docs/final-act-qa.md) ghi các gate, test và giới hạn. Ảnh runtime, telemetry và video có âm nằm trong `docs/final-act-proof/`. Build production ở `dist/`; vẫn chưa deploy/push.
