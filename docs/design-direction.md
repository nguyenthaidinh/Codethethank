# Art direction và experience map

> Tài liệu của bản V2 cũ, đã được thay thế bởi `GAME_DIRECTOR_BIBLE.md` và `cinematic-audit.md`. Không dùng bố cục panel V2 để mở rộng game.

Hai phương án, thang 1–5 (đánh giá thiết kế, không phải kết quả user testing):

| Hướng | Game-like | Cảm xúc | Dễ đọc | Mobile | Khả thi |
|---|---:|---:|---:|---:|---:|
| Phòng ký ức 2.5D: góc nhìn ngang phối cảnh, xanh dầu / nắng đất, vật thể SVG | 5 | 5 | 4 | 4 | 5 |
| Hồ sơ điều tra: giấy, sơ đồ kỹ thuật, camera top-down, UI dày hơn | 3 | 3 | 5 | 5 | 5 |

Chọn phòng ký ức (23/25): không gian và chiếc ghế giữ trọng tâm cảm xúc. Các panel giấy/hồ sơ chỉ xuất hiện theo nhiệm vụ. SVG tự dựng, không ảnh AI/stock, không WebGL, không font ngoài. Dùng CSS animation nhẹ, tắt qua hệ điều hành hoặc cài đặt game.

| Scene | Không gian / hành động | Phản hồi / gate |
|---|---|---|
| S00 | Hội trường, lõi AION | Mở protocol, founder ẩn |
| S01 | Góc nhìn phân bổ hỗ trợ | Hai lý giải khác nhau, lưu lựa chọn |
| S02 | Bàn thực hành, 3 hotspot | Hiện bằng chứng; đủ 3 mới đi tiếp |
| S03 | Ghế cô Vân bên An | Chọn/kéo hồ sơ, test, khoảng lặng 2s, câu hỏi |
| S04 | Sơ đồ quy tắc, montage 6 mốc | Đổi đầu ra, xem 20 năm rồi reveal |
| S05 | Sân khấu / mạng nguyên tắc | Kết nối 3 bài học, không score |
| S06 | Chòm sao và lời tri ân | Xem lại, tạo sao local hoặc bỏ qua |

UI kit: tokens CSS cho nền, chữ, accent, border; nút primary/secondary/disabled/pressed/focus; quote phụ đề; status, hint 8 giây; profile kéo/chạm; panel bằng chứng; xác nhận reset; trạng thái lưu thất bại. Nội dung luôn đọc được khi không có âm thanh.

Nhịp đọc: không timer ép người chơi. Nhắm 3–5 phút qua đọc lời thoại và điều tra; thời gian E2E nhanh không được xem là bằng chứng playtest người thật.
