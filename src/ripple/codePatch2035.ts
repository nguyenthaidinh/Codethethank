export type Condition2035 = "low-benefit" | "uncertain" | "always";
export type Decision2035 = "reject" | "approve" | "review";
export type PatchOutcome2035 =
  | "NOT_RECOMMENDED"
  | "APPROVE_SUPPORT"
  | "REVIEW_REQUIRED"
  | "NEXT_SUPPORT_STEP";
export interface CodePatch2035 {
  version: 1;
  condition: Condition2035;
  decision: Decision2035;
  status: "editing" | "testing" | "passed" | "skipped";
  elapsed: number;
  attempts: number;
  checked: { condition: Condition2035; decision: Decision2035 } | null;
}
export const PATCH2035_SECONDS = 1.8;
export const conditions2035 = {
  "low-benefit": {
    code: "prediction.lowBenefit",
    label: "Khi dự đoán mức cải thiện thấp",
    detail: "Chỉ nhìn kết quả dự đoán.",
  },
  uncertain: {
    code: "profile.missingContext || prediction.confidence < 0.7",
    label: "Khi thiếu bối cảnh hoặc chưa đủ tin cậy",
    detail: "Kiểm tra điều mô hình chưa biết chắc.",
  },
  always: {
    code: "true",
    label: "Áp dụng với mọi hồ sơ",
    detail: "Mọi trường hợp đều đi vào nhánh này.",
  },
} as const;
export const decisions2035 = {
  reject: {
    code: "NOT_RECOMMENDED",
    label: "Không ưu tiên hỗ trợ",
    detail: "Kết luận ngay ở bước này.",
  },
  approve: {
    code: "APPROVE_SUPPORT",
    label: "Tự động chấp nhận hỗ trợ",
    detail: "Duyệt mà không cần xác minh thêm.",
  },
  review: {
    code: "REVIEW_REQUIRED",
    label: "Chuyển người phụ trách xem xét",
    detail: "Xác minh thêm trước khi quyết định.",
  },
} as const;
export const outcomes2035: Record<PatchOutcome2035, string> = {
  NOT_RECOMMENDED: "Không ưu tiên hỗ trợ",
  APPROVE_SUPPORT: "Tự động chấp nhận",
  REVIEW_REQUIRED: "Cần người xem xét",
  NEXT_SUPPORT_STEP: "Tiếp tục đề xuất bước hỗ trợ",
};
export const patchCases2035 = [
  {
    id: "context",
    label: "Hồ sơ thiếu bối cảnh",
    missingContext: true,
    confidence: 0.9,
    lowBenefit: false,
    expected: "REVIEW_REQUIRED",
  },
  {
    id: "confidence",
    label: "Dự đoán chưa đủ tin cậy",
    missingContext: false,
    confidence: 0.45,
    lowBenefit: false,
    expected: "REVIEW_REQUIRED",
  },
  {
    id: "low",
    label: "Dự đoán thấp, thông tin đã đủ",
    missingContext: false,
    confidence: 0.92,
    lowBenefit: true,
    expected: "NEXT_SUPPORT_STEP",
  },
  {
    id: "ready",
    label: "Thông tin đầy đủ, dự đoán tin cậy",
    missingContext: false,
    confidence: 0.95,
    lowBenefit: false,
    expected: "NEXT_SUPPORT_STEP",
  },
] as const;
export function evaluatePatch2035(
  condition: Condition2035,
  decision: Decision2035,
) {
  return patchCases2035.map((test) => {
    const matches =
      condition === "always" ||
      (condition === "low-benefit"
        ? test.lowBenefit
        : test.missingContext || test.confidence < 0.7);
    const actual: PatchOutcome2035 = matches
      ? decisions2035[decision].code
      : "NEXT_SUPPORT_STEP";
    return { ...test, actual, passed: actual === test.expected };
  });
}
export const freshCodePatch2035 = (): CodePatch2035 => ({
  version: 1,
  condition: "low-benefit",
  decision: "reject",
  status: "editing",
  elapsed: 0,
  attempts: 0,
  checked: null,
});
export const resolvedCodePatch2035 = (s: CodePatch2035) =>
  s.status === "passed" || s.status === "skipped";
export type CodePatch2035Action =
  | { type: "condition"; value: Condition2035 }
  | { type: "decision"; value: Decision2035 }
  | { type: "test" }
  | { type: "tick"; elapsed: number }
  | { type: "skip" };
export function codePatch2035Reducer(
  s: CodePatch2035,
  a: CodePatch2035Action,
): CodePatch2035 {
  if (resolvedCodePatch2035(s)) return s;
  if (a.type === "skip") return { ...s, status: "skipped", elapsed: 0 };
  if (a.type === "tick") {
    if (s.status !== "testing" || !Number.isFinite(a.elapsed)) return s;
    const elapsed = Math.max(s.elapsed, Math.min(PATCH2035_SECONDS, a.elapsed));
    if (elapsed >= PATCH2035_SECONDS) {
      const checked = { condition: s.condition, decision: s.decision };
      return {
        ...s,
        checked,
        elapsed: 0,
        status: evaluatePatch2035(s.condition, s.decision).every(
          (t) => t.passed,
        )
          ? "passed"
          : "editing",
      };
    }
    return elapsed === s.elapsed ? s : { ...s, elapsed };
  }
  if (s.status === "testing") return s;
  if (a.type === "condition")
    return s.condition === a.value
      ? s
      : { ...s, condition: a.value, checked: null };
  if (a.type === "decision")
    return s.decision === a.value
      ? s
      : { ...s, decision: a.value, checked: null };
  if (a.type === "test")
    return {
      ...s,
      status: "testing",
      elapsed: 0,
      attempts: Math.min(999, s.attempts + 1),
      checked: null,
    };
  return s;
}
export function readCodePatch2035(value: unknown): CodePatch2035 | undefined {
  if (!value || typeof value !== "object") return;
  const s = value as CodePatch2035;
  const condition = (v: unknown): v is Condition2035 =>
    typeof v === "string" && Object.hasOwn(conditions2035, v);
  const decision = (v: unknown): v is Decision2035 =>
    typeof v === "string" && Object.hasOwn(decisions2035, v);
  if (
    s.version !== 1 ||
    !condition(s.condition) ||
    !decision(s.decision) ||
    !["editing", "testing", "passed", "skipped"].includes(s.status) ||
    !Number.isInteger(s.attempts) ||
    s.attempts < 0 ||
    s.attempts > 999 ||
    !Number.isFinite(s.elapsed) ||
    s.elapsed < 0 ||
    s.elapsed >= PATCH2035_SECONDS
  )
    return;
  if (s.status !== "testing" && s.elapsed !== 0) return;
  if (
    s.checked !== null &&
    (!s.checked ||
      typeof s.checked !== "object" ||
      !condition(s.checked.condition) ||
      !decision(s.checked.decision) ||
      s.attempts === 0)
  )
    return;
  if (s.status === "testing" && (s.attempts === 0 || s.checked !== null))
    return;
  if (
    s.status === "passed" &&
    (!s.checked ||
      s.checked.condition !== s.condition ||
      s.checked.decision !== s.decision ||
      !evaluatePatch2035(s.condition, s.decision).every((t) => t.passed))
  )
    return;
  if (
    s.status === "editing" &&
    s.checked &&
    (s.checked.condition !== s.condition ||
      s.checked.decision !== s.decision ||
      evaluatePatch2035(s.condition, s.decision).every((t) => t.passed))
  )
    return;
  return { ...s, checked: s.checked ? { ...s.checked } : null };
}
