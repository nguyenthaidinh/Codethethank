export type ProfileId = "student07" | "mai" | "minh" | "an";
export const profiles = {
  student07: {
    name: "STUDENT 07",
    priorGain: 2,
    regularity: 30,
    need: "Xin thêm thời gian sử dụng phòng máy",
    context: "Thiếu thiết bị học tập; hoàn cảnh chưa có trong dữ liệu",
    story:
      "Không có máy tính riêng, bạn vẫn cố hoàn thành bài tập và xin thêm giờ ở phòng máy. Bản thử nghiệm chưa đề xuất ưu tiên hồ sơ này; đây chưa phải quyết định cấp giờ máy.",
  },
  mai: {
    name: "MAI",
    priorGain: 6,
    regularity: 50,
    need: "Cần người hướng dẫn",
    context: "Vừa chuyển ngành; còn chật vật theo kịp những môn nền tảng",
    story:
      "Mai vừa chuyển ngành. Những môn nền tảng khiến bạn hụt hơi; bạn mong có người cùng gỡ lại từng chỗ chưa hiểu.",
  },
  minh: {
    name: "MINH",
    priorGain: 4,
    regularity: 40,
    need: "Cần thêm thời gian và thiết bị",
    context: "Chưa ghi nhận lịch làm thêm",
    story:
      "Minh đi làm thêm sau giờ học. Lịch học chắp vá, chiếc máy tính dùng chung thường chỉ còn trống vào lúc muộn.",
  },
  an: {
    name: "AN",
    priorGain: 3,
    regularity: 35,
    need: "Cần phản hồi và cơ hội thử lại",
    context: "Chưa ghi nhận nỗ lực sau buổi trình bày",
    story:
      "Buổi trình bày vừa rồi không suôn sẻ. An vẫn ở lại sửa từng lỗi, mong có một lời góp ý và một cơ hội làm lại.",
  },
} as const;
/** Deliberately limited fictional model, not a real educational assessment. */
export function evaluate(id: ProfileId) {
  const p = profiles[id];
  const predictedGain = Math.round(p.priorGain * 0.65 + p.regularity * 0.1);
  return {
    profile: id,
    predictedGain,
    threshold: 12,
    recommended: predictedGain >= 12,
    label: predictedGain >= 12 ? "RECOMMENDED" : "NOT RECOMMENDED",
  };
}
