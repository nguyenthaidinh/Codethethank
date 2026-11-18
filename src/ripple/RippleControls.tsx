import type { RippleSave, RippleAction } from "./state";
import "./ripple.css";
import "./timePassage.css";
import "./chair-memory.css";
import { ResearchEraHUD } from "./ResearchEraHUD";
import { ResearchJournal2029 } from "./ResearchJournal2029";
import { FutureResearchHUD, isFutureResearchPhase } from "./FutureResearchHUD";
import { SketchQuestions } from "./SketchQuestions";
import { TimePassage } from "./YearPassageOverlay";
import { rippleTimePassage } from "./timePassage";
import { LabBench2035 } from "./LabBench2035";
import { CodePatchBench2035 } from "./CodePatchBench2035";
import { LaunchReview2045 } from "./LaunchReview2045";
export function RippleControls({
  s,
  act,
  hint,
  time,
  reduced,
}: {
  s: RippleSave;
  act: (a: RippleAction) => void;
  hint: boolean;
  time: number;
  reduced: boolean;
}) {
  const passage = rippleTimePassage(s, time, reduced);
  return (
    <>
      <div
        className="ripple-controls-content"
        inert={passage ? true : undefined}
        aria-hidden={passage ? true : undefined}
      >
        {s.phase === "echo" && (
          <header className="chair-memory-title">
            <span>HỒI ỨC</span>
            <h2>2026</h2>
            <p>Phòng thực hành · Sau giờ học</p>
          </header>
        )}
        {isFutureResearchPhase(s) && (
          <FutureResearchHUD s={s} act={act} time={time} />
        )}
        {s.phase === "sketch" && <SketchQuestions s={s} act={act} />}
        {s.milestones === 0 && ["years", "milestone"].includes(s.phase) && (
          <ResearchJournal2029 open={s.phase === "milestone"} act={act} />
        )}
        {s.phase === "years" &&
          s.milestones === 1 &&
          (s.lab2035?.codePatch ? (
            <CodePatchBench2035
              patch={s.lab2035.codePatch}
              act={act}
              time={time}
              suspended={!!passage}
            />
          ) : s.lab2035 ? (
            <LabBench2035
              lab={s.lab2035}
              act={act}
              time={time}
              suspended={!!passage}
            />
          ) : (
            <section
              className="research-2029"
              aria-label="Phòng nghiên cứu năm 2035"
            >
              <ResearchEraHUD year={2035} act={act} />
            </section>
          ))}
        {s.milestones === 2 && ["years", "milestone"].includes(s.phase) && (
          <LaunchReview2045
            open={s.phase === "milestone"}
            time={time}
            act={act}
          />
        )}
        {s.phase === "finale" && (
          <p className="ripple-finale">
            THE RIPPLE · Ký ức đã hoàn tất
            <small>
              Tiến trình đã lưu · Lời cảm ơn đang chờ ở chương cuối.
            </small>
          </p>
        )}
        {hint &&
          !(s.phase === "years" && s.milestones === 2) &&
          !(s.phase === "years" && s.milestones === 1 && s.lab2035) &&
          ["years", "reconstruct"].includes(s.phase) && (
            <p className="verdict-hint">
              {s.phase === "reconstruct"
                ? "Chạm hồ sơ, chiếc ghế và cuốn sổ. Không có thứ tự đúng sai."
                : "Chạm vật thể được chỉ dẫn để tiếp tục khôi phục ký ức."}
            </p>
          )}
      </div>
      {passage && <TimePassage cue={passage} reduced={reduced} />}
    </>
  );
}
