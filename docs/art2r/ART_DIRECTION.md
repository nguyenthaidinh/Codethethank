# Gate 2R — Classroom 17:05 / art reset

**Trạng thái: bản runtime để duyệt art. Gate 3 đóng.** Gate 2 cũ bị Product Owner đánh FAIL về hình ảnh; PASS kỹ thuật không thay thế quyết định này. Không đổi canon, gameplay, schema save hoặc mở rộng chapter.

## Ba lựa chọn

| Hướng | Ngôn ngữ hình ảnh | Điểm mạnh / đánh đổi |
|---|---|---|
| **A. Paper & Rain — chọn** | Khối nhân vật mềm, mặt vẽ, viền mực xanh; cửa sổ xanh mưa, cardigan vàng đất, giấy ngà và bàn gỗ ấm | Đọc rõ người–đồ vật, mưa vẫn lạnh nhưng khoảnh khắc ngồi lại ấm. Palette gọn, phù hợp desktop/mobile và vật liệu nhẹ |
| B. Blue Hour Ink | Mảng indigo, tường và sàn xanh, điểm sáng giấy/đèn hổ phách | Không khí nội tâm mạnh; dễ làm phòng học trông lạnh và xa cách hơn nội dung cô Vân |
| C. Copper Memory | Tường mật ong, gỗ đồng, bóng xanh ngọc, giấy vàng | Hồi ức thân mật; giảm tương phản cảm xúc giữa mưa và người ở lại, có nguy cơ thành sepia |

Ảnh ba lựa chọn là **cùng classroom đang render thật**, khác treatment màu/ánh sáng; không phải ba bộ concept hoặc ba game hoàn chỉnh. Các URL kiểm tra: `/?narrative=paper-rain`, `/?narrative=blue-ink`, `/?narrative=copper-memory`. A là mặc định, không thêm bước chọn art vào luồng chơi.

## Hướng đã triển khai: Paper & Rain

- **An:** thân áo dựng bằng các vòng khối có silhouette, cổ áo/pocket/cổ tay, giày dây; mặt được vẽ lên UV với mắt, mi, lông mày, quầng mệt và miệng; đầu hơi cúi, quay về cô Vân khi nghe. Tay phải chạm trackpad, tay trái theo bút bằng IK hai đoạn. Chớp mắt theo runtime, tắt khi reduced motion.
- **Cô Vân:** cardigan vàng đất, lớp áo ngà, nẹp, ghim xanh, tóc có búi và đường mái liên tục; dáng đứng/ngồi, nghiêng người, nhìn An và với cuốn sổ. Không còn thân hộp và hai mắt cầu gắn nổi của mẫu cũ.
- **Bố cục:** hạ và kéo bàn gần An; camera cửa→bàn tập trung hơn; cận An và shot hai người đặt trong khoảng giữa người và laptop, tránh nhìn xuyên mặt sau màn hình. Hai người quay về nhau khi nói. Góc cuốn sổ nhìn chéo từ trên để thấy trang giấy và bàn tay; không để đầu cô Vân che nội dung. Portrait chuyển câu hỏi của cô Vân sang cận nhân vật, thay vì cố nhét hai người vào khung hẹp.
- **Ánh sáng:** cửa sổ xanh tạo khối lớn, đèn bàn làm điểm ấm; mặt có ánh bù giấy ấm để đọc được biểu cảm. Mảng tường dùng wash màu vẽ có chủ đích, sàn và đồ vật vẫn nhận bóng thật. Giảm noise kiểu giả vật liệu thực. Toon ramp và viền mực hỗ trợ hình khối đã dựng lại, không dùng filter toàn cảnh thay cho model.
- **Chiếc ghế:** giữ chính xác camera, đường kéo và nhịp của `CHAIR_MOTIF`; tay cô Vân hướng vào lưng ghế, dáng ngồi giữ chân chạm sàn. Âm ghế và khoảng lặng dùng hệ audio hiện có.
- **UI:** bỏ các vòng radar lớn; giữ vùng chạm 56px nhưng chỉ vẽ glint nhỏ. Tên hiện khi hover/focus; subtitle màu giấy, thanh điều khiển gọn; tab đọc sổ nằm dưới trang. Tên accessible và hành vi keyboard/touch giữ nguyên.

## Vì sao thay đổi có ý nghĩa

Hình ảnh cũ dựa vào nhiều chi tiết lớp học nhưng người vẫn là khối mannequin nhỏ, ánh sáng xanh xám đồng đều và hotspot cạnh tranh với cảnh. Bản này đổi **hình học, mặt, trang phục, tư thế, tay–đồ vật, camera và overlay** cùng một ngôn ngữ màu. Nhân vật và giấy là nơi mắt dừng lại; mưa và những bàn trống làm hậu cảnh. Đây là lý do chọn A, không dựa trên việc tăng độ bóng/shader.

## Nguồn và ranh giới

Nguồn story: `docs/STORY_CANON_V3.md` và `docs/GAME_DIRECTOR_BIBLE.md`; state thực: `src/chapter/director.ts`, `src/verdict/state.ts`, `src/stayed/state.ts`, `src/ripple/state.ts`, `src/finale/state.ts`; motif: `src/cinematic/motifs.ts`.

Tất cả model classroom/nhân vật mới, mặt, grain, ánh wash và UI được dựng bằng TypeScript/Three.js/Canvas/CSS trong repo. Không thêm ảnh AI, stock background, asset tải mạng, dependency hay dịch vụ. Âm thanh dùng audio procedural sẵn có; không thêm voice AI. Menu và các chapter ngoài classroom không được redesign. Fallback 2D giữ đường chơi hiện hữu; không tuyên bố đạt cùng độ chi tiết của WebGL.

## Duyệt bằng runtime

Mở [REVIEW.html](REVIEW.html) qua server local để xem trước/sau, ba treatment và video. Before là **Gate 2 ngay trước reset**, không phải bản G1 xa hơn. PNG là ảnh browser, video là runtime; không chỉnh pixel hay dùng concept thay bằng chứng. Camera sau đã được bố cục lại nên không gọi mọi cặp là “camera khớp”; riêng chair insert giữ motif cũ.

Art vẫn cần Product Owner xem chuyển động/biểu cảm và chốt chất lượng hero slice. Chưa có playtest người ngoài, kiểm tra màn hình/điện thoại thật hoặc character animation thủ công chuyên sâu; không ghi “AAA”, “art PASS” hay mở Gate 3 từ kết quả test tự động.
