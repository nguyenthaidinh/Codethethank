# PROMPT DÁN THẲNG VÀO CODEX — CHỈNH LẠI HƯỚNG GAME

Bạn đang làm dự án `PROJECT 20:11 — THE UNWRITTEN LESSON`. **Yêu cầu này thay thế định hướng V2 trước đó**. Tôi không chấp nhận sản phẩm trông như website/story slideshow nhiều card, bảng điều tra và nút Next. Tôi muốn **một cinematic interactive narrative game thực sự**: có bối cảnh được dựng như scene game, camera chuyển động có chủ đích, mưa và tiếng môi trường, âm thanh thay đổi theo nơi nhìn, nhân vật bước vào/phản ứng, và hành động chạm đồ vật ảnh hưởng diễn tiến. UI tối giản, nằm dưới thế giới trò chơi.

**ĐỌC THEO THỨ TỰ:** `README_FIRST.md`, `STORY_CANON_V3.md`, `GAME_DIRECTOR_BIBLE.md`, `SCENE_SHOTLIST_AND_INTERACTIONS.md`, `SOUND_AND_ATMOSPHERE.md`, `ARCHITECTURE_AND_ASSETS.md`, `QUALITY_GATES.md`. Đối chiếu ba kịch bản DOCX trong `REFERENCES/`: V3 khóa **story**; V1/V2 cung cấp **đạo diễn hình và âm** (mưa/cửa sổ/tiếng chuông/bước chân/ghế kéo/im lặng/match-cut). Không tái sử dụng chuyện 20:11 buổi tối hoặc AION/ECHO là kho ký ức.

**CANON:** AION #1 thế giới AI hư cấu 2046, An là founder chỉ REVEAL S04. 2026 An là sinh viên CNTT, 17:05 cô Vân ngồi lại sau giờ học, model riêng An trả `NOT RECOMMENDED` cho hồ sơ An; model này KHÔNG phải AION. Cô Vân giúp An sửa câu hỏi đặt ra với công nghệ; thiết kế tương lai đổi `FINAL JUDGMENT` → `NEXT SUPPORT STEP`. Không VR/WebXR. Game tiếng Việt, chạy desktop/mobile, có phụ đề, mute, reduced motion.

**VIỆC ĐẦU TIÊN:** audit source hiện tại, chỉ ra những thành phần đang gây cảm giác 'web hơn game'. Giữ logic tốt, thay trải nghiệm. Không viết thêm 30 trang plan; phải thực thi code.

**GATE 1 — PROOF OF FEEL:** trong repository, xây phân cảnh S02–S03 ngắn 30–60 giây chơi được bằng browser: từ cửa nhìn vào phòng lab 17:05, nghe mưa ngoài cửa sổ/quạt/bước chân, camera tiến đến An/laptop, 2 hotspot focus thật, cô Vân vào và kéo ghế, thoại ít/subtitle gọn, thử hồ sơ An và audio duck khi `NOT RECOMMENDED`. Cho tôi recording browser có chuyển động và âm (hoặc chứng cứ cụ thể khi môi trường không hỗ trợ video), **không dùng ảnh AI làm giả screenshot game**. Có bản mobile tương tác bằng tap.

**GATE 2:** mở rộng vertical slice, thêm scene choreography, animation, dialogue/cues; code camera/audio state dùng chung.

**GATE 3:** xây các cảnh còn lại S00/S01/S04/S05/S06 theo shotlist, giữ âm thanh motif chiếc ghế và match-cut, reveal nhà sáng lập đúng lúc, tạo ngôi sao tri ân.

**GATE 4:** thực thi lint, typecheck, build, test chính, test mobile/mute/reduced motion/resume. Ghi đúng lệnh đã chạy và kết quả thực tế. Cắt scope nếu cần nhưng giữ sự hấp dẫn của game. Không tự deploy/push hay dùng dịch vụ trả phí khi chưa có sự cho phép.

Bạn được quyền chọn và xây art direction, phối cảnh, runtime 2D/2.5D/Three.js và animation phù hợp. Đừng sao chép bất kỳ ảnh UI cũ nào. **Chỉ mở rộng toàn game sau khi phân cảnh mưa — cô Vân — chiếc ghế — laptop đạt chất lượng trải nghiệm. BẮT ĐẦU SỬA CODE NGAY.**
