# Kế hoạch nâng chất lượng giao diện và hình ảnh

Ngày: 17/11/2026. Trạng thái: đề xuất thiết kế, chưa triển khai runtime.
N4 tạm dừng theo yêu cầu Product Owner để phiên khác tiếp tục phần thư.

## Căn cứ thực tế

Đã xem ảnh runtime `docs/chair-cinematic-proof/runtime/desktop-seated-dialogue.png`, `docs/laptop-flow-proof/runtime/desktop-laptop-first.png`, `docs/story/n4-proof/runtime/finale-regression/desktop-lesson.png`. Đây là bằng chứng của các lần chạy đã lưu, không phải xác nhận mọi thay đổi đang diễn ra trong phiên khác.

- Góc thoại nhìn xuống khiến mặt bàn/laptop lấn át hai nhân vật; nhân vật sát mép khung hình.
- Ánh sáng diện rộng làm tường, sàn, nhân vật gần nhau về độ sáng. Chưa có điểm nhìn rõ.
- Silhouette tóc, khớp vai và trang phục còn đơn giản; UI không thể tự khắc phục chất lượng asset.
- Nhãn tương tác dạng nút giữa màn hình cạnh phụ đề tạo cảm giác giao diện web.
- Cảnh phần kết được kiểm tra có góc nhìn chéo cao, đầu người bị cắt và giấy khó đọc. Phiên làm Finale cần xử lý trong phạm vi riêng; không sửa chồng.

## Hướng chốt đề xuất

**Stylized cinematic, tiết chế và gần gũi.** Năm 2026 dùng ánh cửa sổ xanh xám, nguồn sáng bàn màu hổ phách và giấy ngà. Năm 2046 giữ graphite/bạc/cyan đang có. Một hệ thống phụ đề, focus và nút tiện ích thống nhất giữa hai thời đại. Không đổi môi trường, model hay palette toàn game trong đợt UI đầu tiên.

Ưu tiên tạo một đoạn lớp học 20–30 giây đẹp và chơi rõ ràng trước khi áp dụng rộng. Main Menu, Finale editor và các file đang thuộc phiên khác nằm ngoài đợt triển khai đầu.

## Thứ tự thực hiện

| Đợt | Công việc cụ thể | Bằng chứng nghiệm thu |
|---|---|---|
| P0 — Chốt mốc | Đợi phiên thư kết thúc; chụp cùng checkpoint ở desktop và mobile; lưu source hash, camera pose, settings. Xác định quyền sửa từng file dùng chung. | Bộ ảnh trước và danh sách file, không sửa state/save. |
| P1 — Giao diện trong cảnh | Một hotspot đang focus có nhãn; vật thể khác chỉ dấu nhỏ khi có thể tương tác. Giữ đường quay lại rõ khi soi laptop. Rút gọn CTA, thống nhất phụ đề và nút tiện ích. | Chuột/tap/Tab/Enter đều hoàn tất điều tra; không mắc ở laptop. |
| P2 — Khoảnh khắc ngồi lại | Sửa thông số bố cục trong camera hiện có: thấy kéo ghế, thấy cô hạ người, rồi khung hai người gần ngang mắt. Giảm laptop che mặt/ngực. Giữ trục nhìn và thời điểm âm ghế. | Video liên tục có audio, không clipping, desktop và mobile đều thấy hành động. |
| P3 — Ánh sáng có điểm nhìn | Tách sáng cửa sổ và đèn bàn; giữ mặt đọc được, giảm mảng sàn/tường quá nổi; chỉnh roughness/bóng tiếp xúc có kiểm soát. | So sánh cùng pose/exposure, ghi frame time và draw calls trước/sau. |
| P4 — Duyệt hình ảnh | Xem đoạn chơi bình thường, không chỉ chọn ảnh đẹp. Duyệt UI, bố cục, mặt nhân vật và nhịp im lặng riêng. | Product Owner duyệt hoặc ghi rõ phần chưa đạt; technical PASS không thay art approval. |
| P5 — Mở rộng có chọn lọc | Sau khi đoạn mẫu được duyệt, áp dụng hệ thống UI cho những cảnh còn lại; phối hợp phiên Finale, tránh ghi đè. | Hồi quy toàn tuyến và checkpoint; đối chiếu ảnh desktop/mobile. |

## Quy cách UI đề xuất

- Phụ đề: font có bộ dấu tiếng Việt đầy đủ, không ép line-height; tối đa hai dòng ở desktop, cho phép ba dòng ở mobile khi cần. Có nền chuyển sắc nhẹ để đọc được trên nền sáng. Không cắt nội dung để đạt số dòng.
- Tên người nói nhỏ và tách khỏi câu; không thêm hộp thoại lớn hay chân dung nổi.
- Nút tương tác có vùng chạm tối thiểu 44×44 CSS px dù biểu tượng nhỏ. Focus bàn phím luôn rõ, không dùng hover làm cách duy nhất để phát hiện vật thể.
- Hướng dẫn hiện khi người chơi cần, giảm dần sau khi hiểu thao tác; không giấu nút quay lại hoặc tiến tiếp cần thiết.
- Kết quả NOT RECOMMENDED đỏ trầm, monospace hỗ trợ tiếng Việt; kèm chữ/trạng thái để không phụ thuộc vào màu. REVIEW REQUIRED là trạng thái khác, không sửa kết quả lịch sử.
- Trên mobile, đặt vùng thao tác tránh phụ đề và safe-area. Dùng bố cục camera theo tỷ lệ khung hình thay vì cắt từ ảnh desktop.
- Reduced motion giữ cùng thông tin và thời gian đọc, giảm dolly/parallax. Giọng nói vẫn chỉ ở phần dẫn đầu game.

## Giới hạn nhân vật cần nói rõ

P1–P3 có thể cải thiện cách trình bày model hiện tại nhưng không biến chúng thành nhân vật authored chất lượng cao. Nếu mặt, tóc và dáng người vẫn chưa đạt sau khi chỉnh bố cục, mở một đợt asset riêng: duyệt cặp An/cô Vân cùng phong cách, license, rig, biểu cảm và động tác ngồi trong runtime trước khi tích hợp. Không tự tải hoặc thay model trong đợt UI; lần thay asset trước đã bị Product Owner yêu cầu hoàn tác.

## Bảo toàn và kiểm chứng

Giữ Story V4, điều kiện tương tác, checkpoint, thời điểm reveal founder, âm ghế và Main Menu. Camera chỉ đổi framing sau khi bước P2 được triển khai; không viết lại hệ camera. Các điểm sửa dự kiến cần audit lại trước khi làm: `src/cinematic/cinematic.css`, `src/art/narrative.css`, `src/verdict/VerdictControls.tsx`, `src/stayed/StayControls.tsx`, `src/cinematic/WorldRenderer.ts`. Không coi đây là danh sách cho phép sửa mọi nội dung trong các file.

Mỗi đợt giao ảnh trước/sau cùng checkpoint, video runtime có audio, kết quả typecheck/lint/build và các bài test liên quan. Chạy luồng laptop trước, điều tra đủ bằng chứng, cô kéo ghế/ngồi, notebook, save/reload; kiểm tra touch, keyboard, mute, reduced motion và Canvas fallback. Đo cùng thiết bị/cấu hình; mobile giả lập phải ghi là giả lập. Không hứa FPS trên thiết bị thật chưa được đo.

Điểm dừng đầu tiên: P1–P3 hoàn thành một đoạn mẫu và nhận đánh giá hình ảnh. Không redesign mọi chương để lấy số lượng thay cho chất lượng.
