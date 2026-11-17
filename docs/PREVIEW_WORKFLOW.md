# Cổng preview cố định

Theo yêu cầu của Product Owner: từ nay dùng **http://127.0.0.1:4231/** cho các lần chỉnh giao diện/game trong chat này. Không tạo thêm port hoặc tab sau mỗi lượt sửa.

- `npm run build:review`: cập nhật bản production vào cùng thư mục `dist-research-cinematic-review`.
- `npm run preview:review`: khởi động preview cổng 4231 nếu chưa chạy. `--strictPort` ngăn Vite tự nhảy sang cổng khác; nếu server đã chạy thì dùng lại, không chạy thêm.
- Sau build chỉ refresh tab hiện có khi cần; không tự ghi đè save. Các trang nhảy thẳng tới phân cảnh chỉ dùng khi cần review và phải giữ cùng origin này.
- Không xóa build cũ chỉ để dọn server. Không tắt các dịch vụ của công việc khác, đặc biệt preview phần thư đang được làm riêng.

Đã đóng bốn tab game cũ và dừng 11 server preview từ 4220 đến 4230. Tab/cổng 4231 được giữ lại. Preview `vite.f58.config.ts` của phần thư không bị dừng.
