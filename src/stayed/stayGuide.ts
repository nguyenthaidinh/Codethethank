import type { StaySave } from "./state";
import type { StayPhase } from "./story";

const opening = {
  recap:
    "Sau giờ thực hành, bản thử nghiệm của An vẫn không đề xuất hồ sơ nào cho giờ thực hành bổ sung. Cô Vân cùng An xem lại dữ liệu và câu hỏi mà chương trình cần trả lời.",
  goal: "Theo dõi cuộc trò chuyện. Khi hiện các lời đáp, chọn một câu để An nói tiếp.",
};
const investigation = {
  recap:
    "Ở hồ sơ 07, bảng dữ liệu ghi kết quả học, còn lá đơn cho biết bạn thiếu máy tính và cần thêm giờ thực hành. Hai nguồn cho thấy những phần khác nhau của cùng một câu chuyện.",
  goal: "Đối chiếu bảng dữ liệu với lá đơn. Chọn lời đáp cho An mỗi khi cô Vân hỏi.",
};
const notebook = {
  recap:
    "Điểm số chưa đủ để biết thêm giờ dùng máy sẽ giúp bạn 07 thế nào. An cần xác minh hoàn cảnh trước khi đưa ra kết luận.",
  goal: "Mở cả hai trang «Kết quả» và «Nhu cầu» trong sổ để tiếp tục.",
};
const revision = {
  recap:
    "Khi thiếu dữ kiện, An muốn chuyển hồ sơ sang bước xem xét lại. Người phụ trách sẽ xác minh hoàn cảnh rồi mới quyết định có hỗ trợ hay không.",
  goal: "Tiếp tục hội thoại. Khi dòng ghi chú hiện ra, chạm hoặc kéo trên giấy để khôi phục nó.",
};
const entries: Record<StayPhase, typeof opening> = {
  discussion: opening,
  chair: opening,
  question: investigation,
  notebook,
  second_chance: revision,
  unwritten: {
    ...revision,
    goal: "Chạm «Lần theo nét bút» hoặc kéo ngón tay trên dòng giấy để khôi phục ghi chú.",
  },
  written: { ...revision, goal: "Đọc nguyên tắc An vừa ghi lại." },
  closing: { ...revision, goal: "Đợi cảnh chuyển sang trang phác thảo." },
  next: {
    ...revision,
    goal: "Chọn «Quan sát trang phác thảo» để mở phần tiếp theo.",
  },
};

export function stayGuide(story: StaySave) {
  const { recap, goal } = entries[story.phase];
  const steps =
    story.phase === "notebook"
      ? [
          "Chạm «01 · Kết quả» và đọc điều máy đã dự đoán.",
          "Chạm «02 · Nhu cầu» và tìm dữ kiện còn thiếu. Đọc xong cả hai trang, game sẽ tự tiếp tục.",
        ]
      : [
          story.phase === "next" && story.nextInspected
            ? "Chọn «Nối hai câu hỏi» để chuyển sang phần tiếp theo."
            : goal,
        ];
  return { recap, steps };
}
