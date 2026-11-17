# Nhật ký thử nghiệm 2029

Phạm vi: đoạn `years` / `milestone` đầu tiên của Chapter 03, năm 2029. Không sửa state machine, checkpoint, lời thoại, phòng học 2026, mở đầu AION, giọng Hoài My hay phần thư.

- `ResearchDesk2029.ts`: bàn gỗ có texture tự dựng bằng Canvas, laptop/keyboard, cuốn sổ mở có gáy và hai trang giấy, bút, đèn bàn. Geometry/material/texture được giải phóng cùng scene; không dùng ảnh AI. Props chỉ hiện năm 2029.
- `ResearchJournal2029.tsx`, `RippleControls.tsx`, `ripple.css`: tiêu đề năm tối giản và điểm mở nhật ký; mở sổ hiện hai trang kết quả/hướng xem xét thêm. Dùng font LessonSerif hỗ trợ tiếng Việt. Responsive, focus bàn phím, reduced motion. Giữ đúng điều kiện: REVIEW REQUIRED không đồng nghĩa tự động cấp hỗ trợ.
- `RippleWorld.ts`: bố cục camera, ánh sáng và bàn riêng cho 2029. Vật liệu/bố cục và ánh sáng cũ được khôi phục khi chuyển năm 2035. Không thay motif ghế hoặc reveal.

Kiểm tra thực thi: typecheck, ESLint `src/ripple`, production build PASS. Bốn tests có sẵn `tests/ripple.test.ts` PASS. Browser desktop 1440×900 và cảm ứng 390×844: mở nhật ký → tự chuyển năm 2035 PASS, không có page error. Ảnh runtime và kết quả nằm trong thư mục này. Không chạy full regression hoặc đo thiết bị thật.

Preview thẳng đoạn 2029: http://127.0.0.1:4229/_journal-review.html → Xem đoạn năm 2029 → Tiếp tục. Launcher dùng checkpoint hợp lệ trên origin preview riêng; không ghi đè save ở các preview khác. Trong gameplay bình thường vẫn đi theo tiến trình cũ.

Thời lượng đọc nhật ký vẫn là 6 giây theo beat cũ; chưa thay nhịp cả montage. Chất lượng model nhân vật và nền phòng nghiên cứu còn kế thừa scene hiện tại. Không tuyên bố art approval, không push/deploy.
