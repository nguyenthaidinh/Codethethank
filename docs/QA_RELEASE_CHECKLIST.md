# QA / RELEASE / DEMO CHECKLIST
## PROJECT 20:11 — THE UNWRITTEN LESSON

> Checklist kết luận trạng thái bằng **bằng chứng thực tế**. Không tự tick nếu chưa chạy kiểm thử.

## A. Narrative integrity — P0
- [ ] Tên game đúng; `20:11` là biểu tượng 20/11, **không** là giờ lớp học.
- [ ] AION 2046 được giới thiệu là AI đa năng #1 trong thế giới **hư cấu** (không coi là fact ngoài đời).
- [ ] S00, S01, S02, S03 **không** tiết lộ người sáng tạo AION là An.
- [ ] An là sinh viên **đại học** năm 2026; mô hình 2026 không mang thương hiệu AION.
- [ ] S03 diễn ra lúc **17:05** sau giờ học; cô Vân kéo ghế, ngồi lại và đặt câu hỏi.
- [ ] Hồ sơ An thực sự bị trả `NOT RECOMMENDED`, không phải lỗi load dữ liệu.
- [ ] S04 cho thấy An thay vai trò đánh giá sang `NEXT SUPPORT STEP`.
- [ ] Montage 20 năm thể hiện thử nghiệm, thất bại, hợp tác và nỗ lực — không tóm tắt thành “chỉ nhờ cô nói một câu”.
- [ ] Reveal founder ở S04 xuất hiện sau hành động gameplay.
- [ ] Bài học S05 truyền tải “prediction != final judgment”.
- [ ] S06 có cảm xúc tri ân, không ép chia sẻ.

## B. Gameplay & state
- [ ] Start → S00 → S01 → S02 → S03 → S04 → S05 → S06 → End hoạt động.
- [ ] S01 chọn cả hai góc nhìn đều có phản hồi và hội tụ hợp lý.
- [ ] S02 đủ 3 hotspot và có hint/fallback.
- [ ] S03 kéo thả hồ sơ An đúng; tap-select/tap-target cũng đúng.
- [ ] Kết quả thử hồ sơ không bị skip trực tiếp.
- [ ] S04 chuyển đổi nhãn/chức năng hoạt động, không chỉ là animation giả.
- [ ] S05 có tương tác ghép nguyên tắc + kết luận rõ.
- [ ] Save/Resume sau reload trong S03/S04 không làm mất trạng thái.
- [ ] Restart xóa/đặt lại đúng state; không xóa dữ liệu user ngoài game.
- [ ] Người chơi không gặp dead-end khi bỏ qua lời nhắn kết thúc.
- [ ] Không có chấm điểm lòng tốt hay thông báo người chơi là xấu.

## C. UX/UI & design verification
- [ ] Không dùng lại ảnh concept cũ như giao diện code.
- [ ] Codex đã ghi lại tối thiểu 2 định hướng UI được cân nhắc và lý do chọn.
- [ ] Screen thực tế được chụp từ browser tại 360×800, 390×844, 1280×720, 1440×900.
- [ ] Không horizontal overflow hoặc UI popup bị che ở mobile.
- [ ] Tooltip, choice, hotspot có cách điều khiển bằng chạm và keyboard (những tác vụ chính).
- [ ] Typography tiếng Việt hiển thị đầy đủ dấu.
- [ ] Tất cả CTA có trạng thái hover/active/focus/disabled khi cần.
- [ ] Mỗi scene có user action + response dễ hiểu, không chỉ bấm Next xem hình.
- [ ] Background/nhân vật/đạo cụ nhất quán trong cùng thời kỳ.
- [ ] Scene 2026 không bị phủ UI công nghệ 2046 vô lý.

## D. Reliability
- [ ] Âm thanh không tự phát trước tương tác ban đầu; mute có tác dụng.
- [ ] Phụ đề đủ cho tất cả phần thoại chính; test tắt tiếng vẫn hiểu câu chuyện.
- [ ] Reduced motion không làm hỏng mechanic.
- [ ] WebGL fail hoặc bị tắt: gameplay chính có fallback 2D.
- [ ] Asset bị lỗi tải: scene vẫn hiện thoại + tương tác tối thiểu.
- [ ] Mạng chậm: có loading, không treo vô hạn.
- [ ] Thử ở ít nhất 1 trình duyệt desktop + 1 thiết bị/giả lập mobile; ghi lại môi trường thực tế.
- [ ] Không có uncaught JS error khi chơi đầu cuối.
- [ ] Asset/font/audio có nguồn gốc hoặc giấy phép phù hợp.

## E. Data protection & community
- [ ] Không gửi secret/token/private key trong frontend bundle.
- [ ] Lời nhắn người dùng render dạng text an toàn; không HTML injection.
- [ ] Giới hạn ký tự và validate input có thông báo.
- [ ] Ngôi sao cục bộ không được quảng bá là “đã xuất bản cộng đồng”.
- [ ] Nếu backend public: POST rate-limited, moderation queue hoạt động, gallery chỉ query `approved`.
- [ ] Nếu backend public: thử spam/mã HTML và xác minh không được hiển thị nguy hiểm.
- [ ] Nếu backend chưa xong: lời nhắn hiển thị local only, gallery mẫu có nhãn demo nếu sử dụng.
- [ ] Không tự bịa tổng số lời cảm ơn như dữ liệu thời gian thực.

## F. Dev quality
- [ ] `npm run build` hoặc lệnh build thật: PASS (ghi log/ngày/commit).
- [ ] `npm run lint` hoặc equivalent: PASS.
- [ ] Typecheck: PASS.
- [ ] Unit test transition/evidence/persistence: PASS.
- [ ] E2E default route và alternate route: PASS.
- [ ] E2E refresh/resume: PASS.
- [ ] Screenshot QA được lưu đúng thư mục `docs/screenshots/`.
- [ ] Các lỗi còn lại được phân loại blocker/high/low; không còn blocker P0.
- [ ] Không claim “đã hoàn thành/deploy/nộp” nếu chưa có chứng cứ.

## G. Deployment & contest submission
- [ ] Quyền triển khai được người sở hữu cho phép.
- [ ] URL HTTPS đúng, không cần auth, mở trên mạng khác.
- [ ] SPA fallback routing không gây 404 khi refresh deep link.
- [ ] Bản deploy trùng commit/release candidate đã QA.
- [ ] Có khả năng rollback; không deploy nhánh thử nghiệm lên URL chính.
- [ ] Video backup 3–5 phút đã xem lại cả tiếng + phụ đề.
- [ ] Có ít nhất 1 bản screencast demo điều khiển 3 phút.
- [ ] Thủ tục gửi link/hồ sơ theo kênh BTC được hoàn thành và có xác nhận tiếp nhận.
- [ ] Nộp **trước 20:00 17/11/2026**, mục tiêu nội bộ 17:00.
- [ ] Sau nộp, không làm mất ổn định URL được chấm.

## H. Demo Gala — 3 phút
- [ ] Có người chịu trách nhiệm điều khiển và một người quan sát thiết bị nếu có đội.
- [ ] Chuẩn bị laptop, điện thoại, trình duyệt fullscreen/viewport ổn định.
- [ ] Scene S03 đã được bookmark/cho phép rehearsal không spoil trong sản phẩm public.
- [ ] Trình tự: AION #1 → 2026 lỗi mục tiêu → cô Vân 17:05 → sửa quy tắc → reveal An → ngôi sao.
- [ ] Nếu không có internet: chuyển sang video fallback và nói rõ đây là bản ghi sản phẩm chạy thật.
- [ ] Không nhắc VR như thành phần của sản phẩm dự thi.

## I. Verification report template
```text
Date/time (GMT+7):
Commit SHA / build ID:
Branch / environment:
Commands executed:
  - ... : PASS/FAIL [actual output]
Browser / device / viewport:
E2E scenarios tested:
Known issues (severity):
Screenshots / video paths:
Accepted/rejected gate:
Next action:
```
