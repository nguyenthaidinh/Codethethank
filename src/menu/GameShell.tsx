import { Component, lazy, Suspense, useState, type ReactNode } from "react";
import { freshSlice, type SliceSave } from "../cinematic/director";
import { defaultPreferences } from "./preferences";
import type { Preferences } from "./preferences";
import MainMenu from "./MainMenu";

const loadGame = () => import("../cinematic/CinematicGame");
const CinematicGame = lazy(loadGame);
const loadChapter = () => import("../chapter/ChapterGame");
const ChapterGame = lazy(loadChapter);
const loadAudio = () => import("./GameAudio");

class GameBoundary extends Component<
  { children: ReactNode; onBack: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="menu-load-state" role="alert">
        <h1>Phân cảnh chưa sẵn sàng.</h1>
        <p>Hãy trở về menu và thử lại.</p>
        <button
          onClick={() => {
            this.setState({ failed: false });
            this.props.onBack();
          }}
        >
          Trở về menu
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}

export default function GameShell() {
  const [run, setRun] = useState(0);
  const [launch, setLaunch] = useState<{
    save: SliceSave;
    preferences: Preferences;
  } | null>(null);
  const [audioModule, setAudioModule] = useState<Awaited<
    ReturnType<typeof loadAudio>
  > | null>(null);
  // Existing QA/recording routes remain available to the other concurrent workstream.
  const direct =
    new URLSearchParams(location.search).has("qa") ||
    new URLSearchParams(location.search).has("record");
  const chapterDirect = new URLSearchParams(location.search).has("chapter");
  const preload = async () => {
    const [, audio] = await Promise.all([
      Promise.all([loadGame(), loadChapter()]),
      loadAudio(),
    ]);
    setAudioModule(audio);
  };
  return (
    <GameBoundary key={launch ? "game" : "menu"} onBack={() => setLaunch(null)}>
      {launch || direct || chapterDirect ? (
        <Suspense
          fallback={
            <div className="menu-load-state" role="status">
              THE UNWRITTEN LESSON · Đang mở câu chuyện…
            </div>
          }
        >
          {direct ? (
            <CinematicGame
              initialSave={launch?.save}
              autoStart={!!launch}
              createAudio={
                launch && audioModule
                  ? () => new audioModule.GameAudio(launch.preferences)
                  : undefined
              }
            />
          ) : (
            <ChapterGame
              key={run}
              onMenu={() => {
                history.replaceState(null, "", location.pathname);
                setLaunch(null);
                setRun((n) => n + 1);
              }}
              onReplay={() => {
                history.replaceState(null, "", location.pathname);
                const preferences = launch?.preferences ?? defaultPreferences;
                setLaunch({
                  save: {
                    ...freshSlice,
                    muted: preferences.muted,
                    captions: preferences.captions,
                    voice: preferences.voice ?? true,
                    reduced: preferences.reduced,
                  },
                  preferences,
                });
                setRun((n) => n + 1);
              }}
              initialSave={launch?.save}
              audioLevels={launch?.preferences}
              createAudio={
                launch && audioModule
                  ? () => new audioModule.GameAudio(launch.preferences)
                  : undefined
              }
            />
          )}
          {launch && (
            <div
              className={`menu-game-reveal ${launch.save.reduced ? "is-instant" : ""}`}
              aria-hidden="true"
            />
          )}
        </Suspense>
      ) : (
        <MainMenu
          preload={preload}
          onLaunch={(save, preferences) => setLaunch({ save, preferences })}
        />
      )}
    </GameBoundary>
  );
}
