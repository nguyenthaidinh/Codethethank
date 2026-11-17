# DESIGN BRIEF FOR CODEX — CREATIVE AUTONOMY

## Brief
Hãy tự thiết kế một hệ thống hình ảnh và UX hoàn chỉnh cho **một game điện ảnh tương tác thực sự**, không phải website giới thiệu, dashboard quản trị, infographic, gallery concept AI hay ứng dụng đọc truyện với nút Next.

**Codex có toàn quyền sáng tạo giao diện.** Không dùng lại các ảnh mockup trước đó như tài liệu style bắt buộc. Ưu tiên thiết kế bằng HTML/CSS/SVG/Canvas/Three.js khi cần thiết; chỉ dùng assets có nguồn gốc hợp lệ.

## Core qualities
1. **Playable:** Người chơi nhìn thấy một không gian, hiểu mình được làm gì và có phản hồi rõ mỗi thao tác.
2. **Cinematic:** Camera/composition, ánh sáng, âm thanh và chuyển cảnh nâng câu chuyện, không áp hiệu ứng trang trí lên mọi thứ.
3. **Grounded:** 2026 có cảm giác phòng học đại học thật; 2046 tiên tiến nhưng hợp lý về kiến trúc và thiết bị.
4. **Emotionally paced:** chừa khoảng lặng cho chiếc ghế, nắng chiều, kết quả `NOT RECOMMENDED`; không phủ HUD lên gương mặt khi cần cảm xúc.
5. **Elegant:** typography hỗ trợ tiếng Việt; panel chỉ hiển thị khi cần, không biến môi trường game thành một đống thẻ/chỉ số.
6. **Accessible:** tap targets dễ bấm, đọc được ở 360px, không phụ thuộc chuột, có phụ đề và reduced motion.

## Creative freedom
Codex được tự chọn:
- style thực tế điện ảnh, stylized semi-realistic, low-poly narrative, 2.5D composited hoặc 3D gọn;
- bảng màu và ngôn ngữ shape/material (không phải sao chép sắc tím cũ);
- camera cho từng scene (isometric, side-on, cinematic stills, FPS-like observation, fixed framing...);
- cấu trúc home screen / HUD / options / dialog / interaction prompts;
- toàn bộ microinteractions, âm thanh, transitions, motion system;
- cách minh họa bối cảnh bằng CSS/SVG/procedural graphics/tài nguyên có phép.

## Anti-patterns / no-go
- Neon tím là mặc định toàn game; text gold phát sáng khắp nơi; mọi nút có viền hologram;
- hero poster có người khổng lồ + các ảnh chân dung/cảnh lơ lửng;
- overlay dày khiến che mất hành động; “UI đẹp” nhưng gameplay click không đổi trạng thái;
- bảng số impact thật giả dễ gây hiểu sai, stock faces thiếu nhất quán, ảnh generated-looking;
- animation 3D nặng khiến điện thoại đứng hình;
- 2026 có các công nghệ hoặc nhãn thương hiệu AION 2046; tên founder lộ sớm.

## Giao sản phẩm theo bước
**Bước D1:** Đọc Story Canon, vẽ experience map + UI inventory 7 cảnh, tối đa 1 trang.

**Bước D2:** Tự đề xuất tối thiểu hai hướng thiết kế ngắn (khác nhau ở chất liệu, camera, mật độ UI). Cho điểm từng hướng theo 5 tiêu chí: game-like, cảm xúc, đọc rõ, mobile, khả thi trước hạn; chọn hướng cao nhất và ghi lý do. Không cần tạo ảnh bằng công cụ sinh ảnh.

**Bước D3:** Lập design tokens + UI kit trong code: typography, background/foreground, spacing, buttons, focus state, dialogue, selectable evidence, status/hint, loading/error/fallback.

**Bước D4:** Xây **vertical slice S02→S03**, hoàn chỉnh bối cảnh, thao tác, đối thoại, chuyển cảnh và responsive. Tạo ảnh chụp màn hình từ app đang chạy thực tế ở desktop và mobile. Tự rà soát, cải thiện trước khi mở rộng.

**Bước D5:** Mở rộng thiết kế 7 cảnh, đảm bảo mỗi cảnh có tính nhận diện nhưng cùng một hệ thống UI. Chạy screenshot audit để xác minh viewport thực.

## Câu hỏi kiểm tra sau mỗi scene
- Người chơi có biết **mình cần làm gì** trong 3 giây không?
- Có ít nhất một thứ rõ ràng cho họ thao tác, không chỉ đọc văn bản không?
- Nếu ẩn UI, môi trường có còn giống một **không gian game có chủ đích** không?
- Nhân vật/câu chuyện có trở thành trung tâm thay vì hiệu ứng không?
- Đổi qua màn hình 390×844 còn đọc/chạm được không?

## Presentation
Sản phẩm cuối phải có bằng chứng qua **screenshot browser thực tế** và thao tác test. Không dùng ảnh sinh AI như bằng chứng đã code UI. Nếu một scene thiếu asset, dùng art direction tối giản/hình học/đạo cụ UI hợp lý thay vì thế hình giả giống screenshot.
