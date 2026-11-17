import type { FinaleSave } from "./state";
export const prompts = [
  "Cảm ơn vì đã ngồi lại cùng em khi em chưa biết phải bắt đầu lại thế nào.",
  "Cảm ơn vì đã đặt một câu hỏi giúp em nhìn thấy khả năng khác.",
  "Bài học của thầy cô vẫn đang được em viết tiếp, theo cách của mình.",
];
export function finaleCaption(s: FinaleSave, t: number) {
  switch (s.phase) {
    case "memory":
      if (s.memoryFocus === "evaluation")
        return "2026: NOT RECOMMENDED. Kết quả ấy vẫn giữ nguyên; nó không phải câu trả lời cuối cùng về An.";
      if (s.memoryFocus === "chair")
        return "Cô Vân đã ngồi lại, lắng nghe và cho An cơ hội tiếp tục. Cô không hứa cậu sẽ thành công.";
      if (s.memoryFocus === "notebook")
        return "HUMAN REVIEW: nguyên tắc được An viết ra. Thiếu hoàn cảnh thì con người xem xét thêm, không tự động duyệt hỗ trợ.";
      return "[Một trang giấy trắng. Bên cạnh: hồ sơ cũ, cuốn sổ và chiếc ghế đã được kéo lại gần.]";
    case "lesson":
      return t < 4
        ? "AION: Cô Vân đã dạy An kiểm tra cả câu hỏi, không chỉ kết quả."
        : t < 6
          ? ""
          : t < 10
            ? "AION: Cô cùng An đọc lại dữ liệu, nhận ra điều còn thiếu và tìm hướng sửa."
            : t < 15
              ? "Cô không làm thay bài tập. Cô giúp An học cách tự tìm lời giải."
              : "Sự tận tâm ấy trở thành bài học An mang theo suốt cuộc đời.";
    case "question":
      return t < 2
        ? "AION: Còn bạn?"
        : t < 3.5
          ? ""
          : "AION: Bạn nhớ người thầy, người cô nào đã giúp mình hiểu một bài học khó?";
    case "paper":
      return "Hãy gửi thầy cô một lời cảm ơn về điều bạn đã được học. Bạn cũng có thể tiếp tục mà không viết.";
    case "letter":
      return "";
    case "review":
      return "";
    case "transform":
      return s.choice === "skip"
        ? "[Một ánh sáng từ bài học vừa được nhớ lại. Không có lời nhắn cá nhân nào được tạo.]"
        : "[Lời cảm ơn của bạn hóa thành một ngôi sao riêng tư. Chưa công khai.]";
    case "galaxy":
      return s.starSeen
        ? "[Một điểm sáng gần bạn. Những vì sao phía xa chỉ là cảnh nền.]"
        : "[Một ngôi sao tri ân vừa xuất hiện trong không gian riêng của bạn. Chạm để nhìn gần hơn.]";
    case "closing":
      return t < 4
        ? "Có những bài học không được viết thành lời."
        : t < 5.5
          ? ""
          : "Nhưng chúng có thể được trao đi suốt một đời.";
    case "ending":
      return "";
  }
}
