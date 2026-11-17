import type { Focus } from "../cinematic/director";
import type { StaySave } from "./state";
export type StayPhase =
  | "discussion"
  | "chair"
  | "question"
  | "notebook"
  | "second_chance"
  | "unwritten"
  | "written"
  | "closing"
  | "next";
export interface StayLine {
  text: string;
  seconds: number;
  focus: Focus;
  reflection?: boolean;
}
export const stayLines: Partial<Record<StayPhase, StayLine[]>> = {
  discussion: [
    {
      text: "An: “Em làm bản thử nghiệm chọn hồ sơ ưu tiên cho giờ thực hành bổ sung. Nhưng đổi hồ sơ, máy vẫn không đề xuất ai, cô ạ.”",
      seconds: 9,
      focus: "an",
    },
    {
      text: "Cô Vân: “Mình kiểm tra từng bước nhé. Em đưa dữ kiện nào vào, và muốn kết quả trả lời câu hỏi gì?”",
      seconds: 9,
      focus: "teacher",
    },
    {
      text: "An: “Em dùng mức tiến bộ với số buổi học để xếp ưu tiên giờ thực hành. Nhưng hồ sơ xin thêm giờ dùng máy vẫn không được đề xuất, cô ạ.”",
      seconds: 10,
      focus: "an",
    },
  ],
  chair: [
    {
      text: "[Cô kéo chiếc ghế trống lại gần. Một khoảng lặng, rồi cô ngồi xuống.]",
      seconds: 6,
      focus: "chair_insert",
    },
  ],
  question: [
    {
      text: "Cô Vân: “Đặt đề nghị của bạn 07 cạnh bảng dữ liệu nhé. Em đọc xem hai bên cho mình biết điều gì.”",
      seconds: 4.5,
      focus: "book",
    },
    {
      text: "Cô Vân: “Dữ liệu ghi bạn làm bài chưa đều. Còn lá đơn nói bạn thiếu máy tính và xin thêm giờ thực hành. Dữ liệu của em có ghi lý do ấy không?”",
      seconds: 5,
      focus: "faces",
    },
    {
      text: "An: “Chưa có, cô ạ. Em chỉ dùng mức tiến bộ và số buổi học. Em đã bỏ sót điều kiện để bạn làm bài.”",
      seconds: 5,
      focus: "an",
    },
    {
      text: "Cô Vân: “Vậy mình phân biệt nhé: điều dữ liệu cho biết, và điều mình đang tự suy ra.”",
      seconds: 4.5,
      focus: "faces",
    },
    {
      text: "Cô Vân: “Làm bài chưa đều có đủ để kết luận rằng thêm giờ dùng máy sẽ không giúp bạn không?”",
      seconds: 5,
      focus: "faces",
    },
    {
      text: "An: “Không ạ. Công thức chỉ dự đoán từ kết quả cũ. Nó chưa biết bạn sẽ học thế nào khi có đủ thiết bị.”",
      seconds: 7,
      focus: "laptop",
    },
    {
      text: "An: “Em hiểu rồi. Phép tính không sai, nhưng em đã dùng nó để trả lời một câu hỏi mà dữ liệu chưa đủ.”",
      seconds: 8,
      focus: "an",
    },
    {
      text: "[An đối chiếu lá đơn với bảng dữ liệu. Cô chờ cậu tự đọc lại. Tiếng mưa ngoài cửa.]",
      seconds: 3,
      focus: "faces",
    },
    {
      text: "Cô Vân: “Nếu sửa bài này, em sẽ kiểm tra điều gì trước?”",
      seconds: 4,
      focus: "faces",
    },
    {
      text: "An: “Em cần bổ sung hoàn cảnh trước, hay hạ ngưỡng để máy chọn bạn?”",
      seconds: 3,
      focus: "an",
    },
    {
      text: "Cô Vân: “Hạ ngưỡng có thể đổi kết quả. Nhưng nếu vẫn chỉ nhìn vào điểm cũ, mình đã hiểu thêm điều gì về bạn ấy chưa?”",
      seconds: 10,
      focus: "faces",
    },
    {
      text: "[An ngừng tay trên bàn phím, nhìn lại lá đơn. Cậu im lặng một lúc. Cô Vân vẫn chờ.]",
      seconds: 5,
      focus: "an",
      reflection: true,
    },
    {
      text: "An: “Bạn ấy có thể làm trọn bài thực hành mà trước đây phải bỏ dở. Nhưng em cần hỏi lại bạn, cô ạ.”",
      seconds: 5,
      focus: "an",
    },
    {
      text: "Cô Vân: “Đó là điều mình cần hỏi và kiểm tra. Điểm số kể một phần chuyện đã xảy ra; nó chưa kể hết điều có thể thay đổi khi bạn được giúp.”",
      seconds: 10,
      focus: "faces",
    },
    {
      text: "An: “Vậy ‘em chưa biết bạn sẽ tiến bộ thế nào’ khác với ‘bạn không cần được giúp’.”",
      seconds: 5,
      focus: "an",
    },
    {
      text: "Cô Vân: “AI có thể giúp em nhìn ra những mẫu trong dữ liệu. Nhưng nó không thể quyết định tất cả thay mình.”",
      seconds: 10,
      focus: "teacher",
    },
    {
      text: "An: “Em sẽ ghi điều còn thiếu, xin xác minh hoàn cảnh, rồi thử lại. Em muốn biết cách giúp bạn học, chứ không chỉ làm màn hình đổi chữ.”",
      seconds: 10,
      focus: "an",
    },
    {
      text: "Cô Vân: “Kết quả phụ thuộc vào dữ liệu em đưa vào. Nếu thiếu hoàn cảnh, mình phải xem xét thêm, hỏi người trong cuộc, rồi mới quyết định.”",
      seconds: 10,
      focus: "teacher",
    },
    {
      text: "An: “Vậy AI giúp em nhìn dữ liệu. Còn hiểu hoàn cảnh và cân nhắc quyết định, em không thể giao hết cho máy.”",
      seconds: 10,
      focus: "an",
    },
    {
      text: "Cô Vân: “Vậy mình ghi lại nguyên tắc ấy nhé. Để lần sau gặp một kết quả, em biết nên hỏi gì trước.”",
      seconds: 5,
      focus: "book",
    },
  ],
  second_chance: [
    {
      text: "An: “Em sẽ thêm bước xác minh điều kiện học tập. Nếu dữ liệu còn thiếu, máy phải ghi cần xem xét, không tự chốt không hỗ trợ.”",
      seconds: 4.5,
      focus: "an",
    },
    {
      text: "Cô Vân: “Rồi thử lại với những hồ sơ đã xác minh. Mình xem cách sửa có giải quyết đúng vấn đề không, chứ không chỉ làm kết quả đẹp hơn.”",
      seconds: 5,
      focus: "faces",
    },
    {
      text: "An: “Cảm ơn cô. Cô không sửa bài thay em, nhưng giờ em biết phải bắt đầu kiểm tra từ đâu.”",
      seconds: 4,
      focus: "book",
    },
  ],
  written: [
    {
      text: "Khi chưa hiểu đủ một con người, đừng vội xem một dự đoán là câu trả lời cuối cùng.",
      seconds: 6,
      focus: "book",
    },
  ],
  closing: [
    {
      text: "[Mưa dịu dần. Nguyên tắc nằm trên trang giấy. Cô vẫn ngồi bên An.]",
      seconds: 6,
      focus: "window",
    },
  ],
};

export const replyMoments = {
  "discussion.0": {
    prompt: "Cô Vân dừng bên bàn, chờ An trả lời.",
    options: [
      {
        id: "results",
        label: "Em thử lại rồi, kết quả vẫn vậy.",
        text: "An: “Em đổi hồ sơ rồi, cô ạ. Máy vẫn không đề xuất ưu tiên. Em chưa hiểu vì sao.”",
        response:
          "Cô Vân: “Mình kiểm tra từng bước nhé. Em đưa dữ kiện nào vào, và muốn kết quả trả lời câu hỏi gì?”",
      },
      {
        id: "doubt",
        label: "Em không biết mình đang sai ở đâu.",
        text: "An: “Em thử đi thử lại rồi… mà vẫn không được. Em không biết mình sai ở đâu nữa, cô ạ.”",
        response:
          "Cô Vân: “Em vẫn còn thất vọng à? Cứ kể cô nghe đã. Rồi cô với em cùng xem lại nhé.”",
      },
    ],
  },
  "question.2": {
    prompt:
      "Cô Vân: “Bảng dữ liệu ghi kết quả học. Lá đơn ghi bạn thiếu máy tính. Em thấy mình còn thiếu điều gì?”",
    options: [
      {
        id: "context",
        label: "Dữ liệu chưa kể hết hoàn cảnh của bạn ấy.",
        text: "An: “Em chỉ đưa điểm số với số buổi học vào dữ liệu. Chuyện bạn ấy thiếu máy tính… em đã bỏ sót.”",
        response:
          "Cô Vân: “Đúng. Em đã tìm được một dữ kiện còn thiếu. Giờ xem kết luận nào vẫn chưa có đủ căn cứ nhé.”",
      },
      {
        id: "limited",
        label: "Nhưng suất hỗ trợ của mình có hạn…",
        text: "An: “Em hiểu bạn ấy đang khó khăn. Nhưng suất hỗ trợ có hạn, rồi mình vẫn phải chọn, cô ạ.”",
        response:
          "Cô Vân: “Đúng, số giờ có hạn. Nhưng trước khi xếp ưu tiên, mình vẫn phải kiểm tra dữ liệu có đủ để so sánh chưa.”",
      },
    ],
  },
  "question.9": {
    prompt: "Cô Vân: “Nếu sửa bài này, em sẽ kiểm tra điều gì trước?”",
    options: [
      {
        id: "belief",
        label: "Em sẽ tìm dữ kiện còn thiếu trước.",
        text: "An: “Em sẽ tìm dữ kiện còn thiếu trước.”",
        response:
          "Cô Vân: “Ừ, mình bắt đầu từ điều còn thiếu. Thử hình dung nhé: nếu bạn có thêm giờ dùng máy, điều gì trong việc học của bạn có thể thay đổi?”",
      },
      {
        id: "failure",
        label: "Hay em hạ ngưỡng để máy chọn bạn?",
        text: "An: “Hay em chỉ cần hạ ngưỡng để máy chọn bạn, cô?”",
        response:
          "Cô Vân: “Hạ ngưỡng có thể đổi kết quả. Nhưng nếu vẫn chỉ nhìn vào điểm cũ, mình đã hiểu thêm điều gì về bạn ấy chưa?”",
      },
    ],
  },
} as const;
export type ReplyMoment = keyof typeof replyMoments;
export type ReplyId =
  (typeof replyMoments)[ReplyMoment]["options"][number]["id"];

export function stayChoice(s: StaySave) {
  if (!s.interactive) return null;
  const key = `${s.phase}.${s.line}` as ReplyMoment;
  return key in replyMoments && !s.responses?.[key]
    ? { key, ...replyMoments[key] }
    : null;
}

export function stayLine(s: StaySave): StayLine | undefined {
  const line = stayLines[s.phase]?.[s.line];
  if (!line) return;
  for (const [key, id] of Object.entries(s.responses ?? {})) {
    const moment = replyMoments[key as ReplyMoment];
    const option = moment?.options.find((option) => option.id === id);
    if (!option) continue;
    if (`${s.phase}.${s.line}` === key) return { ...line, text: option.text };
    const [phase, at] = key.split(".");
    if (s.phase === phase && s.line === Number(at) + 1)
      return { ...line, text: option.response };
  }
  return line;
}

/** Short dialogue gets five seconds; lines of 25+ Vietnamese syllables get ten. */
export function stayAutoDelay(s: StaySave): number | null {
  if (stayChoice(s)) return null;
  const line = stayLine(s);
  if (!line) return null;
  if (line.reflection) return line.seconds;
  if (!["discussion", "question", "second_chance"].includes(s.phase))
    return line.seconds;
  const syllables = line.text
    .replace(/^[^:]+:\s*/, "")
    .trim()
    .split(/\s+/).length;
  return syllables >= 25 ? 10 : 5;
}
export const notes = {
  outcome: {
    label: "Xem ghi chú về kết quả",
    title: "LOW PREDICTED BENEFIT → NOT RECOMMENDED.",
    detail:
      "Đã biết: kết quả và mức đều đặn. Chưa biết: điều kiện thực hành. Không thể suy ra rằng bạn không cần thêm giờ máy.",
  },
  support: {
    label: "Xem ghi chú về nhu cầu",
    title: "MISSING CONTEXT / LOW CONFIDENCE → REVIEW REQUIRED.",
    detail:
      "Bước sửa: xác minh điều kiện học → người phụ trách xem xét → thử lại trên hồ sơ đã đủ thông tin. không tự động cấp giờ máy.",
  },
} as const;
export type NoteId = keyof typeof notes;
export const designQuestion = "Làm sao để không bỏ lại người đang cần cơ hội?";
export const finalNote =
  "Khi chưa hiểu đủ một con người, đừng vội xem một dự đoán là câu trả lời cuối cùng.";
