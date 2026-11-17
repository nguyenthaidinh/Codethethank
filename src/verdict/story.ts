import type { Focus, Beat } from "../cinematic/director";
import { evidence, type EvidenceId } from "./evidence";
import { evaluate, profiles } from "./rules";
import type { VerdictSave } from "./state";
import { freshStay } from "../stayed/state";
import { AN_SETBACK } from "../cinematic/AnSetback";
import { TEACHER_ENTRANCE } from "../cinematic/TeacherEntrance";
import {
  stayLines,
  notes,
  finalNote,
  stayChoice,
  stayLine,
} from "../stayed/story";
export function verdictCaption(
  s: VerdictSave,
  t: number,
  inspection: EvidenceId | null,
): string {
  if (s.flow === "screen-first" && s.phase === "review") return "";
  if (s.flow === "screen-first" && s.phase === "choose") return "";
  if (s.flow === "screen-first" && s.phase === "reaction")
    return t < AN_SETBACK.showAnAt
      ? `Hồ sơ ${profiles[s.selected ?? "an"].name} · NOT RECOMMENDED. Bản thử nghiệm chưa đề xuất ưu tiên giờ thực hành.`
      : t < AN_SETBACK.start
        ? s.selected === "an"
          ? "An: “Ngay cả khi nhập tên mình… câu trả lời cũng chẳng khác.”"
          : "An: “Đổi hồ sơ rồi… vẫn không được. Mình đang bỏ sót điều gì?”"
        : t < AN_SETBACK.quietAt
          ? "[An siết tay, đập xuống bàn một lần. Cậu khựng lại trước màn hình còn đỏ.]"
          : "[An cúi đầu, vai chùng xuống. Cậu im lặng, chỉ còn tiếng mưa.]";
  if (s.phase === "reaction")
    return t < 2
      ? ""
      : t < 5
        ? "An : « Ngay cả hệ thống của mình... cũng không chọn mình. »"
        : "Đây là đề xuất từ dữ liệu cũ, chưa phải quyết định cấp giờ thực hành.";
  if (s.phase === "teacher_enter")
    return t < 4
      ? "[Bước chân dừng lại. Cánh cửa khẽ mở.]"
      : t < TEACHER_ENTRANCE.greetAt
        ? "[Cô Vân nhìn thấy An, rồi bước vào căn phòng còn sáng đèn.]"
        : t < TEACHER_ENTRANCE.askAt
          ? "Cô Vân: “Cô thấy đèn còn sáng… Em vẫn chưa về sao?”"
          : "Cô Vân: “Có chỗ nào chưa làm được à? Cứ nói cô nghe.”";
  if (s.phase === "chapter02") {
    const st = s.stayed ?? freshStay;
    if (stayChoice(st)) return "";
    if (st.phase === "notebook")
      return st.page
        ? `${notes[st.page].title} ${notes[st.page].detail}`
        : "[Cô mở cuốn sổ của An. Hai câu hỏi nằm cạnh nhau.]";
    if (st.phase === "unwritten")
      return "An cầm bút. Bạn đang khôi phục một dòng trong ký ức, không thay đổi quá khứ.";
    if (st.phase === "next")
      return st.nextInspected ? "Người dùng cần được giúp điều gì?" : finalNote;
    return stayLine(st)?.text ?? "";
  }
  if (s.phase === "comparison" && s.carried)
    return evidence[s.carried].connection;
  if (s.phase === "connect" && s.carried && s.linked.includes(s.carried))
    return "Vật chứng này đã được đối chiếu. Chọn một vật chứng khác để mở thêm góc nhìn.";
  if (inspection) return evidence[inspection].text;
  if (s.phase === "running")
    return "[An nhấn phím. Mô hình đang ước tính mức cải thiện…]";
  if (s.phase === "result" && s.selected) {
    const p = profiles[s.selected],
      r = evaluate(s.selected);
    return `${p.name}: dự đoán +${r.predictedGain} điểm, ngưỡng ưu tiên +12. ${r.recommended ? "Được ưu tiên hỗ trợ." : "Không được ưu tiên hỗ trợ."} Nhu cầu hỗ trợ chưa được dùng trong quyết định.`;
  }
  if (s.phase === "connect")
    return s.carried
      ? evidence[s.carried].connection
      : "Đối chiếu vật chứng với kết quả trên laptop. Dự đoán đang bỏ sót điều gì?";
  if (s.phase === "choose")
    return "Dữ liệu giả lập. Thử STUDENT 07 trước, rồi đưa hồ sơ An vào cùng mô hình.";
  return "Ba dấu vết còn trên bàn: bản thuyết trình, sổ thiết kế và dữ liệu thử nghiệm.";
}
export function verdictHint(s: VerdictSave) {
  if (s.phase === "investigate")
    return s.found.length === 3
      ? "Đã có ba vật chứng. Mở mô hình thử nghiệm."
      : "Chạm ba đồ vật có dấu sáng. Mỗi vật cho biết một giới hạn của mô hình.";
  if (s.phase === "choose")
    return s.selected
      ? "Chạm phím Chạy đánh giá trên laptop."
      : s.tested.length
        ? "Hồ sơ An đã mở. Thử An với cùng quy tắc hoặc xem thêm hồ sơ mẫu."
        : "Chọn STUDENT 07 và chạy đánh giá. Sau đó hồ sơ An sẽ mở.";
  if (s.phase === "result")
    return "Đọc kết quả rồi chọn hồ sơ An để thử cùng quy tắc.";
  if (s.phase === "connect")
    return s.carried && s.linked.includes(s.carried)
      ? "Vật chứng này đã được nối. Chọn một vật chứng khác."
      : s.carried
        ? "Chạm laptop để đối chiếu vật chứng đang giữ."
        : "Chọn một vật chứng chưa kết nối rồi đối chiếu với kết quả trên laptop. Cần hai góc nhìn khác nhau.";
  return "";
}
export function roomBeat(s: VerdictSave): Beat {
  if (s.phase === "running") return "evaluate";
  if (s.phase === "reaction") return "verdict";
  if (s.phase === "teacher_enter") return "enter";
  if (s.phase === "chapter02") {
    const st = s.stayed ?? freshStay;
    return st.phase === "discussion"
      ? "enter"
      : st.phase === "chair"
        ? "chair"
        : "invitation";
  }
  return "explore";
}
export function directedFocus(s: VerdictSave, t: number): Focus | undefined {
  if (s.phase === "review") return "profile";
  if (s.flow === "screen-first" && s.phase === "reaction")
    return t < AN_SETBACK.showAnAt ? "laptop" : "an";
  if (s.phase === "running") return "laptop";
  if (s.phase === "reaction") return t < 1 ? "laptop" : "an";
  if (s.phase === "teacher_enter") return "door";
  if (s.phase === "chapter02") {
    const st = s.stayed ?? freshStay;
    return (
      stayLines[st.phase]?.[st.line]?.focus ??
      (st.phase === "next" ? "book" : "book")
    );
  }
}
