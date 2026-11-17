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
        ? "AION: HUMAN REVIEW là nguyên tắc An đã viết vào thiết kế."
        : t < 6
          ? ""
          : t < 10
            ? "AION: Bài học không được viết thành lời là cô đã ngồi lại, lắng nghe."
            : t < 15
              ? "Hai mươi năm trước, cô không biết học trò của mình sẽ đi xa đến đâu."
              : "Cô chỉ biết rằng hôm ấy, cậu vẫn cần một người ngồi lại.";
    case "question":
      return t < 2
        ? "AION: Còn bạn?"
        : t < 3.5
          ? ""
          : "AION: Ai đã từng ở lại bên bạn? Bạn muốn cảm ơn họ điều gì?";
    case "paper":
      return "Nhớ về người ấy. Bạn có thể viết vài lời của mình, hoặc giữ lời cảm ơn trong im lặng.";
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
