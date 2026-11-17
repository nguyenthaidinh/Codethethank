import type { RippleAction } from "./state";

/** Shared, quiet chapter information; the workspace remains the primary view. */
export function ResearchEraHUD({
  year,
  act,
}: {
  year: 2029 | 2035;
  act: (action: RippleAction) => void;
}) {
  const journal = year === 2029;
  return (
    <>
      <div className="research-era research-era-modern">
        <span className="research-chapter-id">
          03 <i /> THE RIPPLE
        </span>
        <div className="research-era-title">
          <strong>{year}</strong>
          <span>
            {journal ? "NHẬT KÝ THỬ NGHIỆM" : "NGHIÊN CỨU CỘNG TÁC"}
            <small>
              {journal
                ? "An · tiếp tục tìm hiểu"
                : "An · cùng đội ngũ nghiên cứu"}
            </small>
          </span>
        </div>
        <div className="research-era-track" aria-label={`Mốc năm ${year}`}>
          <span className={journal ? "active" : "visited"}>2029</span>
          <i />
          <span className={journal ? "" : "active"}>2035</span>
          <i />
          <span>2045</span>
        </div>
      </div>
      <button
        className="research-journal-trigger research-action-modern"
        aria-label={
          journal ? "Mở nhật ký thử nghiệm" : "Bắt đầu thử nghiệm"
        }
        onClick={() => act({ type: "object" })}
      >
        <span className="research-action-icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d={
                journal
                  ? "M4 5h7l1 2 1-2h7v14h-7l-1 1-1-1H4V5Zm8 2v13"
                  : "M3 4h18v13H3V4Zm5 17h8m-4-4v4M6 8h4m-4 3h8"
              }
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span>
          {journal ? "Mở nhật ký thử nghiệm" : "Bắt đầu thử nghiệm"}
          <small>
            {journal
              ? "Khám phá điều An đã thay đổi"
              : "Cùng một hồ sơ · hai nguồn thông tin"}
          </small>
        </span>
        <span className="research-action-arrow" aria-hidden="true">
          ↗
        </span>
      </button>
    </>
  );
}
