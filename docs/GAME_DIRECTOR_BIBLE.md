# CINEMATIC GAME DIRECTOR BIBLE — V3

## 1. North star: chơi ở trong khoảnh khắc
Trò chơi không phải chuỗi màn hình: người chơi **nghe trước khi thấy, nhìn trước khi đọc, chạm trước khi hiểu**, tự khám phá không gian. Tất cả sự kiện chính được dàn dựng bằng camera + props + timing + sound + ánh sáng; lời thoại ngắn và ngừng đúng lúc.

**Chẩn đoán lỗi V2 handoff:** dùng quá nhiều HUD/card/objective/timeline/evidence table, nhân vật bị biến thành backdrop, nút `Next` thành hành động chủ lực, môi trường thiếu chuyển động/âm, thiết kế giống web. V3 yêu cầu chuyển trải nghiệm sang scene direction.

## 2. Định dạng trò chơi
- Single-player cinematic narrative investigation, một lượt 4–5 phút khi đi theo guided path; khám phá tự do có thể dài hơn.
- Desktop: cảnh full viewport 16:9 hoặc adaptive fill; camera có parallax nhẹ theo pointer, nhấp hotspot, kéo-thả/tap-select vật chứng, bàn phím Enter/Space/Esc.
- Mobile: tap, hold, swipe ngang nhẹ, camera preset riêng, phụ đề tự xuống dòng; không bắt xoay ngang; fallback 2D cho máy yếu.
- Không bắt camera WASD/full free-roam: **guided exploration** tạo cinematic pacing và khả thi kỹ thuật.
- Thao tác game bắt buộc đổi trạng thái thế giới, không chỉ mở popup.

## 3. Grammar điện ảnh (cần tồn tại trong implementation)
- `ESTABLISH`: wide shot cho biết không gian, thông tin bằng hình trước thoại.
- `PUSH_IN`: di chuyển chậm tới nhân vật/đạo cụ.
- `RACK_FOCUS`: lấy nét cửa sổ/mưa rồi về màn hình laptop hoặc gương mặt; mô phỏng bằng blur/crossfade/parallax được.
- `HOLD`: dừng 1–2 giây sau câu thoại then chốt, không tự phát nhạc chiến thắng.
- `MATCH_CUT`: hai mốc năm cùng bố cục, cùng **tiếng ghế kéo** hoặc Enter; không cần kỹ xảo cháy màn hình.
- `AMBIENT_DUCK`: giảm âm nền khi AION/An/cô Vân nói hoặc lúc mô hình hiện kết luận.
- `COLOR_SHIFT`: 2046 lạnh/hiện đại; 2026 ấm, thực; chuyển nhịp mưa/chiều, không dùng phủ tím toàn màn.
- Cảnh có thể **pause timeline at interaction gate**; không ép người chơi click trong một animation không thể đọc kịp.

## 4. Phân bổ UI
- **World first**: môi trường game chiếm gần toàn màn; UI chỉ xuất hiện khi có điều người chơi phải làm.
- Dialogue subtitle tối đa 2 dòng và không che mặt/cảnh then chốt. Các câu dài chia cue có pause, chữ dễ đọc.
- Control trong game tối giản: pause, sound, subtitles, hint, skip phụ; thanh nhiệm vụ chỉ hiển thị tạm thời rồi tan.
- Trong scene phòng học 2026 **không hologram, không bảng thành tích AION, không bảng task 3 cột**. Laptop có giao diện phần mềm do An viết, chỉ zoom lên khi tương tác.
- Không biến Gratitude Galaxy thành bảng số liệu cộng đồng khổng lồ; ưu tiên hành động để lại lời cảm ơn.

## 5. Các tương tác thực sự là game
`Observe` (di chuyển focus để tìm chi tiết) → `Interact` (chạm/nắm/kéo) → `Interpret` (kết nối ý nghĩa) → `Change` (trong mô phỏng tương lai đề xuất bước hỗ trợ) → `Leave a mark` (gửi lời tri ân).

Yêu cầu ít nhất 3 mechanics cụ thể:
1. **Environmental Focus:** camera theo hotspot khi người chơi nhìn/nhấp vào cửa sổ, laptop, tờ giấy, ghế trống. Cần phản hồi bằng focus/sound animation, không chỉ tooltip.
2. **In-world Evaluation:** người chơi chọn/chuyển hồ sơ An đặt vào laptop, mô hình chạy tại màn hình máy vật lý, kết quả `NOT RECOMMENDED`. Có thể kéo-thả desktop và tap-select mobile. Kết quả kèm âm nhạc tắt, nhịp mưa nổi hơn.
3. **Support Reframe:** người chơi kết nối thông tin do cô Vân gợi mở, chọn thay cách thiết kế đầu ra từ `FINAL JUDGMENT` sang `NEXT SUPPORT STEP` trong vùng mô phỏng; không gán cho người chơi quyền sửa quá khứ.
4. **Mirrored Motion:** đoạn match-cut hai chiếc ghế; người chơi align/khớp cử chỉ (tap vào hai chi tiết) để mở lời kết.
5. **Final gratitude:** người chơi viết ngắn lên tờ note/ánh sao rồi gửi; xem biến thành điểm sáng trong không gian game; tùy chọn không công khai hoặc bỏ qua.

## 6. Giữ cốt truyện V3, không viết lại trở về V1
AION #1 năm 2046, founder An giữ bí mật đến S04. Cô Vân không cứu thần kỳ hay tuyên bố An chắc chắn thành công. 17:05 sau giờ học có thể có mưa lất phất/đang ngớt; ánh sáng sau mưa. Mô hình gốc của An đánh giá ưu tiên hỗ trợ, không phải AION, không phải lỗi syntax. Trạng thái người chơi là nhân chứng đang giúp AION giải một bài học về trách nhiệm của công nghệ.

## 7. Visual mood, được giao Codex sáng tạo
Không sao chép ảnh AI; không neon tím/crystal/galactic HUD làm default. Codex lựa chọn một hướng art đủ **dựng được bằng code/assets hợp pháp**. Cảnh ít nhưng animate mượt và có phản ứng. Phối gốc: steel blue/xám xanh lạnh ở 2046; màu chiều mưa xám vàng ở 2026; ánh ấm tập trung quanh cô Vân; khoảng tối để tương phản. Bầu không khí và âm thanh chính là VFX quan trọng nhất.
