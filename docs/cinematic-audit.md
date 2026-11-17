# Audit thay hướng V3

16/11/2026 — các tài liệu V3 mới được ưu tiên.

| V2 gây cảm giác website | Thay đổi trong proof-of-feel |
|---|---|
| `App.tsx`: header, footer, cột scene/cột panel | `CinematicGame.tsx`: canvas toàn viewport, 2 nút nhỏ và phụ đề |
| `Environment.tsx`: SVG minh họa cùng bố cục | `WorldRenderer.ts`: phòng lab 3D, camera tiến/lấy góc theo prop, thời tiết, nhân vật |
| Chạm evidence để mở card | Focus camera, thay âm theo vị trí, đọc ngay màn hình/tờ giấy vật lý |
| Chuyển cảnh bằng Next | Director dừng tại mechanic, diễn tiếp sau hành động |
| Âm nền hợp âm cố định | Bus ambience/foley/music/dialogue; mưa, quạt, chuông, bước chân, cửa, ghế, phím; duck verdict |
| Một tư thế nhân vật | Walk → đứng cạnh ghế → kéo → ngồi → quay nhìn An |

Giữ `src/game/story.ts`, `state.ts` và unit tests canon cũ. Mã UI V2 vẫn còn để đối chiếu nhưng không được import vào entry production. Save cinematic dùng namespace/version riêng; không diễn giải save V2 thành đã chơi scene V3.

Đã đối chiếu ba DOCX trong `REFERENCES/` bằng trích xuất OOXML: V1/V2 dùng motif mưa, chuông, cửa sổ, bàn phím ngừng, ghế và khoảng lặng. Loại bỏ 20:11 buổi tối, BUILD FAILED, ECHO/kho ký ức và founder lộ sớm. Nội dung giữ V3: 17:05, sinh viên CNTT, prototype hỗ trợ học tập của An, NOT RECOMMENDED; cô không hứa thành công.

Phạm vi kiểm chứng hiện tại: S02–S03. Không gắn nhãn full game, release candidate hoặc Gate 3 PASS cho runtime mới. Chỉ mở rộng sau khi chất lượng slice được chấp nhận; kết quả chức năng không thay thế đánh giá cảm giác chơi.
