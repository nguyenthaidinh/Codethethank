# Ánh sáng lớp học 17:05 — 17/11/2026

## Thay đổi

Giữ nguyên camera/UI vừa duyệt để đánh giá riêng ánh sáng. Bề mặt sơn trong phòng trước đây dùng MeshBasicMaterial, không nhận ánh sáng; vì vậy tường/trần sáng phẳng dù giảm đèn. Chuyển riêng vật liệu sơn nội thất sang nhánh Lambert đã có. Giữ màu, texture, hình học và vật liệu cảnh ngoài cửa sổ.

Thêm ClassroomLighting để cân nguồn sáng trong scene lớp học: giảm phần sáng phủ đều, chỉnh hướng/màu ánh cửa sổ lạnh, giảm sắc vàng của đèn bàn trên da, thêm một SpotLight có penumbra rộng và falloff quanh hai nhân vật. Không bloom, không LUT, không đổi exposure và không thêm shadow map. Bản thử làm mặt quá sáng đã bị loại; thư mục iteration ghi lại các bước thực tế.

Ba file runtime thuộc đợt này:

- `src/cinematic/ClassroomLighting.ts`: cấu hình và vòng đời nguồn sáng mới.
- `src/cinematic/WorldRenderer.ts`: chỉ import, giữ reference, khởi tạo, cập nhật và dispose lighting rig.
- `src/art/ClassroomArt.ts`: bỏ interior paint khỏi nhóm vật liệu unlit.

Camera, UI, nhân vật, palette, animation, lời thoại, state, save/checkpoint và AudioDirector không đổi. Không sửa file nào trong `src/finale`. `source-scope.json` đối chiếu SHA-256 toàn bộ source trước/sau; kiểm tra cấu trúc AST giữ nguyên WorldRenderer ngoài các điểm nối lighting được phép. Nhánh render 2046/Finale trả về trước khi cập nhật ánh sáng lớp học và dùng scene riêng.

## Xem bản chạy

`review.html` có ảnh runtime trước/sau cùng checkpoint, thanh kéo so sánh, ảnh mobile và video browser với audio bus thật. Không hậu kỳ màu ảnh, không dùng ảnh concept làm bằng chứng.

Preview riêng: `http://127.0.0.1:4192/_lighting-review.html`. Production build ở `dist-lighting-review`; không ghi đè dist của phiên làm thư. Checkpoint thử chỉ ghi ở origin cổng4192. Save tại cổng5173/4173 giữ riêng.

## Kiểm chứng

**Kết quả cuối: typecheck/lint/build PASS, 66 unit PASS. Cả 5 ca E2E liên quan đã được xác minh: desktop chair, mobile chair/reduced motion, Canvas chair, laptop-first tới đánh giá An và Chapter02 mobile silent/save-resume. Canvas PASS ở lần kiểm tra lại sau sửa đồng bộ câu thoại; log lỗi ban đầu vẫn được giữ.**

Video H.264/AAC 1280×720 dài 27.145 giây, 604 khung browser được thu cùng âm thanh trực tiếp. Không có lời đọc nhân vật. Camera/target/FOV trước-sau giống hệt ở cả hai tỷ lệ khung hình; xem `render-comparison.json`.

- Baseline: 64 unit PASS.
- Sau sửa: typecheck/lint PASS, 66 unit PASS, production build PASS.
- Lần unit đầu có một source guard N2 phát hiện thay đổi vật liệu sơn. Bổ sung đúng file được phép và test kiểm tra toàn bộ phần còn lại của ClassroomArt không đổi; không bỏ kiểm tra gameplay/canon. Log đầu giữ trong `unit.log`, kết quả cuối ở `unit-final.log`.
- E2E: `e2e.json`/`e2e.log` ghi lần chạy đầu. Canvas chair ban đầu nhấn tiếp từ câu Cô Vân thứ nhất sang câu Cô Vân thứ hai rồi lại chờ An; renderer Canvas dùng cùng master cho cả hai câu. Sửa bài test chờ đúng line1 StoryV4 trước khi nhấn, giữ nguyên assertion chuyển sang An. Không sửa runtime/state để xử lý lỗi này. Lần kiểm tra Canvas cuối PASS được ghi riêng trong `canvas-recheck.json`/`.log`.
- Recording, ảnh, telemetry và kiểm chứng trang review nằm trong thư mục này. Kết quả PASS/FAIL cụ thể phải đọc từ các log, không suy ra chỉ từ screenshot.

Các lệnh đã dùng:

```powershell
node node_modules/typescript/bin/tsc --noEmit
node node_modules/eslint/bin/eslint.js src tests
node node_modules/vitest/vitest.mjs run
node node_modules/vite/bin/vite.js build --outDir dist-lighting-review
node node_modules/@playwright/test/cli.js test --config=playwright.lighting-review.config.ts cinematic-chair.spec.ts cinematic-stayed.spec.ts cinematic-laptop-first.spec.ts --grep 'Chair:|mobile silent reduced resume|Laptop first.*desktop' --reporter=list,json
node scripts/record-classroom-lighting.mjs
node scripts/preview-classroom-lighting.mjs
```

## Giới hạn

Đây là lighting pass trên model hiện tại. Hình học tóc, mặt, trang phục và biểu cảm không được làm lại; ánh sáng không thay thế chất lượng asset. Cần Product Owner duyệt hình ảnh qua video.

Một spotlight mới không đổ bóng; shadow map cũ vẫn 1024×1024. Không thêm geometry hay texture. Ở cùng khung desktop: 102 draw calls / 83,402 triangles trước và sau; không tuyên bố FPS vì có tác vụ browser khác chạy đồng thời trên máy. Mobile là touch emulation, chưa có điện thoại thật. Canvas fallback giữ mỹ thuật 2D cũ và được kiểm tra chức năng.

Cinematic bundle hiện tại 766.51kB (gzip206.86kB), vẫn có cảnh báo chunk>500kB. Không gán toàn bộ chênh lệch với báo cáo cũ cho lighting vì source trước phiên này đã chứa công việc Finale khác. Không deploy/push và không tiếp tục redesign các chương khác.
