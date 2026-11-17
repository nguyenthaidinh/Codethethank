export type EvidenceId = "presentation" | "notes" | "data";
export const evidence = {
  presentation: {
    focus: "notebook",
    label: "Đọc bản thuyết trình",
    title: "ĐỀ NGHỊ HỖ TRỢ · STUDENT 07",
    text: "STUDENT 07 — Đề nghị đã ẩn danh, cô Vân cung cấp cho bài học: em thiếu thiết bị, vẫn cố làm bài và xin thêm thời gian sử dụng phòng máy.",
    connection:
      "Thiếu thiết bị không đồng nghĩa thiếu ý muốn học. Dự đoán lợi ích và nhu cầu hỗ trợ là hai điều khác nhau.",
  },
  notes: {
    focus: "notes",
    label: "Đọc sổ thiết kế",
    title: "SỔ THIẾT KẾ CỦA AN",
    text: "Bài tập của An: xây bản thử nghiệm xếp ưu tiên giờ thực hành bổ sung, dựa vào mức tiến bộ và mức đều đặn. LOW PREDICTED BENEFIT → NOT RECOMMENDED. Chưa có bước xem xét dữ liệu thiếu.",
    connection:
      "Mục tiêu đang chọn kết quả dễ đạt. Nó chưa trả lời nên hỗ trợ người gặp khó khăn bằng cách nào.",
  },
  data: {
    focus: "laptop",
    label: "Xem dữ liệu thử nghiệm",
    title: "DỮ LIỆU THỬ NGHIỆM",
    text: "STUDENT 07: NOT RECOMMENDED. Kết quả giảm, vắng học, bài tập không đều. Dữ liệu chưa ghi nhận điều kiện thiết bị và đề nghị dùng thêm phòng máy.",
    connection:
      "Dữ liệu thiếu hoàn cảnh và nỗ lực. Kết quả mô hình không mô tả đầy đủ An, càng không chốt tương lai.",
  },
} as const;
export const evidenceIds = Object.keys(evidence) as EvidenceId[];
