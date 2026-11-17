# PROMPT GIAO CODEX — BẮT ĐẦU TRIỂN KHAI NGAY

Hãy sao chép phần bên dưới và gửi vào Codex **tại thư mục gốc repository có các tài liệu đi kèm**.

---

Bạn là **Technical Lead + Game Developer + UX/UI Designer + QA Engineer** của dự án dự thi CODE THE THANKS 2026:

**PROJECT 20:11 — THE UNWRITTEN LESSON**.

Nhiệm vụ của bạn là **tự thiết kế và xây dựng một cinematic interactive web game chạy được thật**, không chỉ lên kế hoạch, không chỉ tạo trang landing, không tạo poster. Tôi giao cho bạn quyền tự chủ UX/UI, bố cục, camera, design system, graphic style, transition và animation — hãy sáng tạo như một nhà thiết kế game chuyên nghiệp. **Không sao chép bất kỳ hình mockup AI cũ nào.**

## Đọc trước khi làm
1. `AGENTS.md`
2. `README_FIRST.md`
3. `STORY_CANON_V3.md`
4. `MASTER_IMPLEMENTATION_PLAN_V2.md`
5. `DESIGN_BRIEF_FOR_CODEX.md`
6. `TASK_BOARD_AND_GATES.md`
7. `QA_RELEASE_CHECKLIST.md`
8. `STORY_V3_SOURCE_EXTRACT.md` để đối chiếu lời thoại và nhịp 7 cảnh.

Nếu repo đã có mã, **audit** và giữ nguyên cấu trúc hữu ích trước khi sửa. Nếu trống, ưu tiên React + TypeScript + Vite; được cân nhắc thư viện animation/game/3D với giải thích ngắn.

## Chỉ tiêu không được thay đổi
- S00..S06 đầy đủ và chơi được end-to-end; game dài mục tiêu 3–5 phút.
- AION là AI đa năng #1 **trong thế giới hư cấu năm 2046**.
- An là sinh viên CNTT 2026 và chính là founder của AION; **không lộ danh tính founder đến S04**.
- 2026: 17:05 sau giờ học ở phòng thực hành đại học; cô Vân ngồi lại cùng An; prototype đánh giá hỗ trợ học tập do An tự viết trả `NOT RECOMMENDED` khi thử hồ sơ An.
- Prototype năm 2026 **không phải AION**; cốt truyện nói về đặt sai mục tiêu tối ưu, không phải syntax error.
- Người chơi phải: (1) điều tra bằng chứng, (2) thử hồ sơ An, (3) đổi `FINAL JUDGMENT` → `NEXT SUPPORT STEP`.
- 20:11 là biểu tượng ngày 20/11, không phải giờ học.
- Kết thúc: tri ân bằng ngôi sao, có trạng thái local/public trung thực.
- Không VR, không WebXR, không bắt đăng nhập, không score đạo đức.
- UI game chính tiếng Việt, tương tác cảm ứng/chuột, phụ đề, mute, save/resume.

## Cách làm (thực thi tuần tự, không chỉ trả lời)
**Gate 0 — Repo audit.** Liệt kê thực trạng code, công cụ sẵn có, rủi ro và kế hoạch ngắn nhất. Không cần chờ trả lời trừ khi thay đổi ngoài phạm vi hoặc cần credential.

**Gate 1 — Playable skeleton.** Tạo state machine S00→S06, story content, save/load, settings, CTA, giao diện placeholder **bằng code** và kiểm chứng luồng chơi trên browser. Chạy build/typecheck. Đừng trang trí nặng.

**Gate 2 — UI ownership + vertical slice.** Tự nghiên cứu/đề xuất 2 phong cách UI dưới dạng mô tả, chọn phương án bằng tiêu chí game-like, cinematic, readability, mobile, performance. Tạo design tokens và UI kit. Hoàn thiện S02→S03 có gameplay hotspot, hồ sơ An, thoại và không gian 17:05. Tạo screenshot browser thật desktop + mobile. Không dùng ảnh tạo sẵn.

**Gate 3 — Full story.** Hoàn thiện S00/S01/S04/S05/S06; S04 reveal sau khi đổi quy tắc; 20-year montage; local star ending. Tất cả các scene phải có mục tiêu/chuyển cảnh.

**Gate 4 — QA.** Chạy lint, typecheck, build, tests, E2E, responsive, reduced motion, no-audio. Sửa lỗi blocker trước polish. Ghi thực tế PASS/FAIL vào `docs/qa-report.md`. Nếu Playwright chưa cấu hình, thêm test và tự chạy sau khi cài dependency thích hợp.

**Gate 5 — Release prep.** Tạo hướng dẫn build, checklist deploy, screencast/demo fallback nếu môi trường hỗ trợ; **không tự deploy, push repo, thay đổi DNS, chi phí dịch vụ hoặc credential** khi chưa có tôi cho phép. Chuẩn bị bản production chạy được.

## Quyền tự chủ nhưng phải có trách nhiệm
- Bạn được tự thiết kế hoàn toàn art direction (không ràng buộc bởi ảnh từ cuộc hội thoại trước). Hãy làm một **bối cảnh game thật**, giảm cảm giác “AI-generated purple poster”.
- Nếu thiếu tài nguyên art, chọn kỹ thuật dựng môi trường bằng CSS/SVG/Canvas/2.5D hoặc thư viện đã được cấp phép; không dựng collage ảnh linh tinh.
- Backend public/realtime là P1/P2; không hi sinh trải nghiệm P0 để tích hợp API không ổn định. Nếu chỉ có local star phải nói đúng trạng thái.
- Tách narrative data khỏi UI, dùng type an toàn, tránh code trùng lặp và các phần giả không có chức năng.
- Sau mỗi gate, nêu **đã chỉnh file gì, kết quả game chạy thế nào, lệnh test nào đã thực thi, screenshot/preview nằm đâu, tồn tại lỗi gì, bước tiếp theo là gì**.
- Không tuyên bố hoàn thành cho đến khi thực sự chạy được S00→S06 với test.

**BẮT ĐẦU THỰC HIỆN NGAY tại repository hiện có, từ Gate 0 rồi Gate 1; không dừng ở việc viết thêm một master plan.**
