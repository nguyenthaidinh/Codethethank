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
        return "2026. Một ước tính theo mục tiêu cũ, không phải tương lai của một người.";
      if (s.memoryFocus === "chair")
        return "Cô Vân chọn ngồi lại, khi chưa biết An sẽ đi được đến đâu.";
      if (s.memoryFocus === "notebook")
        return "NEXT SUPPORT STEP. Giữ lời giải thích và cơ hội để con người xem lại.";
      return "[Một trang giấy trắng. Bên cạnh: hồ sơ cũ, cuốn sổ và chiếc ghế đã được kéo lại gần.]";
    case "lesson":
      return t < 5
        ? "AION: Hai mươi năm trước, một hệ thống đã dự đoán rằng An không nên được ưu tiên hỗ trợ."
        : t < 7
          ? ""
          : t < 11
            ? "AION: Nhưng dự đoán ấy không quyết định con người An trở thành."
            : t < 14
              ? "AION: Điều An mang theo không chỉ là kiến thức."
              : "AION: Đó còn là cách một người đã đối xử với mình khi mình gặp khó khăn.";
    case "question":
      return t < 2
        ? "AION: Còn bạn?"
        : t < 3.5
          ? ""
          : "AION: Trong hành trình của mình, ai là người bạn muốn gửi lời cảm ơn?";
    case "paper":
      return "Một lời cảm ơn có thể bắt đầu bằng vài chữ. Bạn cũng có thể giữ khoảnh khắc này trong im lặng.";
    case "letter":
      return "";
    case "review":
      return "";
    case "transform":
      return s.choice === "skip"
        ? "[Một ánh sáng từ bài học vừa được nhớ lại. Không có lời nhắn cá nhân nào được tạo.]"
        : "[Nét mực lắng lại trên giấy. Những điểm sáng cùng hướng về một ngôi sao.]";
    case "galaxy":
      return s.starSeen
        ? "[Một điểm sáng gần bạn. Những vì sao phía xa chỉ là cảnh nền.]"
        : "[Ngôi sao của khoảnh khắc này vừa xuất hiện. Chạm để nhìn gần hơn.]";
    case "closing":
      return t < 4
        ? "Có những bài học không được viết thành lời."
        : t < 5.5
          ? ""
          : "Nhưng chúng vẫn tiếp tục được trao đi.";
    case "ending":
      return "";
  }
}
