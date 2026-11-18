import { useNarration } from "../speech/useNarration";
import {
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { AudioDirector, type Foley } from "./AudioDirector";
import { WorldRenderer, type PropPosition } from "./WorldRenderer";
import { FallbackWorld } from "./FallbackWorld";
import { Recording } from "./Recording";
import {
  captionFor,
  freshSlice,
  hintFor,
  order,
  readSlice,
  SLICE_KEY,
  sliceReducer,
  type Beat,
  type Focus,
  type SliceAction,
  type SliceSave,
} from "./director";
import { GameGuide } from "./GameGuide";
import { PlaybackControls, type PlaybackSpeed } from "./PlaybackControls";
import "./cinematic.css";

const durations: Partial<Record<Beat, number>> = {
  arrival: 4,
  enter: 5.5,
  chair: 3.8,
  invitation: 6,
  evaluate: 1.7,
  verdict: 4,
  response: 6,
  paper: 9,
};
const propNames: Record<string, string> = {
  window: "Nhìn mưa ngoài cửa sổ",
  laptop: "Quan sát laptop",
  notebook: "Đọc bản báo cáo",
  chair: "Nhìn chiếc ghế",
  profile: "Chọn hồ sơ An",
  paper: "Nhìn tờ giấy trắng",
};
export default function CinematicGame({
  initialSave,
  autoStart = false,
  createAudio,
}: {
  initialSave?: SliceSave;
  autoStart?: boolean;
  createAudio?: () => AudioDirector;
} = {}) {
  const [s, dispatch] = useReducer(sliceReducer, freshSlice, () => {
    if (initialSave) return initialSave;
    try {
      return readSlice(localStorage.getItem(SLICE_KEY));
    } catch {
      return freshSlice;
    }
  });
  const [speed, setSpeed] = useState<PlaybackSpeed>(1);
  const [guideOpen, setGuideOpen] = useState(false);
  const [started, setStarted] = useState(false),
    [paused, setPaused] = useState(false),
    [time, setTime] = useState(0),
    [hint, setHint] = useState(false),
    [settings, setSettings] = useState(false),
    [fallback, setFallback] = useState(false),
    [failed, setFailed] = useState(false),
    [storage, setStorage] = useState(true),
    [audioError, setAudioError] = useState(""),
    [recording, setRecording] = useState(false),
    [recordError, setRecordError] = useState("");
  const host = useRef<HTMLDivElement>(null),
    canvas = useRef<HTMLCanvasElement>(null),
    world = useRef<WorldRenderer | FallbackWorld | null>(null),
    audio = useRef<AudioDirector | null>(null),
    recorder = useRef<Recording | null>(null);
  const state = useRef(s),
    running = useRef(false),
    pausedRef = useRef(false),
    clock = useRef(0),
    total = useRef(0),
    lastInteraction = useRef(0),
    cues = useRef(new Set<string>()),
    buttons = useRef(new Map<Focus, HTMLButtonElement>()),
    position = useRef<PropPosition[]>([]),
    loop = useRef(0),
    dtSamples = useRef<number[]>([]);
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const playbackPaused = paused || guideOpen;
  const caption = captionFor(s, time, total.current - lastInteraction.current);
  const voice = useNarration(
    null,
    audio.current,
    false,
    paused,
    s.voice !== false,
  );
  const recordMode = new URLSearchParams(location.search).has("record");
  state.current = s;
  running.current = started;
  pausedRef.current = playbackPaused;
  const act = (a: SliceAction) => {
    lastInteraction.current = total.current;
    setHint(false);
    dispatch(a);
  };
  useEffect(() => {
    try {
      localStorage.setItem(SLICE_KEY, JSON.stringify(s));
      setStorage(true);
    } catch {
      setStorage(false);
    }
    audio.current?.apply(s, playbackPaused);
  }, [s, playbackPaused]);
  useLayoutEffect(() => {
    clock.current = 0;
    setTime(0);
    cues.current.clear();
    audio.current?.beat(s.beat);
    audio.current?.focus(s.focus);
  }, [s.beat]);
  useEffect(() => {
    audio.current?.focus(s.focus);
  }, [s.focus]);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) dispatch({ type: "settings", value: { reduced: true } });
  }, []);
  useEffect(() => {
    const element = host.current,
      original = canvas.current;
    if (!element || !original) return;
    const useFallback = () => {
      world.current?.dispose();
      const replacement = document.createElement("canvas");
      replacement.setAttribute("aria-label", "Phòng thực hành, bản đồ họa 2D");
      replacement.className = "world-canvas";
      original.replaceWith(replacement);
      canvas.current = replacement;
      try {
        world.current = new FallbackWorld(replacement);
        world.current.resize(element.clientWidth, element.clientHeight);
        setFallback(true);
      } catch {
        setFailed(true);
      }
    };
    try {
      world.current = new WorldRenderer(original);
    } catch {
      useFallback();
    }
    const lost = (e: Event) => {
      e.preventDefault();
      useFallback();
    };
    original.addEventListener("webglcontextlost", lost);
    const resize = new ResizeObserver(() =>
      world.current?.resize(element.clientWidth, element.clientHeight),
    );
    resize.observe(element);
    let last = performance.now(),
      update = 0;
    const tick = (now: number) => {
      const raw = (now - last) / 1000;
      last = now;
      const step = raw * speedRef.current;
      const dt = Math.min(step, 0.25);
      const current = state.current;
      if (running.current && !pausedRef.current) {
        const currentLine =
          captionFor(
            current,
            clock.current,
            total.current - lastInteraction.current,
          )?.text ?? null;
        const nextLine =
          captionFor(
            current,
            clock.current + step,
            total.current - lastInteraction.current + raw,
          )?.text ?? null;
        if (!(
          currentLine !== nextLine && voice.player.current?.busyFor(currentLine)
        ))
          clock.current += step;
        total.current += raw;
        dtSamples.current.push(raw);
        if (dtSamples.current.length > 180) dtSamples.current.shift();
        const t = clock.current;
        const cue = (id: string, at: number, sound: Foley) => {
          if (t >= at && !cues.current.has(id)) {
            cues.current.add(id);
            audio.current?.cue(sound);
          }
        };
        if (current.beat === "arrival") {
          cue("bell", 0.15, "bell");
          cue("depart", 1.2, "step");
          cue("close", 2, "door");
        }
        if (current.beat === "enter") {
          cue("door", 0.1, "door");
          for (let i = 0; i < 7; i++) cue(`step${i}`, 1 + i * 0.57, "step");
        }
        if (current.beat === "chair") cue("chair", 0.1, "chair");
        if (current.beat === "evaluate") {
          cue("key", 0.1, "key");
          cue("key2", 0.45, "key");
        }
        if (current.beat === "verdict") cue("verdict", 0.05, "verdict");
        if (current.beat === "paper") cue("paper", 0.2, "paper");
        const duration = durations[current.beat];
        if (
          duration &&
          t >= duration &&
          !cues.current.has("advance") &&
          !voice.player.current?.busy
        ) {
          cues.current.add("advance");
          dispatch({
            type: "beat",
            beat: order[order.indexOf(current.beat) + 1],
          });
        }
        if (
          current.beat === "explore" &&
          current.observed.includes("laptop") &&
          current.observed.includes("notebook") &&
          total.current - lastInteraction.current > 3 &&
          !cues.current.has("advance") &&
          !voice.player.current?.busy
        ) {
          cues.current.add("advance");
          dispatch({ type: "beat", beat: "enter" });
        } else if (
          current.beat === "explore" &&
          current.focus !== "wide" &&
          !voice.player.current?.busy &&
          total.current - lastInteraction.current > 3.8
        )
          dispatch({ type: "focus", focus: "wide" });
        if (total.current - lastInteraction.current > 10) setHint(true);
      }
      if (world.current instanceof WorldRenderer)
        world.current.adaptQuality(raw);
      world.current?.setOverlay(
        !!recorder.current,
        current.captions
          ? captionFor(
              current,
              clock.current,
              total.current - lastInteraction.current,
            )
          : null,
        "",
      );
      world.current?.render(
        current,
        clock.current,
        pausedRef.current ? 0 : dt,
        total.current,
      );
      position.current = world.current?.project() ?? [];
      let edgeIndex = 0;
      for (const p of position.current) {
        const b = buttons.current.get(p.id);
        if (b) {
          const x = Math.max(28, Math.min(element.clientWidth - 28, p.x)),
            y = p.visible
              ? Math.max(100, Math.min(element.clientHeight - 175, p.y))
              : Math.min(element.clientHeight - 200, 180 + edgeIndex++ * 65);
          b.style.left = `${x}px`;
          b.style.top = `${y}px`;
          b.dataset.offscreen = String(!p.visible);
        }
      }
      if (now - update > 100) {
        update = now;
        setTime(clock.current);
      }
      loop.current = requestAnimationFrame(tick);
    };
    loop.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(loop.current);
      resize.disconnect();
      original.removeEventListener("webglcontextlost", lost);
      world.current?.dispose();
      audio.current?.dispose();
    };
  }, []);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape" && started) {
        setPaused((p) => !p);
        setSettings(false);
      }
    };
    const visibility = () => {
      if (document.hidden && started) setPaused(true);
    };
    window.addEventListener("keydown", fn);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.removeEventListener("keydown", fn);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [started]);
  useEffect(() => {
    if (audio.current)
      void audio.current
        .pause(playbackPaused)
        .catch(() =>
          setAudioError(
            "Âm thanh đang bị trình duyệt chặn. Bấm nút âm thanh để thử lại.",
          ),
        );
  }, [playbackPaused]);
  const start = async (sound: boolean) => {
    const next = { ...s, muted: !sound };
    dispatch({ type: "settings", value: { muted: !sound } });
    if (sound) {
      try {
        audio.current ??= createAudio?.() ?? new AudioDirector();
        await audio.current.unlock();
        audio.current.apply(next);
        audio.current.focus(next.focus);
        audio.current.beat(next.beat);
      } catch {
        setAudioError(
          "Âm thanh không khả dụng; phụ đề và tương tác vẫn hoạt động.",
        );
      }
    }
    if (recordMode && canvas.current) {
      try {
        recorder.current = new Recording(
          canvas.current,
          audio.current?.output.stream,
        );
        setRecording(true);
      } catch {
        setRecordError("Trình duyệt không hỗ trợ MediaRecorder.");
      }
    }
    setStarted(true);
    lastInteraction.current = total.current;
  };
  useEffect(() => {
    if (autoStart) {
      // A browser may keep resume() pending after the menu transition.
      // The story must remain playable even while audio awaits permission.
      setStarted(true);
      void start(!initialSave?.muted);
    }
  }, []);
  const toggleMute = async () => {
    if (s.muted || !audio.current) {
      try {
        audio.current ??= createAudio?.() ?? new AudioDirector();
        await audio.current.unlock();
        audio.current.focus(s.focus);
        audio.current.beat(s.beat);
        setAudioError("");
        act({ type: "settings", value: { muted: false } });
      } catch {
        setAudioError("Không thể mở âm thanh trên trình duyệt này.");
      }
    } else act({ type: "settings", value: { muted: true } });
  };
  const interact = (id: Focus) => {
    if (paused) return;
    if (
      s.beat === "explore" &&
      (id === "window" || id === "laptop" || id === "notebook")
    ) {
      act({ type: "observe", prop: id });
      audio.current?.cue(
        id === "notebook" ? "paper" : id === "laptop" ? "key" : "paper",
      );
    } else if (s.beat === "profile" && id === "profile") {
      act({ type: "select" });
      audio.current?.cue("paper");
    } else if (s.beat === "profile" && id === "laptop") {
      if (s.selected) act({ type: "evaluate" });
      else act({ type: "focus", focus: "laptop" });
    } else act({ type: "focus", focus: id });
  };
  let active: Focus[] =
    s.beat === "explore"
      ? ["window", "laptop", "notebook"]
      : s.beat === "profile"
        ? ["profile", "laptop"]
        : s.beat === "chair"
          ? ["chair"]
          : s.beat === "complete"
            ? ["paper"]
            : [];
  if (!started || paused || failed) active = [];
  if (!s.reduced && time < 1.6 && ["profile", "explore"].includes(s.beat))
    active = [];
  const download = async () => {
    if (!recorder.current) return;
    const blob = await recorder.current.stop();
    recorder.current = null;
    setRecording(false);
    const url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = "project-2011-proof-of-feel.webm";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };
  return (
    <div
      className={`cinematic ${s.reduced ? "motion-reduced" : ""} ${recording ? "is-recording" : ""}`}
      ref={host}
      data-beat={s.beat}
      data-focus={s.focus}
      data-tested={order.indexOf(s.beat) >= 7}
      onPointerMove={(e) => {
        if (e.pointerType === "mouse")
          world.current?.look(
            (e.clientX / innerWidth - 0.5) * 2,
            (e.clientY / innerHeight - 0.5) * 2,
          );
      }}
    >
      <canvas
        ref={canvas}
        className="world-canvas"
        aria-label="Phòng thực hành đại học trong mưa chiều, 17:05"
      />
      <div className="cinematic-shade" aria-hidden="true" />
      {!started ? (
        <div className="entry-screen">
          <div className="entry-title">
            <span>THE UNWRITTEN LESSON</span>
            <h1>Người ở lại.</h1>
            <p>17:05 — một buổi chiều sau giờ học.</p>
          </div>
          <div className="entry-actions">
            <button className="enter-game" onClick={() => void start(true)}>
              {s.beat === "arrival"
                ? "Bước vào căn phòng"
                : "Trở lại khoảnh khắc"}{" "}
              <span>↗</span>
            </button>
            <button className="quiet-button" onClick={() => void start(false)}>
              Chơi không âm thanh
            </button>
            <small>
              Phân cảnh S02–S03 · Chạm để quan sát · Nên bật âm thanh
            </small>
          </div>
          <span className="entry-credit">THE UNWRITTEN LESSON</span>
        </div>
      ) : (
        <>
          <div className="corner-note">
            <span>17:05</span>
            <small>PHÒNG THỰC HÀNH · 2026</small>
          </div>
          <PlaybackControls
            muted={s.muted}
            music={s.music}
            onSound={toggleMute}
            onMusic={() => {
              act({ type: "settings", value: { music: s.muted || !s.music } });
              if (s.muted || !audio.current) void toggleMute();
            }}
            onPause={() => setPaused(true)}
            speed={speed}
            onSpeed={setSpeed}
            onGuide={() => setGuideOpen(true)}
          />
          {guideOpen && (
            <GameGuide
              recap="Bạn đang xem lại buổi thực hành của An vào một chiều mưa năm 2026."
              steps={[
                "Chạm vào laptop và bản báo cáo để đọc hai vật chứng quanh bàn.",
                "Khi xuất hiện hồ sơ An, chọn hồ sơ rồi chạy đánh giá trên laptop.",
                "Đọc kết quả và theo dõi những vật chứng tiếp theo được gợi sáng.",
              ]}
              onClose={() => setGuideOpen(false)}
            />
          )}
          {active.map((id) => (
            <button
              key={id}
              ref={(el) => {
                if (el) {
                  buttons.current.set(id, el);
                  const p = position.current.find((p) => p.id === id);
                  if (p && host.current) {
                    el.style.left = `${Math.max(28, Math.min(host.current.clientWidth - 28, p.x))}px`;
                    el.style.top = `${Math.max(100, Math.min(host.current.clientHeight - 175, p.y))}px`;
                  }
                } else buttons.current.delete(id);
              }}
              className={`world-hotspot ${s.focus === id ? "focused" : ""} ${s.observed.includes(id) ? "observed" : ""}`}
              aria-label={
                id === "laptop" && s.beat === "profile"
                  ? "Chạy hồ sơ An trên laptop"
                  : propNames[id]
              }
              onClick={() => interact(id)}
              draggable={id === "profile"}
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", "an-profile");
                act({ type: "select" });
              }}
              onDragOver={(e) => {
                if (id === "laptop") e.preventDefault();
              }}
              onDrop={(e) => {
                if (
                  id === "laptop" &&
                  e.dataTransfer.getData("text/plain") === "an-profile"
                ) {
                  e.preventDefault();
                  act({ type: "evaluate" });
                }
              }}
            >
              <span className="hotspot-ring">
                {s.observed.includes(id) || (id === "profile" && s.selected)
                  ? "✓"
                  : "·"}
              </span>
              <span className="hotspot-name">
                {id === "laptop" && s.beat === "profile"
                  ? s.selected
                    ? "Thử hồ sơ An"
                    : "Laptop"
                  : propNames[id]}
              </span>
            </button>
          ))}
          {s.beat === "profile" && (
            <p className="interaction-prompt">
              {s.selected
                ? "Hồ sơ đã chọn — chạm laptop để kiểm thử."
                : "Chạm hồ sơ AN trên bàn, rồi chạm laptop."}
            </p>
          )}
          {(hint || (s.beat === "explore" && time < 4)) &&
            s.beat === "explore" && <p className="world-hint">{hintFor(s)}</p>}
          {s.captions && caption && !paused && (
            <div className="subtitle" aria-live="polite" aria-atomic="true">
              <span>{caption.speaker}</span>
              <p>{caption.text}</p>
            </div>
          )}
          {s.beat === "verdict" && time < 2 && (
            <span className="silence-mark" aria-label="Khoảng lặng hai giây">
              —
            </span>
          )}
          {s.beat === "complete" && (
            <div className="slice-end">
              <span>PHÂN CẢNH KẾT THÚC</span>
              <button
                onClick={() => {
                  act({ type: "restart" });
                  clock.current = 0;
                }}
              >
                Trải nghiệm lại ↺
              </button>
              {recording && (
                <button onClick={() => void download()}>
                  Tải bản ghi demo
                </button>
              )}
            </div>
          )}
          {(fallback || audioError || !storage || recordError) && (
            <p className="runtime-status">
              {fallback ? "Đồ họa 2D · GPU không khả dụng. " : ""}
              {audioError}
              {!storage ? " Tiến trình chỉ giữ trong phiên này." : ""}
              {recordError}
            </p>
          )}
        </>
      )}
      {failed && (
        <div className="fatal-notice" role="alert">
          Không khởi tạo được đồ họa trên trình duyệt này. Hãy tải lại hoặc mở
          bằng Chrome/Edge có Canvas.
        </div>
      )}
      {paused && (
        <div
          className="pause-screen"
          onKeyDown={(e) => {
            if (e.key !== "Tab") return;
            const nodes =
              e.currentTarget.querySelectorAll<HTMLElement>("button,input");
            const first = nodes[0],
              last = nodes[nodes.length - 1];
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last?.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first?.focus();
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Tạm dừng"
        >
          <h2>Khoảnh khắc đang chờ.</h2>
          <button
            autoFocus
            className="enter-game"
            onClick={() => setPaused(false)}
          >
            Trở lại căn phòng
          </button>
          <button onClick={() => setSettings((v) => !v)}>Tùy chỉnh</button>
          {settings && (
            <div className="options">
              <label>
                Âm lượng
                <input
                  type="range"
                  min="0"
                  max="1"
                  step=".05"
                  value={s.volume}
                  onChange={(e) =>
                    act({
                      type: "settings",
                      value: { volume: Number(e.target.value) },
                    })
                  }
                />
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={s.music}
                  onChange={(e) =>
                    act({
                      type: "settings",
                      value: { music: e.target.checked },
                    })
                  }
                />{" "}
                Nhạc lo-fi
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={s.sfx}
                  onChange={(e) =>
                    act({ type: "settings", value: { sfx: e.target.checked } })
                  }
                />{" "}
                Âm môi trường và đồ vật
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={s.voice !== false}
                  onChange={(e) =>
                    act({
                      type: "settings",
                      value: { voice: e.target.checked },
                    })
                  }
                />
                Giọng dẫn mở đầu
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={s.captions}
                  onChange={(e) =>
                    act({
                      type: "settings",
                      value: { captions: e.target.checked },
                    })
                  }
                />{" "}
                Phụ đề
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={s.reduced}
                  onChange={(e) =>
                    act({
                      type: "settings",
                      value: { reduced: e.target.checked },
                    })
                  }
                />{" "}
                Giảm chuyển động
              </label>
            </div>
          )}
          <button
            onClick={() => {
              act({ type: "restart" });
              setPaused(false);
              clock.current = 0;
            }}
          >
            Bắt đầu lại phân cảnh
          </button>
          {recording && (
            <button onClick={() => void download()}>Tải bản ghi demo</button>
          )}
          <p>
            Chuột / chạm để quan sát · Tab / Enter để tương tác · Esc để tạm
            dừng
          </p>
        </div>
      )}
      {new URLSearchParams(location.search).has("qa") && (
        <output hidden data-testid="telemetry">
          {JSON.stringify({
            beat: s.beat,
            time,
            observed: s.observed,
            selected: s.selected,
            audio: audio.current
              ? {
                  mix: audio.current.mix,
                  events: audio.current.events,
                  context: audio.current.context.state,
                }
              : null,
            world: world.current?.snapshot(),
            fps: dtSamples.current.length
              ? 1 /
                (dtSamples.current.reduce((a, b) => a + b, 0) /
                  dtSamples.current.length)
              : 0,
          })}
        </output>
      )}
    </div>
  );
}
