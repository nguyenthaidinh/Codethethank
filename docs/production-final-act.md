# Bản production cục bộ — Final Act

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npx playwright test --config playwright.menu.config.ts
npm run preview
```

Chạy `dist/` qua HTTP; không mở bằng file://. Với hosting tĩnh, đặt thư mục gốc ở dist và phục vụ index.html cho trang gốc. Tài nguyên game đóng gói local, không API hoặc font/CDN bên ngoài.

Trước khi đưa lên hosting: xem QA Final Act, mở game trên thiết bị đích, kiểm tra âm thanh sau user gesture, nhánh bỏ qua thư, private storage/erase, Continue completed và Replay. Giữ video fallback trong `final-act-proof/finale-live-audio.webm` cùng báo cáo bên ngoài bundle game nếu cần trình chiếu.

Thư chỉ ở khóa local `project2011.gratitude.v1`, có thể xóa ngay trong game. Không có cộng đồng/live feed/moderation backend. Không chỉnh domain/DNS, credential hoặc triển khai dịch vụ từ repo này. Việc deploy cần yêu cầu riêng của chủ dự án.
