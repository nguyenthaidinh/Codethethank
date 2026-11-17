# 2035 — Thử thách sửa logic tùy chọn

Ngày kiểm tra: 2026-11-18.

Sau hai lượt thử nghiệm và bước đánh dấu dữ liệu bị bỏ sót, nút **Tiếp: sửa logic** mở bản tái dựng `support_policy.ts`. Người chơi chọn điều kiện và cách xử lý, rồi chạy bốn ca kiểm thử. Kết quả được tính từ nhánh đã chọn, không phải hiệu ứng PASS cố định. Có thể chọn sai, đọc phản hồi và thử lại. Không thực thi chuỗi code bằng `eval`.

Điều kiện thiếu bối cảnh hoặc độ tin cậy thấp cần `REVIEW_REQUIRED`. Hồ sơ đủ thông tin tiếp tục sang bước đề xuất hỗ trợ. Review chưa có nghĩa là tự động duyệt hỗ trợ. Đây là mô phỏng logic, không phải mô hình học máy hoặc API thật.

**Bỏ qua thử thách code** chỉ bỏ qua phần code, giữ nguyên bằng chứng và hai lượt thử nghiệm. Save ghi `skipped`, không ghi `passed`. Người chơi vẫn tiếp tục câu chuyện. Skip không thể vượt qua các bước điều tra bắt buộc trước đó.

## Mã nguồn

- `src/ripple/codePatch2035.ts`: lựa chọn, bộ kiểm thử, reducer và validator.
- `src/ripple/CodePatchBench2035.tsx`, `code2035.css`: giao diện chọn code, phản hồi, gợi ý, bàn phím và cảm ứng; nút skip nằm ngoài vùng nội dung cuộn.
- `experiment2035.ts`, `state.ts`: bước code tùy chọn và điều kiện chuyển cảnh.
- `RippleControls.tsx`, `LabBench2035.tsx`, `lab2035Help.ts`, `story.ts`: nối bước mới và hướng dẫn.
- `ResearchStudio.ts`: hai màn hình trong thế giới phản ánh lựa chọn và kết quả.
- `src/chapter/ChapterGame.tsx`: không phát click âm thanh theo mỗi tick của bộ kiểm thử.
- Test và helper liên quan 2035 được cập nhật. Không thay đổi cảnh, camera, ánh sáng phòng học 2026 hoặc phần thư.

## Save

Save cũ đã qua năm 2035, không có trường `codePatch`, vẫn hợp lệ. Không tự tạo bằng chứng hoặc trạng thái đã hoàn thành code cho save cũ. Save đang sửa hoặc đang kiểm thử lưu được lựa chọn, số lần thử và thời gian đã chạy. Trạng thái thành công bị giả mạo hoặc code chưa hoàn thành được mang sang checkpoint sau 2035 bị validator từ chối.

## Đã kiểm tra

- Scoped ESLint: `node node_modules/eslint/bin/eslint.js src/ripple src/chapter/ChapterGame.tsx tests/code-patch2035.test.ts tests/ripple.test.ts tests/experiment2035.test.ts tests/e2e/helpers/lab2035.ts` — PASS.
- `node node_modules/vitest/vitest.mjs run tests/ripple.test.ts tests/experiment2035.test.ts tests/code-patch2035.test.ts tests/lab2035-help.test.ts` — **21/21 PASS**, 4 file.
- `npm run build` — PASS, bao gồm TypeScript `tsc --noEmit` và Vite production build. Vẫn có cảnh báo có sẵn về import attributes của `opening-track.json` và cinematic chunk lớn hơn 500 kB.
- `node scripts/review-code2035.mjs` — PASS trên server đang có tại port 4198. Thử code sai → sửa lựa chọn → chạy bằng Enter → reload giữa kiểm thử → đạt 4/4 → tiếp tục. Không có `pageerror`.
- Cảm ứng 390×844, reduced motion: nút skip hiển thị trong viewport, skip chỉ code và giữ bằng chứng — PASS.
- Tắt WebGL, Canvas fallback trên viewport cảm ứng: mở code và skip — PASS.

Browser review sử dụng checkpoint kiểm tra đã hoàn thành phần điều tra để cô lập bước code mới. Unit test kiểm tra ràng buộc không thể skip trước khi điều tra xong. Không chạy lại toàn bộ game hoặc toàn bộ bộ E2E trong đợt chỉnh nhỏ này. Chưa đo trên điện thoại vật lý. Video bên dưới là bản ghi runtime không âm thanh; không thay thế kiểm tra audio.

## Bằng chứng runtime

- `desktop-editor.png`, `desktop-failed.png`, `desktop-passed.png`.
- `mobile-editor.png`, `fallback-editor.png`.
- `desktop.json`, `mobile.json`, `fallback.json`: trạng thái và lỗi runtime.
- `desktop-muted.webm`: video trình duyệt thật.

Chỉ reload server dev hiện tại để xem thay đổi. Không mở thêm server, deploy hay push.
