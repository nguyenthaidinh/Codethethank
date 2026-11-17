import { evidence, evidenceIds, type EvidenceId } from "./evidence";
import { profiles, type ProfileId } from "./rules";
import { profileUnlocked, type VerdictSave, type VerdictAction } from "./state";
import "./verdict.css";
export function VerdictControls({
  state: s,
  inspect,
  act,
  anchor,
  onHint,
  hint,
}: {
  state: VerdictSave;
  inspect: (id: EvidenceId) => void;
  act: (a: VerdictAction) => void;
  anchor: (id: string, el: HTMLButtonElement | null) => void;
  onHint: () => void;
  hint: string;
}) {
  const environmental = s.phase === "investigate" || s.phase === "connect";
  return (
    <>
      {s.phase === "review" && (
        <section className="dossier-reader" aria-label="Hồ sơ trên bàn">
          <small>BÀI TẬP · XẾP ƯU TIÊN GIỜ THỰC HÀNH</small>
          <h2>Hồ sơ trên bàn</h2>
          <div className="dossier-tabs" aria-label="Chọn hồ sơ để đọc">
            {(Object.keys(profiles) as ProfileId[]).map((id) => (
              <button
                key={id}
                aria-label={`Xem hồ sơ ${profiles[id].name}`}
                aria-pressed={s.preview === id}
                onClick={() => act({ type: "review-profile", id })}
              >
                {profiles[id].name}
                {id === "student07" && <span>Chưa được đề xuất</span>}
              </button>
            ))}
          </div>
          <div className="dossier-story" aria-live="polite">
            {s.preview ? (
              <>
                <h3>{profiles[s.preview].name}</h3>
                <p>{profiles[s.preview].story}</p>
                <p className="dossier-need">
                  Cần: {profiles[s.preview].need.toLowerCase()}.
                </p>
              </>
            ) : (
              <p>
                Phía sau mỗi cái tên là một chuyện chưa được kể hết. Chọn một hồ
                sơ để đọc, rồi thử lại trên laptop.
              </p>
            )}
          </div>
          {s.preview && s.preview !== "student07" && (
            <button
              className="dossier-try"
              onClick={() => act({ type: "prepare" })}
            >
              Thử lại với hồ sơ {profiles[s.preview].name} →
            </button>
          )}
        </section>
      )}
      {environmental &&
        evidenceIds.map((id) => (
          <button
            key={id}
            ref={(el) => anchor(evidence[id].focus, el)}
            className={`world-hotspot evidence-target ${s.found.includes(id) ? "observed" : ""}`}
            aria-label={evidence[id].label}
            onClick={() => inspect(id)}
          >
            <span className="hotspot-ring">
              {s.linked.includes(id) ? "↔" : s.found.includes(id) ? "✓" : "·"}
            </span>
            <span className="hotspot-name">{evidence[id].label}</span>
          </button>
        ))}
      {s.phase === "investigate" && s.found.length < 3 && !hint && (
        <p className="investigation-objective" role="status">
          <span>Trên bàn · {s.found.length}/3 dấu vết</span>
          Đọc bản thuyết trình, sổ thiết kế và dữ liệu thử nghiệm.
        </p>
      )}
      {s.phase === "investigate" && s.found.length === 3 && (
        <button
          className="chapter-action"
          onClick={() => act({ type: "prepare" })}
        >
          Mở mô hình thử nghiệm
        </button>
      )}
      {s.phase === "choose" && s.flow === "screen-first" && s.selected && (
        <div
          className="laptop-input retry-input"
          aria-label="Thử lại trên laptop"
        >
          <p className="retry-label">Thử lại · {profiles[s.selected].name}</p>
          <p className="retry-rule">
            Đổi hồ sơ, giữ nguyên quy tắc: dự đoán cải thiện dưới 12 điểm sẽ
            không được đề xuất hỗ trợ.
          </p>
          <button className="run-key" onClick={() => act({ type: "run" })}>
            ↵ Chạy đánh giá
          </button>
          <button
            className="retry-back"
            onClick={() => act({ type: "back-to-profiles" })}
          >
            Xem lại các hồ sơ
          </button>
        </div>
      )}
      {s.phase === "choose" && s.flow !== "screen-first" && (
        <div className="laptop-input" aria-label="Điều khiển trên laptop">
          {s.selected && (
            <p className="profile-factors" aria-live="polite">
              Được dùng: tiến bộ +{profiles[s.selected].priorGain} điểm · học
              đều {profiles[s.selected].regularity}%.
              <br />
              Nhu cầu: {profiles[s.selected].need} — chưa được dùng.
            </p>
          )}
          <div className="profile-keys">
            {(Object.keys(profiles) as ProfileId[]).map((id) => (
              <button
                key={id}
                aria-label={`Chọn hồ sơ ${profiles[id].name}`}
                disabled={!profileUnlocked(s, id)}
                aria-pressed={s.selected === id}
                onClick={() => act({ type: "choose", id })}
              >
                {profiles[id].name}
                {!profileUnlocked(s, id) ? " · khóa" : ""}
              </button>
            ))}
          </div>
          {s.selected && (
            <button className="run-key" onClick={() => act({ type: "run" })}>
              ↵ Chạy đánh giá
            </button>
          )}
        </div>
      )}
      {s.phase === "result" && (
        <button
          className="chapter-action"
          onClick={() => act({ type: "acknowledge" })}
        >
          Thử một hồ sơ khác trên laptop
        </button>
      )}
      {s.phase === "connect" && s.carried && !s.linked.includes(s.carried) && (
        <button
          className="chapter-action"
          onClick={() => act({ type: "link" })}
        >
          Đối chiếu {evidence[s.carried].title.toLowerCase()} với kết quả
        </button>
      )}
      {s.flow !== "screen-first" &&
        ["investigate", "choose", "result", "connect"].includes(s.phase) && (
          <button
            className="verdict-hint-button"
            aria-label="Gợi ý điều tra"
            onClick={onHint}
          >
            ?
          </button>
        )}
      {hint && (
        <p className="verdict-hint" role="status">
          {hint}
        </p>
      )}
    </>
  );
}
