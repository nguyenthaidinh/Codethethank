import type { GuideContent } from "../cinematic/GameGuide";
import { freshStay } from "../stayed/state";
import { stayGuide } from "../stayed/stayGuide";
import type { ChapterSave } from "./director";

const aion =
  "Năm 2046, AION đang lần lại nguồn gốc nguyên tắc HUMAN REVIEW. Manh mối dẫn về một buổi thực hành ở Trường Đại học Tây Nguyên.";
const classroom =
  "An đang kiểm tra chương trình xếp ưu tiên giờ thực hành. Hồ sơ 07 chưa được đề xuất, dù bạn ấy cần thêm thời gian dùng máy.";
const research =
  "An đem bài học từ phòng thực hành vào những lần thiết kế và kiểm thử tiếp theo.";
const gratitude =
  "Hai mươi năm sau, ký ức về buổi chiều cô Vân ở lại gợi cho bạn một lời cảm ơn của riêng mình.";

export function chapterGuide(
  state: ChapterSave,
  view: "core" | "atrium",
  signals: number,
): GuideContent {
  const verdict = state.verdict;
  const finale = verdict?.finale;
  const ripple = verdict?.ripple;
  if (finale) {
    if (
      finale.phase === "letter" ||
      finale.phase === "review" ||
      finale.phase === "paper"
    )
      return {
        recap: gratitude,
        steps: [
          "Mở máy tính hoặc chạm vào tờ giấy. Viết người nhận và điều bạn muốn cảm ơn.",
          "Bấm «Xem trước» để xem lại lời nhắn. Bạn có thể đọc lại, chỉnh sửa hoặc xác nhận.",
          "Nếu muốn đi tiếp mà không viết, chọn «Giữ im lặng và tiếp tục» hoặc «Bỏ qua lời nhắn» nếu đang ở trình soạn.",
        ],
      };
    return {
      recap: gratitude,
      steps: [
        finale.phase === "galaxy"
          ? "Chạm ngôi sao để xem lại dấu ấn tri ân. Sau đó chọn nút đi tiếp."
          : finale.phase === "ending"
            ? "Ở màn kết, bạn có thể xem lại tri ân, chơi lại hoặc trở về menu."
            : "Quan sát các vật thể được gợi sáng và theo dõi cảnh. Game sẽ hiện nút tương tác khi đến bước tiếp theo.",
      ],
    };
  }
  if (ripple) {
    switch (ripple.phase) {
      case "sketch":
        return {
          recap: research,
          steps: [
            "Chạm vào cả hai câu hỏi trên trang phác thảo để đọc sự khác nhau.",
            "Khi cả hai đã được đọc, chọn nút nối chúng để tiếp tục.",
          ],
        };
      case "years":
        if (ripple.milestones === 1 && ripple.lab2035?.codePatch)
          return {
            recap: research,
            steps: [
              "Chạm vào dòng điều kiện để chọn lúc mô hình còn thiếu bối cảnh hoặc chưa đủ tin cậy.",
              "Chạm vào dòng xử lý và chọn chuyển hồ sơ cho người phụ trách xem xét.",
              "Bấm «Chạy kiểm thử». Nếu kiểm thử chưa đạt, xem kết quả và sửa lại hai dòng. Bạn cũng có thể chọn «Bỏ qua thử thách code».",
            ],
          };
        if (ripple.milestones === 1)
          return {
            recap: research,
            steps: [
              "Mở bàn thử nghiệm 2035 nếu chưa mở. Chọn «Dữ liệu học tập» và chạy lần đầu với nguồn này.",
              "Giữ nguồn «Dữ liệu học tập», thêm «Nhật ký dùng máy» rồi bấm «Chạy thử» lần nữa.",
              "Đối chiếu hai bản in, rồi chọn «Đánh dấu dữ liệu bị bỏ sót» ở nguồn nhật ký dùng máy. Khi thấy «Tiếp: sửa logic», chạm để sang bước kế tiếp.",
            ],
          };
        return {
          recap: research,
          steps: [
            "Chạm vào mốc năm được gợi trên màn hình. Trong mỗi cảnh, chọn vật chứng hoặc nút trên bàn để xem điều An đã học được.",
          ],
        };
      case "record":
      case "reconstruct":
        return {
          recap: research,
          steps: [
            ripple.phase === "record"
              ? "Chạm vào bản ghi được gợi sáng để mở phần đối chiếu năm 2046."
              : "Chạm vào hồ sơ đánh giá, chiếc ghế và cuốn sổ. Đọc từng ký ức rồi bấm «Khớp ba ký ức» để nối chúng.",
          ],
        };
      default:
        return {
          recap: research,
          steps: [
            "Theo dõi cảnh đang chạy. Khi điểm tương tác hoặc nút đi tiếp xuất hiện, nhấp hoặc chạm vào đó.",
          ],
        };
    }
  }
  if (verdict?.phase === "chapter02")
    return stayGuide(verdict.stayed ?? freshStay);
  if (state.beat === "NEXT_SCENE_READY") {
    if (
      verdict &&
      ["reaction", "comparison", "teacher_enter"].includes(verdict.phase)
    )
      return {
        recap: classroom,
        steps: [
          "Đọc kết quả và quan sát An. Nếu nút tiếp tục hiện ra thì bấm, hoặc chờ cô Vân tới bàn.",
        ],
      };
    if (verdict?.phase === "review" || verdict?.flow === "screen-first")
      return {
        recap: classroom,
        steps: [
          "Khi có nút «Thử một hồ sơ khác trên laptop», bấm để mở danh sách. Chọn hồ sơ An hoặc một hồ sơ khác ngoài hồ sơ 07.",
          "Chọn «Thử lại với hồ sơ…», rồi bấm «Chạy đánh giá». Đọc kết quả và tiếp tục theo nút hiện trên màn hình.",
        ],
      };
    return {
      recap: classroom,
      steps: [
        "Chạm vào từng điểm sáng quanh bàn để đọc vật chứng.",
        "Mở phần thử hồ sơ trên laptop. Chọn hồ sơ 07 và bấm «Chạy đánh giá». Khi hồ sơ An được mở, thử thêm lần nữa để so sánh.",
        "Nếu màn hình yêu cầu đối chiếu, làm theo nút nối vật chứng hiện trên bàn.",
      ],
    };
  }
  switch (state.beat) {
    case "OPENING_CINEMATIC":
      return {
        recap: aion,
        steps: [
          "Theo dõi phần mở đầu. Bạn có thể tăng tốc hoặc bấm «Bỏ qua cinematic» để tới khu vực tương tác.",
        ],
      };
    case "PLAYER_CONTROL_ENABLED":
      return {
        recap: aion,
        steps: [
          view === "atrium"
            ? "Bấm «Trở lại bàn đối chiếu»."
            : "Chạm điểm sáng «Ẩn số chưa có lời giải» ở bàn đối chiếu.",
        ],
      };
    case "SIGNAL_INVESTIGATION":
      return {
        recap: aion,
        steps: [
          signals < 2
            ? "Chạm vào cả hai điểm sáng của bàn đối chiếu, đọc nguyên tắc hiện tại và dấu vết nguồn gốc."
            : "Bạn đã xem cả hai mục trên bàn đối chiếu.",
          "Bấm «Chạm để mở hồ sơ 2026» khi nút hiện ra.",
        ],
      };
    default:
      return {
        recap: classroom,
        steps: [
          "Theo dõi cảnh phòng thực hành. Chạm điểm sáng hoặc nút tiếp tục khi xuất hiện để đến bàn máy tính.",
        ],
      };
  }
}
