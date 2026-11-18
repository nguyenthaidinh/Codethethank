import type { RippleSave, MemoryId } from "./state";
import { complete2035, compared2035 } from "./experiment2035";
import { aionCue } from "../speech/aion2046";
export const milestones = [
  {
    year: 2029,
    label: "Mở nhật ký thử nghiệm",
    object: "THỬ NGHIỆM / 2029",
    text: "2029. Thử nghiệm lại thất bại. An bổ sung bước xác minh hoàn cảnh; yêu cầu xem xét chưa phải quyết định cấp hỗ trợ.",
    lines: [
      "THỬ NGHIỆM / 2029 · CHƯA ĐẠT",
      "Thiếu hoàn cảnh → REVIEW REQUIRED.",
      "Xác minh trước khi quyết định hỗ trợ.",
    ],
  },
  {
    year: 2035,
    label: "Bắt đầu thử nghiệm",
    object: "BẢN THIẾT KẾ NHÓM",
    text: "2035. An cùng đồng đội nghiên cứu nhiều lĩnh vực. Qua thử nghiệm và phản biện, họ làm rõ khi nào cần con người xem xét.",
    lines: [
      "NGHIÊN CỨU CỘNG TÁC",
      "Mô phỏng · ngôn ngữ · khoa học",
      "HUMAN REVIEW / kiểm chứng cùng đồng đội",
    ],
  },
  {
    year: 2045,
    label: "Mở sổ kiểm thử trước ra mắt",
    object: "AION · KIỂM THỬ",
    text: "2045. Nhóm kiểm thử AION trước khi ra mắt. HUMAN REVIEW giữ khả năng xem xét lại những quyết định ảnh hưởng đến cơ hội con người.",
    lines: [
      "AION · TRƯỚC NGÀY RA MẮT",
      "Kiểm thử đa lĩnh vực",
      "HUMAN REVIEW / quyền xem xét lại",
    ],
  },
] as const;
export const memories: Record<MemoryId, { label: string; text: string }> = {
  evaluation: {
    label: "Chạm hồ sơ đánh giá 2026",
    text: "2026: NOT RECOMMENDED. Kết quả lịch sử của An vẫn giữ nguyên. Thiết kế mới mở đường xem xét, không đổi nó thành được chấp nhận.",
  },
  stayed: {
    label: "Chạm chiếc ghế được giữ lại",
    text: "Cô Vân không hứa thành công. Cô ở lại, lắng nghe và cho An cơ hội tiếp tục. Đó là bài học không được viết thành lời.",
  },
  design: {
    label: "Chạm cuốn sổ thiết kế",
    text: "Nguyên tắc được viết vào sổ: khi chưa hiểu đủ một con người, đừng xem dự đoán là câu trả lời cuối cùng. HUMAN REVIEW cần con người xác minh.",
  },
};
export function rippleCaption(s: RippleSave, t: number): string {
  const cue = aionCue(s.phase, t);
  if (cue) return `AION: ${cue.text}`;
  switch (s.phase) {
    case "sketch":
      return s.questions.length === 2
        ? "An nhận ra: dự đoán chưa đủ để quyết định ai cần được giúp. Cần có bước con người xem xét."
        : "Trong cuốn sổ có hai câu hỏi. Chạm cả hai dòng để hiểu An đã thay đổi cách nghĩ như thế nào.";
    case "change":
      return t < 3
        ? "Thiếu thông tin hoặc chưa đủ tin cậy → cần con người xem xét thêm."
        : "HUMAN REVIEW: xác minh trước khi quyết định. Không tự động duyệt hỗ trợ.";
    case "years":
      if (s.milestones === 2) return ""; // The 2045 dossier carries its own context.
      if (s.milestones === 1 && s.lab2035) {
        if (s.lab2035.codePatch)
          return s.lab2035.codePatch.status === "passed"
            ? "An: “Khi chưa hiểu đủ, chương trình cần mở đường để con người xác minh.”"
            : "Đồng đội: “Vậy mình sẽ đổi điều gì trong quy tắc xử lý? Chọn một nhánh rồi kiểm thử nhé.”";
        if (complete2035(s.lab2035))
          return "An: “Điều kiện thực hành bị bỏ sót. Mình cần xác minh thêm trước khi quyết định.”";
        if (compared2035(s.lab2035))
          return "Hai bản in, cùng một hồ sơ. Nguồn nào cho thấy điều mô hình chưa nhìn thấy?";
        if (s.lab2035.trials.length)
          return "Đồng đội: “Giữ nguyên hồ sơ. Thay nguồn thông tin, rồi thử lại.”";
        return "Đồng đội: “Đừng chỉ nhìn điểm số. Thử xem điều kiện học tập có làm thay đổi cách xử lý không.”";
      }
      return [
        "2029. An tiếp tục thử nghiệm. Cuốn sổ năm ấy vẫn ở trên bàn.",
        "2035. Những thử nghiệm giờ có thêm đồng đội cùng phản biện và kiểm chứng.",
        "2045. Trước ngày AION ra mắt, nhóm nghiên cứu kiểm thử lại từng nguyên tắc.",
      ][s.milestones];
    case "milestone":
      if (s.milestones === 2) return "";
      if (s.milestones === 1 && s.lab2035 && complete2035(s.lab2035))
        return "2035. An cùng đồng đội ghi lại: cần xác minh hoàn cảnh trước khi quyết định hỗ trợ. REVIEW REQUIRED chưa có nghĩa là được chấp nhận.";
      return milestones[s.milestones].text;
    case "world":
    case "record":
    case "align":
      return "";
    case "reveal":
      return t < 5 ? "AN — FOUNDER OF AION" : "";
    case "approach":
      return t < 3.2
        ? "Nhà nghiên cứu: “Hồ sơ này vẫn đang chờ HUMAN REVIEW.”"
        : t < 5.8
          ? "Nhà nghiên cứu: “Còn thiếu thông tin... em có nên dừng lại không?”"
          : "[An nhìn hồ sơ, rồi nhìn chiếc ghế trống.]";
    case "echo":
      return "";
    case "chair":
      return t < 3.6
        ? "[An kéo ghế lại gần. Anh ngồi xuống.]"
        : "An: “Cho anh xem hồ sơ nhé.”";
    case "reflection":
      return "An: “Mình cùng đọc lại phép thử nhé. Kết quả cho biết điều gì, và điều gì mình vẫn chưa kiểm chứng?”";
    case "reconstruct":
      return s.selected
        ? memories[s.selected].text
        : "Hồ sơ, chiếc ghế, cuốn sổ. Đối chiếu bài học năm ấy với cách An chọn ở lại hôm nay.";
    case "principle":
      return t < 3
        ? "AION: Tôi đã tìm thấy nguồn gốc của nguyên tắc ấy."
        : t < 5.5
          ? "AION: Nó không bắt đầu bằng một dòng mã."
          : "AION: Nó bắt đầu từ một người cô kiên nhẫn dạy học trò cách tự kiểm tra điều mình tin.";
    case "finale":
      return "[Ký ức đã khớp. Một tờ giấy trắng được đặt lại bên cuốn sổ. Lời cảm ơn vẫn chưa viết.]";
  }
}
