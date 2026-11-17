# QUALITY GATES & CODEx TASK BOARD

## P0 / Thứ tự để tránh website hóa
| Gate | Bắt buộc | Demo/chứng cứ thật | FAIL nếu |
|---|---|---|---|
| G0 — Audit | Khảo sát repo, asset, runtime và build | chạy được dev server (hoặc xác định blocker) | thay repository tùy tiện |
| G1 — Feel prototype | Một **phân cảnh 2026 20–30s** có camera push, mưa trên cửa sổ, quạt/giày/ghế, một hotspot có phản hồi | screen recording có **âm thanh**, desktop và mobile | chỉ có ảnh nền, hộp text, Next |
| G2 — S02/S03 hero playable | Full bối cảnh 17:05, cô vào phòng, kéo ghế, người chơi chạm đồ vật và chạy mô hình An | quay màn hình thao tác và audio duck `NOT RECOMMENDED` | chỉ có menu cảnh/điều tra card |
| G3 — End-to-end | S00–S06, 3+ gameplay mechanics, reveal đúng S04, star ending | playthrough video + test automated main path | founder lộ từ menu; không có kết thúc |
| G4 — Production quality | captions, skip phụ, hint, resume, no-audio, mobile, reduced motion, tests | report lệnh thực chạy + thiết bị/viewports | playable bị kẹt, mobile không thao tác được |
| G5 — Release prep | stable build, manifest tài nguyên, cách deploy, video dự phòng, link nộp chuẩn bị | zip/build & checklist | tuyên bố đã deploy/nộp khi chưa thực hiện |

## Những điều không thể thiếu trước hạn
- S02–S03 tạo cảm giác game với **thời tiết, không gian, camera, âm thanh**.
- S03 có cô kéo ghế và câu hỏi về mô hình, An chạy hồ sơ của mình, verdict thật trên laptop, điểm lặng trước thoại.
- S04 có montage 20 năm, match-cut ghế và nhà sáng lập chỉ được tiết lộ lúc này.
- S06 có hành động tri ân, có thể bỏ qua và không cần tài khoản; local/public trạng thái trung thực.
- 7 scene không yêu cầu click Next vô nghĩa để qua.

## Checklist quan sát 60 giây đầu
- Không nhìn như header/menu/sidebar website.
- Camera có chuyển động có chủ đích, không lắc vô cớ.
- Trong 15 giây có 1 hành động của người chơi làm thế giới phản ứng.
- Có âm thanh ambience theo bối cảnh, không chỉ nhạc nền.
- Không nhìn thấy tên nhà sáng lập trước S04.

## Kiểm thử chức năng
1. Desktop Chrome/Edge: bấm Start -> audio unlock, focus laptop, kiểm thử An, hoàn tất đến ending.
2. Mobile viewport 390x844 và 360x800: tap hotspot, không cần kéo thả bằng chuột, phụ đề đọc được, không bị cắt UI.
3. Keyboard: tab đến điểm tương tác/điều khiển, Enter kích hoạt, Escape pause.
4. Mute ngay từ đầu: mọi lời quan trọng có phụ đề và audio cues có visual feedback tương ứng.
5. Reduced motion: tránh camera push dài nhưng vẫn có continuity; game hoàn thành được.
6. Idle > 10s: hint xuất hiện đúng cảnh; không auto đánh dấu người chơi đã thao tác.
7. Refresh tại S03: resume không reset từ đầu trừ khi người chơi muốn.
8. Reveal check: tìm 'FOUNDER AN' trong DOM/UI trước S04; không render lộ ở trang/menu/screenshot của game.
9. Galaxy: lưu local hoạt động khi offline; không hứa realtime nếu không có backend thực; sanitize nội dung.
10. Load failure: âm thanh/3D lỗi có fallback; không có màn đen vô hạn.

## Quy trình báo cáo sau Gate
`what changed / playable minutes / major interactions tested / visual+audio proof / actual tests PASS or FAIL / blockers / next gate`. Screenshot chỉ chứng minh hình, **recording** mới chứng minh âm và chuyển động. Không giả kết quả.

## Release cut rule
Nếu thiếu thời gian: bỏ 3D nặng, số lượng props dư thừa, realtime/LLM, icon/metrics; **không bỏ âm thanh mưa-cửa-ghế, camera focus, tương tác verdict, match-cut, câu thoại cốt lõi**.
