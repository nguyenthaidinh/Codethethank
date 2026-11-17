# PROJECT 20:11 — THE UNWRITTEN LESSON
## CINEMATIC GAMEPLAY HANDOFF V3.0 — 16/11/2026

**Đọc đầu tiên.** Đây là bản **THAY THẾ** cách triển khai trước đó. Người dùng từ chối hướng game như dashboard/website nhiều card và yêu cầu trở lại nhịp điện ảnh, âm thanh, chuyển động, thời tiết, camera, tương tác với đồ vật thật trong thế giới game.

## Thứ tự ưu tiên khi có xung đột
1. Yêu cầu mới nhất: trải nghiệm **game cinematic thực**, không phải website/visual novel toàn hộp thoại.
2. `STORY_CANON_V3.md` + `REFERENCES/STORY_V3_CANON.docx`: nội dung, thế giới, tình tiết, nhân vật, reveal.
3. `REFERENCES/STORY_V1_ORIGINAL.docx` + `REFERENCES/STORY_V2_CINEMATIC.docx`: **ngôn ngữ đạo diễn** (mưa, chuyển cảnh, cửa sổ, ánh sáng, mảng âm, tiếng ghế kéo, khoảng lặng), không tái sử dụng tình tiết đã bị thay bởi V3.
4. `GAME_DIRECTOR_BIBLE.md`: tương tác/camera/âm thanh mới.
5. `SCENE_SHOTLIST_AND_INTERACTIONS.md` & `SOUND_AND_ATMOSPHERE.md`: dựng thực tế.
6. `ARCHITECTURE_AND_ASSETS.md`, `QUALITY_GATES.md`: thực thi, chứng cứ nghiệm thu.

## Quyết định khóa
- 2046: AION là AI đa năng hạng #1 thế giới hư cấu. AION KHÔNG phải sản phẩm lưu trữ ký ức; kho tư liệu chỉ là một khả năng trong nhiệm vụ riêng.
- 2026: An là sinh viên CNTT. 17:05 sau giờ học, cô Vân ngồi lại. Mô hình nhỏ **của An** đánh giá và gạt chính An bằng `NOT RECOMMENDED`; **mô hình 2026 không phải AION**.
- Người chơi tham gia tái dựng, **không thay đổi quá khứ**. Trong phân cảnh phản tỉnh, người chơi khám phá cách biến `FINAL JUDGMENT` thành `NEXT SUPPORT STEP` trong mô phỏng nguyên tắc tương lai.
- Reveal An là người tạo AION **chỉ ở S04**, sau khi người chơi hiểu nghịch lý.
- `20:11` biểu tượng 20/11, **không phải giờ 20:11**. Chiều 17:05 có mưa lất phất/đang ngớt và ánh chiều sau mưa; đảm bảo logic thời tiết.
- Không VR, WebXR, kính, app native hay thế giới mở. Chạy tốt bằng chuột, cảm ứng, bàn phím, tắt âm, giảm chuyển động.
- Không ép art style từ các mockup ảnh AI trước. Codex có quyền quyết định cách dựng scene, nhưng **không được làm landing page, slideshow, card/dashboard, website profile, ảnh tĩnh phủ nút**.

## Kết quả cần chứng minh trước khi phát triển hết
**Vertical slice S02–S03 (30–60 giây chơi thật)**: nghe mưa và tiếng phòng máy; camera tiến từ cửa đến cửa sổ/laptop; ít nhất 2 đồ vật tương tác; cô Vân bước vào và kéo ghế; thoại ngắn có subtitle; thử hồ sơ An; sự kiện âm thanh rút xuống khi `NOT RECOMMENDED`. Nếu slice này chưa tạo cảm giác game, **không xây 7 màn web rồi coi như xong**.

## Lịch tính từ 16/11
- 16/11: proof-of-feel S02–S03 và playable spine S00–S06, không chờ hoàn thiện art.
- 17/11: khóa gameplay, tối ưu, test, có build stable và video demo. **Nộp trước 20:00; mục tiêu nội bộ sớm hơn để dự phòng.**
- 18–19/11: chỉ làm polish không làm hỏng bản nộp; tập dượt Gala.
