import { useNarration } from "../speech/useNarration";
import { openingNarration } from "../speech/policy";
import { aionCue } from "../speech/aion2046";
import { GameGuide } from "../cinematic/GameGuide";
import { chapterGuide } from "./chapterGuide";
import { PlaybackControls, type PlaybackSpeed } from "../cinematic/PlaybackControls";
import { Subtitle } from "../cinematic/SceneChrome";
import { chairMemoryGrade } from "../cinematic/ChairMatchCut";
import { FinaleControls } from "../finale/FinaleControls";
import { finaleDurations, type FinaleAction } from "../finale/state";
import { finaleCaption } from "../finale/story";
import {
  readLetter,
  saveLetter,
  removeLetter,
  normalizeLetter,
  blankLetter,
  type Letter,
} from "../finale/letter";
import { RippleControls } from "../ripple/RippleControls";
import { rippleTimePassage, rippleClockStep } from "../ripple/timePassage";
import {
  durations,
  type RippleAction,
  type RipplePhase,
} from "../ripple/state";
import { rippleCaption } from "../ripple/story";
import {
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import CinematicGame from "../cinematic/CinematicGame";
import {
  freshSlice,
  SLICE_KEY,
  type Focus,
  type SliceSave,
} from "../cinematic/director";
import { WorldRenderer } from "../cinematic/WorldRenderer";
import { AN_SETBACK } from "../cinematic/AnSetback";
import {
  TEACHER_ENTRANCE,
  teacherFootfalls,
} from "../cinematic/TeacherEntrance";
import { FallbackWorld } from "../cinematic/FallbackWorld";
import type { AudioDirector } from "../cinematic/AudioDirector";
import { ChapterAudio } from "./ChapterAudio";
import type { FutureWorld } from "../future/FutureWorld";
import { FutureFallback } from "../future/FutureFallback";
import {
  futureCaption,
  OPENING_DURATION,
  OPENING_TIMING,
  narration,
  futurePlace,
  channels,
  type Channel,
} from "../future/direction";
import { INSPECTION_KEY, readInspection } from "../future/inspection";
import "../future/future.css";
import { chapterReducer, chapterCaption, freshChapter } from "./director";
import {
  CLASSROOM_INTRO_DURATION,
  classroomIntroCue,
  classroomIntroCues,
  isClassroomIntro,
} from "./ClassroomIntro";
import "../cinematic/cinematic.css";
import "./chapter.css";
import "../art/narrative.css";
import {
  freshVerdict,
  initialClassroomCase,
  type VerdictAction,
} from "../verdict/state";
import { evidence, type EvidenceId } from "../verdict/evidence";
import {
  directedFocus,
  roomBeat,
  verdictCaption,
  verdictHint,
} from "../verdict/story";
import { VerdictControls } from "../verdict/VerdictControls";
import { freshStay, cueKey, isSpokenScene, type StayAction } from "../stayed/state";
import { stayAutoDelay } from "../stayed/story";
import { StayControls } from "../stayed/StayControls";

export default function ChapterGame({
  initialSave = freshSlice,
  createAudio,
  audioLevels,
  onMenu,
  onReplay,
}: {
  initialSave?: SliceSave;
  createAudio?: () => AudioDirector;
  audioLevels?: { music: number; effects: number };
  onMenu?: () => void;
  onReplay?: () => void;
}) {
  const [next] = useState<SliceSave | null>(() =>
    !initialSave.chapter && initialSave.beat !== "arrival" ? initialSave : null,
  );
  return next ? (
    <CinematicGame initialSave={next} autoStart createAudio={createAudio} />
  ) : (
    <ChapterStage
      initialSave={initialSave}
      audioLevels={audioLevels}
      onMenu={onMenu}
      onReplay={onReplay}
    />
  );
}
function ChapterStage({
  initialSave,
  audioLevels,
  onMenu,
  onReplay,
}: {
  initialSave: SliceSave;
  audioLevels?: { music: number; effects: number };
  onMenu?: () => void;
  onReplay?: () => void;
}) {
  const [s, dispatch] = useReducer(
    chapterReducer,
    initialSave.chapter ?? freshChapter,
  );
  const v = s.beat === "NEXT_SCENE_READY" ? (s.verdict ?? freshVerdict) : null;
  const st = v?.phase === "chapter02" ? (v.stayed ?? freshStay) : null;
  const rip = v?.ripple ?? null;
  const fin = v?.finale ?? null;
  const [letter, setLetter] = useState<Letter>(readLetter);
  const [letterSaved, setLetterSaved] = useState(() => {
    try {
      return !!localStorage.getItem("project2011.gratitude.v1");
    } catch {
      return false;
    }
  });
  const [followedDoor, setFollowedDoor] = useState(false);
  const followDoorRef = useRef(false);
  followDoorRef.current = followedDoor;
  const [inspection, setInspection] = useState<EvidenceId | null>(null);
  const [hintVisible, setHintVisible] = useState(false);
  const [speed, setSpeed] = useState<PlaybackSpeed>(1);
  const [guideOpen, setGuideOpen] = useState(false);
  const lastAction = useRef(0);
  const [settings, setSettings] = useState({
    ...initialSave,
    reduced:
      initialSave.reduced ||
      matchMedia("(prefers-reduced-motion: reduce)").matches,
  });
  const [focus, setFocus] = useState<Focus>(
    initialSave.chapter?.beat === "LAPTOP_INVESTIGATION" ? "laptop" : "wide",
  );
  const [time, setTime] = useState(
      isClassroomIntro(s.beat) ? (s.introElapsed ?? 0) : 0,
    ),
    [paused, setPaused] = useState(false),
    [fallback, setFallback] = useState(false),
    [status, setStatus] = useState(""),
    [saved, setSaved] = useState(true);
  const root = useRef<HTMLDivElement>(null),
    futureCanvas = useRef<HTMLCanvasElement>(null),
    roomCanvas = useRef<HTMLCanvasElement>(null);
  const future = useRef<FutureWorld | FutureFallback | null>(null),
    room = useRef<WorldRenderer | FallbackWorld | null>(null),
    audio = useRef<ChapterAudio | null>(null);
  const captionAt = useRef<(at: number) => string | null>(() => null);
  const rippleClockPhase = useRef<RipplePhase | null>(null);
  const clock = useRef(isClassroomIntro(s.beat) ? (s.introElapsed ?? 0) : 0),
    clockBeat = useRef<string | null>(null),
    elapsed = useRef(0),
    cues = useRef(new Set<string>()),
    frame = useRef(0),
    buttons = useRef(new Map<string, HTMLButtonElement>()),
    focusSignal = useRef(false);
  const current = useRef({ s, settings, focus, paused, letter, speed });
  current.current = {
    s,
    settings,
    focus,
    paused: paused || guideOpen,
    letter,
    speed,
  };
  const [futureFound, setFutureFound] = useState<Channel[]>(() => {
    if (initialSave.chapter?.beat !== "SIGNAL_INVESTIGATION") return [];
    try {
      return readInspection(localStorage.getItem(INSPECTION_KEY));
    } catch {
      return [];
    }
  });
  const futureSelectedAt = useRef(0);
  const [futureSelected, setFutureSelected] = useState<Channel | null>(null);
  const [futureView, setFutureView] = useState<"core" | "atrium">("core");
  useEffect(() => future.current?.lookPlace(futureView), [futureView]);
  const futureInspection = useRef({
    found: futureFound,
    selected: futureSelected,
  });
  futureInspection.current = { found: futureFound, selected: futureSelected };
  useEffect(() => {
    try {
      if (s.beat === "OPENING_CINEMATIC")
        localStorage.removeItem(INSPECTION_KEY);
      else if (s.beat === "SIGNAL_INVESTIGATION")
        localStorage.setItem(
          INSPECTION_KEY,
          JSON.stringify({ version: 1, found: futureFound }),
        );
    } catch {
      /* Inspection remains playable when storage is unavailable. */
    }
  }, [s.beat, futureFound]);
  const roomActive = [
    "CLASSROOM_ESTABLISHING",
    "CLASSROOM_EXPLORATION",
    "LAPTOP_INVESTIGATION",
    "NEXT_SCENE_READY",
  ].includes(s.beat);
  const introducing = isClassroomIntro(s.beat);
  const ensureAudio = async () => {
    try {
      audio.current ??= new ChapterAudio(audioLevels);
      audio.current.environment(current.current.s.signal ? 1 : 0);
      audio.current.apply(current.current.settings, current.current.paused);
      await audio.current.unlock();
      const saved = current.current.s.verdict;
      if (saved?.phase === "chapter02")
        audio.current.stayMix(saved.stayed?.phase ?? "discussion");
      if (saved?.ripple)
        audio.current.rippleMix(saved.ripple.phase, saved.ripple.milestones);
      if (saved?.finale) audio.current.finaleMix(saved.finale.phase);
      setStatus("");
    } catch {
      setStatus("Âm thanh chưa khả dụng. Bạn vẫn có thể chơi bằng phụ đề.");
    }
  };
  useEffect(() => {
    if (!initialSave.muted) void ensureAudio();
    return () => audio.current?.dispose();
  }, []);
  const playbackPaused = paused || guideOpen;
  useEffect(() => {
    audio.current?.apply(settings, playbackPaused);
    if (audio.current)
      void audio.current
        .pause(playbackPaused)
        .catch(() => setStatus("Chạm nút âm thanh để mở lại tiếng."));
  }, [settings, playbackPaused]);
  useEffect(() => {
    try {
      localStorage.setItem(
        SLICE_KEY,
        JSON.stringify({
          ...settings,
          beat: "explore",
          focus: "wide",
          chapter: s,
        }),
      );
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }, [s, settings]);
  useLayoutEffect(() => {
    const resume = isClassroomIntro(s.beat)
      ? Math.max(
          s.introElapsed ?? 0,
          clockBeat.current === s.beat ? clock.current : 0,
        )
      : 0;
    clockBeat.current = s.beat;
    clock.current = resume;
    cues.current.clear();
    setTime(resume);
    if (s.beat === "SIGNAL_INVESTIGATION") {
      audio.current?.signalFocus(true);
      audio.current?.chime("select", 330);
    }
    if (s.beat === "MEMORY_TRANSITION") audio.current?.chime("memory", 196);
    if (isClassroomIntro(s.beat)) {
      setFocus(classroomIntroCue(resume).focus);
      for (const cue of classroomIntroCues)
        if (cue.start <= resume) cues.current.add(`intro.${cue.start}`);
      audio.current?.environment(1);
      audio.current?.focus("wide");
    }
  }, [s.beat]);
  useLayoutEffect(() => {
    if (!v) return;
    clock.current = 0;
    cues.current.clear();
    setTime(0);
    setHintVisible(false);
    lastAction.current = elapsed.current;
    setInspection(null);
    if (
      ["investigate", "choose", "running", "result", "comparison"].includes(
        v.phase,
      )
    )
      setFocus("laptop");
    if (v.phase === "connect") setFocus("wide");
    if (v.phase === "review") setFocus("profile");
    if (v.phase === "teacher_enter") setFocus("door");
    audio.current?.beat(v.phase === "reaction" ? "verdict" : "explore");
  }, [v?.phase]);
  useLayoutEffect(() => {
    if (!st) return;
    clock.current = 0;
    cues.current.clear();
    setTime(0);
    lastAction.current = elapsed.current;
    setHintVisible(false);
    audio.current?.stayMix(st.phase);
  }, [st?.phase, st?.line, st?.responses]);
  useLayoutEffect(() => {
    if (!rip) return;
    rippleClockPhase.current = rip.phase;
    clock.current = rip.elapsed;
    cues.current.clear();
    setTime(rip.elapsed);
    lastAction.current = elapsed.current;
    setHintVisible(false);
    audio.current?.rippleMix(rip.phase, rip.milestones);
  }, [rip?.phase, rip?.milestones]);
  useLayoutEffect(() => {
    if (!fin) return;
    clock.current = fin.elapsed;
    cues.current.clear();
    setTime(fin.elapsed);
    audio.current?.finaleMix(fin.phase);
  }, [fin?.phase, fin?.memoryFocus]);
  useEffect(() => {
    if (roomActive && !rip) audio.current?.focus(focus);
  }, [focus, roomActive]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !e.isComposing) setPaused((v) => !v);
      const { s: chapter, paused: stop } = current.current;
      const stay = chapter.verdict?.stayed ?? freshStay;
      if (
        !stop &&
        !e.isComposing &&
        !e.repeat &&
        (e.key === "Enter" || e.key === " ") &&
        !(
          e.target instanceof Element &&
          e.target.closest("button,input,textarea,select,a,[contenteditable]")
        ) &&
        chapter.verdict?.phase === "chapter02" &&
        !chapter.verdict.ripple &&
        stay &&
        isSpokenScene(stay.phase)
      ) {
        e.preventDefault();
        dispatch({
          type: "verdict",
          action: {
            type: "stay",
            action: { type: "advance", cue: cueKey(stay) },
          },
        });
      }
    };
    const visibility = () => {
      if (document.hidden) setPaused(true);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  useEffect(() => {
    if (!futureCanvas.current || !root.current) return;
    let mounted = true;
    if (
      [
        "OPENING_CINEMATIC",
        "PLAYER_CONTROL_ENABLED",
        "SIGNAL_INVESTIGATION",
        "MEMORY_TRANSITION",
      ].includes(current.current.s.beat)
    )
      void import("../future/FutureWorld")
        .then(({ FutureWorld }) => {
          if (
            mounted &&
            futureCanvas.current &&
            [
              "OPENING_CINEMATIC",
              "PLAYER_CONTROL_ENABLED",
              "SIGNAL_INVESTIGATION",
              "MEMORY_TRANSITION",
            ].includes(current.current.s.beat)
          ) {
            future.current = new FutureWorld(futureCanvas.current);
            resize();
          }
        })
        .catch(() => {
          if (
            mounted &&
            futureCanvas.current &&
            [
              "OPENING_CINEMATIC",
              "PLAYER_CONTROL_ENABLED",
              "SIGNAL_INVESTIGATION",
              "MEMORY_TRANSITION",
            ].includes(current.current.s.beat)
          ) {
            const replacement = document.createElement("canvas");
            replacement.className = "world-canvas chapter-future";
            replacement.setAttribute(
              "aria-label",
              "Trụ sở AION 2046 · đồ họa tương thích",
            );
            futureCanvas.current.replaceWith(replacement);
            futureCanvas.current = replacement;
            future.current = new FutureFallback(replacement);
            resize();
          }
        });
    const element = root.current;
    const resize = () => {
      future.current?.resize(element.clientWidth, element.clientHeight);
      room.current?.resize(element.clientWidth, element.clientHeight);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();
    let last = performance.now(),
      update = 0;
    let openingPlace: string | null = null;
    const place = (id: string, x: number, y: number) => {
      const b = buttons.current.get(id);
      if (b) {
        b.style.left = `${Math.max(32, Math.min(element.clientWidth - 32, x))}px`;
        b.style.top = `${Math.max(95, Math.min(element.clientHeight - 210, y))}px`;
        b.dataset.labelEdge =
          x < 135 ? "left" : x > element.clientWidth - 135 ? "right" : "center";
      }
    };
    const tick = (now: number) => {
      const raw = (now - last) / 1000;
      last = now;
      const {
        s: state,
        settings: prefs,
        focus: f,
        paused: stop,
        speed: rate,
      } = current.current;
      const step = raw * rate;
      const dt = stop ? 0 : Math.min(step, 0.25);
      const openingWait =
        state.beat === "OPENING_CINEMATIC" &&
        (!future.current?.ready ||
          (prefs.voice !== false &&
            !prefs.muted &&
            voice.player.current?.loading));
      if (
        !stop &&
        !openingWait &&
        (!isClassroomIntro(state.beat) || room.current)
      ) {
        const changed =
          captionAt.current(clock.current + step) !==
          captionAt.current(clock.current);
        if (!(
          changed &&
          voice.player.current?.busyFor(captionAt.current(clock.current))
        ))
          clock.current += rippleClockStep(
            state.beat === "NEXT_SCENE_READY" && !state.verdict?.finale
              ? (state.verdict?.ripple ?? null)
              : null,
            clock.current,
            step,
            prefs.reduced,
          );
        elapsed.current += raw;
      }
      const t = clock.current;
      const verdict =
        state.beat === "NEXT_SCENE_READY"
          ? (state.verdict ?? freshVerdict)
          : null;
      const cue = (id: string, at: number, fn: () => void) => {
        const speechTransition = [
          "control",
          "arrive",
          "introduction-complete",
          "evaluated",
          "hold",
          "compare",
          "chapter02",
          "stay.advance",
          "stay.notes",
          "finale.advance",
        ].includes(id);
        if (speechTransition && voice.player.current?.busy) return;
        if (!stop && t >= at && !cues.current.has(id)) {
          cues.current.add(id);
          fn();
        }
      };
      if (state.beat === "OPENING_CINEMATIC") {
        cue("motif", OPENING_TIMING.nexus, () => audio.current?.motif());
        cue("signal", OPENING_TIMING.anomaly, () =>
          audio.current?.chime("signal", 523.25),
        );
        cue("control", OPENING_DURATION, () => dispatch({ type: "skip" }));
      }
      if (state.beat === "MEMORY_TRANSITION") {
        cue("fade", 0, () => audio.current?.environment(0, true));
        cue("rain", 4, () => audio.current?.environment(1));
        cue("bell", 5, () => audio.current?.cue("bell"));
        cue("depart", 6.5, () => audio.current?.cue("step"));
        cue("depart2", 7.2, () => audio.current?.cue("step"));
        cue("arrive", 8, () => dispatch({ type: "arrive" }));
      }
      if (isClassroomIntro(state.beat)) {
        const progress = Math.min(CLASSROOM_INTRO_DURATION, Math.floor(t));
        if (!stop && progress > (state.introElapsed ?? 0))
          dispatch({ type: "intro-tick", elapsed: progress });
        for (const intro of classroomIntroCues)
          cue(`intro.${intro.start}`, intro.start, () => {
            setFocus(intro.focus);
            if (intro.focus === "notebook" || intro.focus === "notes")
              audio.current?.cue("paper");
          });
        cue("introduction-complete", CLASSROOM_INTRO_DURATION, () =>
          dispatch({ type: "introduction-complete" }),
        );
      }
      if (verdict) {
        if (!stop && elapsed.current - lastAction.current > 10)
          setHintVisible(true);
        const send = (action: VerdictAction) =>
          dispatch({ type: "verdict", action });
        if (verdict.phase === "running") {
          cue("key", 0.05, () => audio.current?.cue("key"));
          cue("key2", 0.6, () => audio.current?.cue("key"));
          cue("key3", 1.2, () => audio.current?.cue("key"));
          cue("evaluated", 1.8, () => send({ type: "finish" }));
        }
        if (verdict.phase === "reaction") {
          cue("verdict", 0.05, () => audio.current?.cue("verdict"));
          if (verdict.flow === "screen-first")
            cue("an.desk", AN_SETBACK.impactAt, () =>
              audio.current?.cue("desk"),
            );
          cue(
            "hold",
            verdict.flow === "screen-first" ? AN_SETBACK.duration : 8,
            () => send({ type: "settle" }),
          );
        }
        if (verdict.phase === "comparison")
          cue("compare", 4, () => send({ type: "compared" }));
        if (verdict.phase === "teacher_enter") {
          cue("door", TEACHER_ENTRANCE.lead + TEACHER_ENTRANCE.openFrom, () =>
            audio.current?.cue("door"),
          );
          teacherFootfalls.forEach((at, i) =>
            cue(`step${i}`, TEACHER_ENTRANCE.lead + at, () =>
              audio.current?.cue("step"),
            ),
          );
          cue("chapter02", TEACHER_ENTRANCE.duration, () =>
            send({ type: "arrived" }),
          );
        }
        if (verdict.finale) {
          const f = verdict.finale;
          const sendFinale = (action: FinaleAction) =>
            send({ type: "finale", action });
          if (finaleDurations[f.phase]) {
            if (!stop && Math.floor(t) > Math.floor(f.elapsed))
              sendFinale({ type: "tick", elapsed: t });
            if (f.elapsed >= (finaleDurations[f.phase] ?? Infinity))
              cue("finale.advance", 0, () => sendFinale({ type: "advance" }));
          }
          if (!stop && f.phase === "transform" && t >= 5 && !f.starCue) {
            sendFinale({ type: "star-cue" });
            audio.current?.chime("finale.star", 523.25);
          }
        }
        if (verdict.ripple && !verdict.finale) {
          const r = verdict.ripple;
          const sendRipple = (action: RippleAction) =>
            send({ type: "ripple", action });
          if (durations[r.phase]) {
            if (Math.floor(t) > Math.floor(r.elapsed))
              sendRipple({ type: "tick", elapsed: t });
            if (r.elapsed >= (durations[r.phase] ?? Infinity))
              cue("ripple.advance", 0, () => sendRipple({ type: "advance" }));
          }
          for (const phase of ["echo", "chair"] as const) {
            const id = `${phase}.chair`;
            if (r.phase === phase && t >= 0.1 && !r.played.includes(id)) {
              sendRipple({ type: "played", id });
              audio.current?.playChairMotif();
            }
          }
          if (
            r.phase === "reveal" &&
            t >= 0.5 &&
            !r.played.includes("reveal.music")
          ) {
            sendRipple({ type: "played", id: "reveal.music" });
            audio.current?.motif();
          }
          if (!stop && elapsed.current - lastAction.current > 10)
            setHintVisible(true);
        }
        if (verdict.phase === "chapter02" && !verdict.ripple) {
          const stay = verdict.stayed ?? freshStay;
          const advance = (action: StayAction) =>
            send({ type: "stay", action });
          const delay = stayAutoDelay(stay);
          if (delay !== null)
            cue("stay.advance", delay, () =>
              advance({ type: "advance", cue: cueKey(stay) }),
            );
          if (stay.phase === "chair")
            cue("stay.chair", 0.1, () => audio.current?.playChairMotif());
          if (stay.phase === "notebook") {
            cue("stay.open", 0.1, () => audio.current?.cue("paper"));
            if (
              stay.read.length === 2 &&
              elapsed.current - lastAction.current > 2
            )
              cue("stay.notes", 0, () => advance({ type: "finish-notes" }));
          }
          if (stay.phase === "unwritten")
            cue("stay.pen", 0.1, () => audio.current?.cue("pen"));
          if (stay.phase === "written") {
            cue("stay.stroke", 0.1, () => audio.current?.cue("pen"));
            cue("stay.music", 0.5, () => {
              audio.current?.endingCue();
              audio.current?.stayMix(stay.phase);
            });
          }
          if (stay.phase === "second_chance" && stay.line === 2)
            cue("stay.slide", 0.1, () => audio.current?.cue("paper"));
        }
      }
      const school = [
        "CLASSROOM_ESTABLISHING",
        "CLASSROOM_EXPLORATION",
        "LAPTOP_INVESTIGATION",
        "NEXT_SCENE_READY",
      ].includes(state.beat);
      if (!school) {
        const placeName = futurePlace(state.beat, t);
        if (placeName !== openingPlace && audio.current) {
          openingPlace = placeName;
          audio.current.openingSpace(placeName);
        }
        future.current?.setInvestigation(
          futureInspection.current.found,
          futureInspection.current.selected,
        );
        future.current?.render(
          state.beat,
          t,
          dt,
          elapsed.current,
          prefs.reduced,
        );
        const signal = future.current?.signal;
        if (signal) place("signal", signal.x, signal.y);
        for (const [id, p] of Object.entries(future.current?.anchors ?? {}))
          place("future-" + id, p.x, p.y);
        future.current?.adaptQuality(raw);
      } else if (room.current) {
        if (future.current) {
          future.current.dispose();
          future.current = null;
        }
        const roomState = {
          ...prefs,
          beat:
            verdict?.ripple?.phase === "echo"
              ? ("chair" as const)
              : verdict
                ? roomBeat(verdict)
                : ("explore" as const),
          focus: verdict?.ripple
            ? verdict.ripple.phase === "echo"
              ? "chair_insert"
              : verdict.ripple.phase === "change"
                ? "laptop"
                : "book"
            : verdict?.phase === "teacher_enter" && followDoorRef.current
              ? "door"
              : verdict
                ? (directedFocus(verdict, t) ?? f)
                : f,
          selected: verdict?.selected === "an",
        };
        room.current.setIntroduction(isClassroomIntro(state.beat));
        room.current.setEvaluation(
          isClassroomIntro(state.beat) ? initialClassroomCase : verdict,
        );
        const stay =
          verdict?.phase === "chapter02" ? (verdict.stayed ?? freshStay) : null;
        room.current.setRipple(verdict?.ripple ?? null);
        room.current.setFinale(verdict?.finale ?? null, current.current.letter);
        room.current.setStayed(
          verdict?.ripple?.phase === "echo"
            ? { ...freshStay, phase: "chair" }
            : stay,
        );
        if (room.current instanceof WorldRenderer)
          room.current.adaptQuality(raw);
        room.current.render(
          roomState,
          verdict?.ripple
            ? verdict.ripple.phase === "echo"
              ? Math.max(0, t - 0.1)
              : t
            : stay?.phase === "discussion"
              ? TEACHER_ENTRANCE.settled
              : stay?.phase === "chair"
                ? Math.max(0, t - 0.1)
                : verdict?.phase === "teacher_enter"
                  ? Math.max(0, t - TEACHER_ENTRANCE.lead)
                  : t,
          dt,
          elapsed.current,
          t,
        );
        const points = room.current.project();
        let edge = 0;
        const occupied: { x: number; y: number }[] = [];
        for (const point of points.filter((p) =>
          verdict
            ? (verdict.phase === "teacher_enter"
                ? ["door"]
                : ["notebook", "notes", "laptop"]
              ).includes(p.id)
            : false,
        )) {
          let x = point.x,
            y = point.y;
          if (!point.visible) {
            x = element.clientWidth - 35;
            y = 110 + edge++ * 58;
          }
          x = Math.max(32, Math.min(element.clientWidth - 32, x));
          y = Math.max(100, Math.min(element.clientHeight - 220, y));
          while (occupied.some((p) => Math.hypot(p.x - x, p.y - y) < 55)) {
            y -= 57;
            if (y < 100) {
              x = 35;
              y = 110 + edge++ * 58;
            }
          }
          occupied.push({ x, y });
          place(point.id, x, y);
        }
      }
      if (now - update > 100) {
        update = now;
        setTime(t);
      }
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      mounted = false;
      cancelAnimationFrame(frame.current);
      observer.disconnect();
      future.current?.dispose();
    };
  }, []);
  // Preload the physical room under black, before its first visible shot.
  useEffect(() => {
    if (
      ![
        "MEMORY_TRANSITION",
        "CLASSROOM_ESTABLISHING",
        "CLASSROOM_EXPLORATION",
        "LAPTOP_INVESTIGATION",
        "NEXT_SCENE_READY",
      ].includes(s.beat) ||
      room.current ||
      !roomCanvas.current ||
      !root.current
    )
      return;
    let target = roomCanvas.current;
    const makeFallback = () => {
      room.current?.dispose();
      const replacement = document.createElement("canvas");
      replacement.className = "world-canvas chapter-room";
      target.replaceWith(replacement);
      target = replacement;
      roomCanvas.current = replacement;
      room.current = new FallbackWorld(replacement);
      setFallback(true);
      room.current.resize(
        root.current!.clientWidth,
        root.current!.clientHeight,
      );
    };
    try {
      room.current = new WorldRenderer(target);
    } catch {
      makeFallback();
    }
    room.current?.resize(root.current.clientWidth, root.current.clientHeight);
    room.current?.focusOn(isClassroomIntro(s.beat) ? "wide" : focus, true);
    const lost = (e: Event) => {
      e.preventDefault();
      makeFallback();
    };
    target.addEventListener("webglcontextlost", lost);
    // Listener stays with this canvas for the lifetime of the room, across beats.
    // Disposing the renderer and detached canvas releases it on unmount.
  }, [s.beat]);
  useEffect(() => () => room.current?.dispose(), []);
  const verdictAct = (action: VerdictAction) => {
    if (paused || !v) return;
    lastAction.current = elapsed.current;
    setHintVisible(false);
    setInspection(null);
    if (action.type === "link") setFocus("laptop");
    if (action.type === "choose" || action.type === "prepare")
      audio.current?.cue("key");
    dispatch({ type: "verdict", action });
  };
  const stayAct = (action: StayAction) => {
    if (paused || !st) return;
    lastAction.current = elapsed.current;
    setHintVisible(false);
    if (action.type === "read") audio.current?.cue("paper");
    dispatch({
      type: "verdict",
      action: {
        type: "stay",
        action:
          action.type === "advance"
            ? { ...action, cue: action.cue ?? cueKey(st) }
            : action,
      },
    });
  };
  const finaleAct = (action: FinaleAction) => {
    if (paused || !fin) return;
    if (action.type === "write") setLetterSaved(saveLetter(letter));
    audio.current?.cue(
      action.type === "write" ||
        action.type === "commit" ||
        (action.type === "focus-memory" && action.id !== "chair")
        ? "paper"
        : "key",
    );
    dispatch({ type: "verdict", action: { type: "finale", action } });
  };
  const updateLetter = (v: Letter, composing = false) => {
    setLetter(composing ? v : normalizeLetter(v));
    if (!composing) setLetterSaved(saveLetter(normalizeLetter(v)));
  };
  const eraseLetter = () => {
    const removed = removeLetter();
    setLetter({ ...blankLetter, local: false });
    setLetterSaved(false);
    if (!removed)
      setStatus(
        "Chưa xóa được nội dung cục bộ. Hãy dùng phần dữ liệu trang trong trình duyệt.",
      );
  };
  const rippleAct = (action: RippleAction) => {
    if (paused || !rip) return;
    lastAction.current = elapsed.current;
    setHintVisible(false);
    if (
      action.type !== "lab2035" ||
      (action.action.type !== "tick" &&
        !(
          action.action.type === "code" && action.action.action.type === "tick"
        ))
    )
      audio.current?.cue(
        action.type === "question" ||
          action.type === "object" ||
          action.type === "memory"
          ? "paper"
          : "key",
      );
    dispatch({ type: "verdict", action: { type: "ripple", action } });
  };
  const inspectEvidence = (id: EvidenceId) => {
    if (paused || !v) return;
    lastAction.current = elapsed.current;
    setHintVisible(false);
    setInspection(id);
    setFocus(evidence[id].focus);
    audio.current?.cue(id === "data" ? "key" : "paper");
    dispatch({ type: "verdict", action: { type: "inspect", id } });
  };
  const toggleSound = async () => {
    const muted = !settings.muted;
    setSettings((p) => ({ ...p, muted }));
    if (!muted) {
      await ensureAudio();
      audio.current?.apply({ ...current.current.settings, muted: false });
      audio.current?.environment(roomActive ? 1 : 0);
      if (!roomActive)
        audio.current?.openingSpace(futurePlace(s.beat, clock.current));
      if (v?.phase === "reaction") audio.current?.beat("verdict");
      if (st) audio.current?.stayMix(st.phase);
      if (rip) audio.current?.rippleMix(rip.phase, rip.milestones);
      if (fin) audio.current?.finaleMix(fin.phase);
      if (roomActive && !rip) audio.current?.focus(focus);
    }
  };
  const resolveCaption = (at: number): string | null =>
    fin
      ? finaleCaption(fin, at)
      : rip
        ? rippleCaption(rip, at)
        : v
          ? verdictCaption(v, at, inspection)
          : introducing
            ? classroomIntroCue(at).text
            : (futureCaption(
                s.beat,
                s.beat === "SIGNAL_INVESTIGATION"
                  ? at - futureSelectedAt.current
                  : at,
                futureSelected,
                futureFound.length === 2,
              ) ?? chapterCaption(s.beat, at));
  captionAt.current = resolveCaption;
  // A newly selected phase must not inherit the previous phase's render time.
  const sceneTime =
    rip && rippleClockPhase.current !== rip.phase ? rip.elapsed : time;
  const caption = resolveCaption(sceneTime);
  const timePassage =
    rip && !fin ? rippleTimePassage(rip, sceneTime, settings.reduced) : null;
  const aion =
    rip && !fin && !timePassage ? aionCue(rip.phase, sceneTime) : undefined;
  const spokenCaption = aion
    ? caption
    : future.current?.ready
      ? openingNarration(s.beat, time)
      : null;
  const voice = useNarration(
    spokenCaption,
    audio.current,
    settings.voice !== false && !settings.muted && spokenCaption !== null,
    playbackPaused,
    settings.voice !== false,
    aion
      ? { file: aion.file, offset: sceneTime - aion.start }
      : s.beat === "OPENING_CINEMATIC"
        ? time
        : undefined,
    speed,
  );
  const black =
    s.beat === "OPENING_CINEMATIC"
      ? Math.max(0, 1 - time / 2.5)
      : s.beat === "MEMORY_TRANSITION"
        ? Math.min(1, time / 2)
        : s.beat === "CLASSROOM_ESTABLISHING"
          ? Math.max(0, 1 - time / 2)
          : 0;
  const markFocus = (value: boolean) => {
    if (focusSignal.current === value) return;
    focusSignal.current = value;
    future.current?.focusSignal(value);
    audio.current?.signalFocus(value);
  };
  return (
    <div
      ref={root}
      className={`cinematic chapter ${timePassage ? "ripple-passage-active" : ""} ${settings.reduced ? "motion-reduced" : ""} ${roomActive ? "in-classroom" : "future-opening"} ${roomActive && (!rip || ["sketch", "change", "echo"].includes(rip.phase)) ? "narrative-room" : ""}`}
      data-time-passage={timePassage?.chapter.year ?? ""}
      data-finale={fin?.phase ?? ""}
      data-completed={fin?.completed ?? false}
      data-ripple={rip?.phase ?? ""}
      style={
        rip?.phase === "chair"
          ? ({ "--chair-memory": chairMemoryGrade(sceneTime) } as CSSProperties)
          : undefined
      }
      data-chapter={s.beat}
      data-verdict={v?.phase}
      data-stayed={st?.phase}
      data-evidence={s.evidence.join(",")}
      data-focus={focus}
      data-conversation={
        !!st && ["discussion", "question", "second_chance"].includes(st.phase)
      }
      data-chair-moment={!rip && st?.phase === "chair"}
      onPointerMove={(e) => {
        if (paused) return;
        if (
          ["PLAYER_CONTROL_ENABLED", "SIGNAL_INVESTIGATION"].includes(s.beat)
        ) {
          future.current?.observe(
            (e.clientX / innerWidth - 0.5) * 2,
            (e.clientY / innerHeight - 0.5) * 2,
          );
          const p = future.current?.signal;
          if (p) markFocus(Math.hypot(e.clientX - p.x, e.clientY - p.y) < 100);
        } else if (
          v &&
          ["investigate", "choose", "result", "connect"].includes(v.phase)
        )
          room.current?.look(
            (e.clientX / innerWidth - 0.5) * 2,
            (e.clientY / innerHeight - 0.5) * 2,
          );
      }}
    >
      <canvas
        ref={futureCanvas}
        className="world-canvas chapter-future"
        aria-label="Thành phố, trụ sở và trung tâm trí tuệ AION năm 2046"
      />
      <canvas
        ref={roomCanvas}
        className="world-canvas chapter-room"
        aria-label={
          fin
            ? "Ký ức cuối, tờ giấy và ngân hà tri ân"
            : rip && !["sketch", "change", "echo"].includes(rip.phase)
              ? "Các phòng nghiên cứu 2029–2046"
              : "Phòng thực hành 17:05 năm 2026"
        }
      />
      <div
        className="chapter-black"
        style={{ opacity: black }}
        aria-hidden="true"
      />
      <div className="chapter-letterbox" aria-hidden="true" />
      <PlaybackControls
        muted={settings.muted}
        music={settings.music}
        onSound={toggleSound}
        onMusic={() => {
          setSettings((p) => ({ ...p, music: p.muted || !p.music }));
          if (settings.muted) void toggleSound();
          else if (!settings.music && audio.current)
            void audio.current
              .unlock()
              .catch(() => setStatus("Chạm nút âm thanh để mở lại tiếng."));
        }}
        onPause={() => setPaused(true)}
        speed={speed}
        onSpeed={setSpeed}
        onGuide={() => setGuideOpen(true)}
      />
      {guideOpen && (
        <GameGuide
          {...chapterGuide(s, futureView, futureFound.length)}
          onClose={() => setGuideOpen(false)}
        />
      )}
      {!paused && s.beat === "OPENING_CINEMATIC" && (
        <button
          className="chapter-skip"
          onClick={() => dispatch({ type: "skip" })}
        >
          Bỏ qua cinematic
        </button>
      )}
      {!paused && v && !st && (
        <VerdictControls
          state={v}
          inspect={inspectEvidence}
          act={verdictAct}
          anchor={(id, el) => {
            if (el) buttons.current.set(id, el);
            else buttons.current.delete(id);
          }}
          onHint={() => setHintVisible(true)}
          hint={hintVisible ? verdictHint(v) : ""}
        />
      )}
      {!paused && st && !rip && (
        <StayControls
          s={st}
          act={stayAct}
          hint={hintVisible}
          time={time}
          speed={speed}
          onSkip={() => setGuideOpen(true)}
        />
      )}
      {!paused && rip && !fin && (
        <RippleControls
          s={rip}
          act={rippleAct}
          hint={hintVisible}
          time={time}
          reduced={settings.reduced}
        />
      )}
      {!paused && fin && (
        <FinaleControls
          reducedMotion={settings.reduced}
          s={fin}
          act={finaleAct}
          letter={letter}
          update={updateLetter}
          persisted={letterSaved}
          erase={eraseLetter}
          onMenu={() => onMenu?.()}
          onReplay={() => onReplay?.()}
        />
      )}
      {!paused && rip?.phase === "finale" && !fin && (
        <button
          className="chapter-action"
          onClick={() =>
            dispatch({ type: "verdict", action: { type: "begin-finale" } })
          }
        >
          Chạm tờ giấy trắng
        </button>
      )}
      {!paused && !rip && st?.phase === "next" && st.nextInspected && (
        <button
          className="chapter-action"
          onClick={() =>
            dispatch({ type: "verdict", action: { type: "begin-ripple" } })
          }
        >
          Nối hai câu hỏi
        </button>
      )}
      {!paused &&
        v?.flow !== "screen-first" &&
        v?.phase === "teacher_enter" &&
        time < 4 && (
          <button
            className="world-hotspot"
            aria-label="Lắng nghe bước chân"
            ref={(el) => {
              if (el) buttons.current.set("door", el);
              else buttons.current.delete("door");
            }}
            onClick={() => {
              setFollowedDoor(true);
              audio.current?.focus("door");
            }}
          >
            <span className="hotspot-ring">♪</span>
            <span className="hotspot-name">Bước chân ngoài cửa</span>
          </button>
        )}
      {!paused &&
        v?.phase === "reaction" &&
        time >= (v.flow === "screen-first" ? 6 : 2) && (
          <button
            className="chapter-skip"
            onClick={() => verdictAct({ type: "settle" })}
          >
            Bỏ qua khoảng lặng
          </button>
        )}
      {!paused && st?.phase === "discussion" && st.line === 0 && time < 3 && (
        <span className="verdict-chapter-label">
          CHAPTER 02 · THE ONE WHO STAYED
        </span>
      )}
      {!paused && s.beat === "PLAYER_CONTROL_ENABLED" && (
        <button
          ref={(el) => {
            if (el) buttons.current.set("signal", el);
            else buttons.current.delete("signal");
          }}
          className="world-hotspot chapter-signal"
          aria-label="Khám phá tín hiệu"
          onFocus={() => markFocus(true)}
          onPointerEnter={() => markFocus(true)}
          onClick={() => dispatch({ type: "signal" })}
        >
          <span className="hotspot-ring">◈</span>
          <span className="hotspot-name">Ẩn số chưa có lời giải</span>
        </button>
      )}
      {!paused &&
        s.beat === "PLAYER_CONTROL_ENABLED" &&
        (futureView === "core" ? (
          <button
            className="world-hotspot future-node"
            aria-label="Nhìn về khu nghiên cứu"
            ref={(el) => {
              if (el) buttons.current.set("future-research", el);
              else buttons.current.delete("future-research");
            }}
            onClick={() => {
              setFutureView("atrium");
              audio.current?.chime("aion.research", 294);
            }}
          >
            <span className="hotspot-ring" />
            <span className="hotspot-name">Khu nghiên cứu</span>
          </button>
        ) : (
          <button
            className="chapter-return"
            onClick={() => setFutureView("core")}
          >
            Trở lại bàn đối chiếu →
          </button>
        ))}
      {!paused &&
        s.beat === "SIGNAL_INVESTIGATION" &&
        time > 1.5 &&
        (Object.keys(channels) as Channel[]).map((id) => (
          <button
            key={id}
            className={`world-hotspot future-node ${futureFound.includes(id) ? "checked" : ""}`}
            aria-label={channels[id].label}
            aria-pressed={futureFound.includes(id)}
            ref={(el) => {
              if (el) buttons.current.set("future-" + id, el);
              else buttons.current.delete("future-" + id);
            }}
            onClick={() => {
              futureSelectedAt.current = clock.current;
              setFutureSelected(id);
              setFutureFound((v) => [...new Set([...v, id])]);
              audio.current?.chime(
                "aion.inspect." + id,
                id === "source" ? 392 : 294,
              );
            }}
          >
            <span className="hotspot-ring" />
            <span className="hotspot-name">{channels[id].short}</span>
          </button>
        ))}
      {!paused &&
        s.beat === "SIGNAL_INVESTIGATION" &&
        time > 1.5 &&
        futureFound.length === 2 && (
          <button
            className="future-open"
            ref={(el) => {
              if (el) buttons.current.set("future-open", el);
              else buttons.current.delete("future-open");
            }}
            onClick={() => dispatch({ type: "open" })}
          >
            Chạm để mở hồ sơ 2026 ↗
          </button>
        )}
      {!paused &&
        (settings.captions ||
          introducing ||
          (v?.flow === "screen-first" &&
            ["reaction", "teacher_enter"].includes(v.phase)) ||
          (st?.interactive && !rip)) &&
        caption && (
          <Subtitle
            text={caption}
            speaker={
              s.beat === "OPENING_CINEMATIC"
                ? narration.find(
                    (line) => time >= line.start && time < line.end,
                  )?.speaker
                : undefined
            }
          />
        )}
      {voice.status === "unavailable" &&
        settings.voice !== false &&
        !settings.muted && (
          <p className="runtime-status" role="status">
            Chưa tải được lời dẫn. Bạn vẫn có thể đọc phụ đề; bật lại lời dẫn để
            thử lại.
          </p>
        )}
      {(status || !saved || fallback) && (
        <p className="runtime-status">
          {status}
          {!saved ? " Tiến trình chỉ lưu trong phiên này." : ""}
          {fallback ? " Đồ họa 2D." : ""}
        </p>
      )}
      {paused && (
        <div
          className="pause-screen"
          role="dialog"
          aria-modal="true"
          aria-label="Tạm dừng"
          onKeyDown={(e) => {
            if (e.key === "Tab") {
              const els =
                e.currentTarget.querySelectorAll<HTMLElement>("button,input");
              if (e.shiftKey && document.activeElement === els[0]) {
                e.preventDefault();
                els[els.length - 1]?.focus();
              } else if (
                !e.shiftKey &&
                document.activeElement === els[els.length - 1]
              ) {
                e.preventDefault();
                els[0]?.focus();
              }
            }
          }}
        >
          <h2>Khoảnh khắc đang chờ.</h2>
          <button
            autoFocus
            className="enter-game"
            onClick={() => setPaused(false)}
          >
            Tiếp tục quan sát
          </button>
          <div className="options">
            <label>
              Âm lượng
              <input
                aria-label="Âm lượng"
                type="range"
                min="0"
                max="1"
                step=".05"
                value={settings.volume}
                onChange={(e) =>
                  setSettings((p) => ({ ...p, volume: Number(e.target.value) }))
                }
              />
            </label>
            {(
              [
                ["captions", "Phụ đề"],
                ["voice", "Giọng dẫn và AION"],
                ["reduced", "Giảm chuyển động"],
                ["music", "Nhạc lo-fi"],
                ["sfx", "Âm môi trường và đồ vật"],
              ] as const
            ).map(([key, label]) => (
              <label key={key}>
                <input
                  type="checkbox"
                  checked={
                    key === "voice" ? settings.voice !== false : settings[key]
                  }
                  onChange={(e) =>
                    setSettings((p) => ({ ...p, [key]: e.target.checked }))
                  }
                />
                {label}
              </label>
            ))}
          </div>
          <p>Tiến trình lưu trên thiết bị. Esc để quay lại.</p>
        </div>
      )}
      <output hidden data-testid="chapter-telemetry">
        {JSON.stringify({
          beat: s.beat,
          time,
          evidence: s.evidence,
          verdict: v,
          stayed: st,
          ripple: rip,
          finale: fin,
          followedDoor,
          world: roomActive
            ? room.current?.snapshot()
            : future.current?.snapshot(),
          voice: voice.player.current?.snapshot() ?? null,
          audio: audio.current
            ? {
                context: audio.current.context.state,
                events: audio.current.events,
                mix: audio.current.mix,
                buses: {
                  music: audio.current.music.gain.value,
                  effects: audio.current.foley.gain.value,
                  ambience: audio.current.ambience.gain.value,
                },
              }
            : null,
        })}
      </output>
    </div>
  );
}
