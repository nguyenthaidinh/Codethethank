import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { SliceSave } from "../cinematic/director";
import { MenuAudio } from "./MenuAudio";
import {
  AudioControls,
  CinematicTransition,
  GameLogo,
  LanguageSelector,
  MenuButton,
  MenuDialog,
  SaveGameStatus,
  SettingsModal,
} from "./MenuUI";
import {
  PREFERENCES_KEY,
  readPreferences,
  type Preferences,
} from "./preferences";
import { prepareLaunch, readCheckpoint } from "./saveBridge";
import "./menu.css";

const SceneBackground = lazy(() => import("./SceneBackground"));
export default function MainMenu({
  onLaunch,
  preload,
}: {
  onLaunch: (save: SliceSave, preferences: Preferences) => void;
  preload: () => Promise<unknown>;
}) {
  const [preferences, setPreferences] = useState(readPreferences);
  const [checkpoint, setCheckpoint] = useState(readCheckpoint);
  const [dialog, setDialog] = useState<"settings" | "about" | "restart" | null>(
    null,
  );
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState("");
  const [storageError, setStorageError] = useState(false);
  const [systemReduced, setSystemReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const audio = useRef<MenuAudio | null>(null);
  const active = useRef(true);
  const launchLock = useRef(false);
  useEffect(() => {
    active.current = true;
    audio.current = new MenuAudio(preferences);
    const refresh = () => setCheckpoint(readCheckpoint());
    const visibility = () => audio.current?.visibility(document.hidden);
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const motion = () => setSystemReduced(media.matches);
    media.addEventListener("change", motion);
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      active.current = false;
      audio.current?.dispose();
      media.removeEventListener("change", motion);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  useEffect(() => {
    audio.current?.apply(preferences);
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [preferences]);
  const update = (patch: Partial<Preferences>) => {
    const next = { ...preferences, ...patch };
    setPreferences(next);
    audio.current?.apply(next);
    if (!next.muted)
      void audio.current
        ?.unlock()
        .catch(() =>
          setError("Không thể mở âm thanh. Bạn vẫn có thể chơi với phụ đề."),
        );
  };
  const launch = async (resume: boolean) => {
    if (launchLock.current) return;
    const saved = resume ? readCheckpoint() : null;
    if (resume && !saved) {
      setCheckpoint(null);
      setError("Tiến trình không còn khả dụng. Hãy bắt đầu hành trình mới.");
      return;
    }
    launchLock.current = true;
    setDialog(null);
    setLeaving(true);
    setError("");
    audio.current?.cue("transition");
    try {
      await Promise.all([
        preload(),
        new Promise((resolve) =>
          setTimeout(
            resolve,
            systemReduced || preferences.reduced ? 100 : 1150,
          ),
        ),
      ]);
      if (!active.current) return;
      audio.current?.dispose();
      onLaunch(prepareLaunch(saved, preferences), preferences);
    } catch {
      if (!active.current) return;
      launchLock.current = false;
      setLeaving(false);
      setError("Chưa tải được phân cảnh. Kiểm tra kết nối rồi thử lại.");
    }
  };
  const startJourney = () => {
    audio.current?.cue("click");
    if (checkpoint) setDialog("restart");
    else void launch(false);
  };
  const reduced = preferences.reduced || systemReduced;
  const low =
    preferences.quality === "low" ||
    (preferences.quality === "auto" &&
      (navigator.hardwareConcurrency <= 4 ||
        matchMedia("(max-width: 600px)").matches));
  const hover = () => audio.current?.cue("hover");
  const unlockSavedAudio = () => {
    if (!preferences.muted && !leaving) {
      void audio.current?.unlock().catch(() => {
        if (active.current)
          setError("Không thể mở âm thanh. Bạn vẫn có thể chơi với phụ đề.");
      });
    }
  };
  return (
    <main
      className={`main-menu ${leaving ? "is-leaving" : ""} ${reduced ? "reduce-motion" : ""}`}
      aria-busy={leaving}
      onPointerDown={unlockSavedAudio}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") unlockSavedAudio();
      }}
    >
      <Suspense
        fallback={
          <div className="menu-scene-loading" role="status">
            Đang mở khung cửa…
          </div>
        }
      >
        <SceneBackground reduced={reduced} low={low} />
      </Suspense>
      <div className="menu-overlay" />
      <header className="menu-header">
        <span className="menu-edition">
          AN INTERACTIVE NARRATIVE<span>THE UNWRITTEN LESSON</span>
        </span>
        <div className="menu-tools" inert={leaving}>
          <AudioControls preferences={preferences} onChange={update} />
          <LanguageSelector />
        </div>
      </header>
      <section className="menu-content" inert={leaving}>
        <GameLogo />
        <nav className="menu-navigation" aria-label="Menu chính">
          <MenuButton
            primary
            icon="play"
            onPointerEnter={hover}
            onFocus={hover}
            onClick={startJourney}
          >
            Bắt đầu hành trình
          </MenuButton>
          <MenuButton
            icon="folder"
            disabled={!checkpoint}
            onPointerEnter={hover}
            onFocus={hover}
            onClick={() => void launch(true)}
          >
            Tiếp tục
          </MenuButton>
          <MenuButton
            icon="settings"
            onPointerEnter={hover}
            onFocus={hover}
            onClick={() => setDialog("settings")}
          >
            Cài đặt
          </MenuButton>
          <MenuButton
            icon="about"
            onPointerEnter={hover}
            onFocus={hover}
            onClick={() => setDialog("about")}
          >
            Giới thiệu
          </MenuButton>
        </nav>
        <SaveGameStatus available={!!checkpoint} />
      </section>
      <aside className="menu-world-caption" aria-hidden="true">
        <span>2046</span>
        <i />
        <p>
          Ngày mai bắt đầu
          <br />
          từ một điều rất nhỏ.
        </p>
      </aside>
      <footer className="menu-footer">
        <span>MỘT KHUNG CỬA. HAI MƯƠI NĂM.</span>
        <span>
          <i />
          v1.0.0
        </span>
      </footer>
      {(error || storageError) && (
        <p className="menu-error" role="status">
          {error ||
            "Không thể lưu trên thiết bị này. Bạn vẫn có thể chơi trong phiên hiện tại."}
        </p>
      )}
      <CinematicTransition active={leaving} />
      {dialog === "settings" && (
        <SettingsModal
          preferences={preferences}
          onChange={update}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === "about" && (
        <MenuDialog
          eyebrow="20/11 · NGÀY NHÀ GIÁO VIỆT NAM"
          title="Có người đã ở lại."
          onClose={() => setDialog(null)}
        >
          <p>
            Một buổi chiều năm 2026, khi An còn loay hoay trước một phép thử
            thất bại, cô Vân kéo ghế ngồi xuống bên cậu. Hai mươi năm sau,
            cuốn sổ trên bàn vẫn giữ dấu vết của buổi trò chuyện ấy.
          </p>
          <p className="menu-about-dedication">
            Xin gửi câu chuyện này đến những thầy cô đã kiên nhẫn lắng nghe
            và cho chúng ta cơ hội thử lại, ngay cả khi ta đã muốn bỏ cuộc.
          </p>
          <p className="menu-dialog-note">
            Nhấp hoặc chạm để khám phá. Dùng Tab và Enter để chọn, Esc để tạm dừng.
          </p>
          <button className="menu-dialog-done" onClick={startJourney}>
            Bắt đầu hành trình
          </button>
        </MenuDialog>
      )}
      {dialog === "restart" && (
        <MenuDialog title="Mở một trang mới?" onClose={() => setDialog(null)}>
          <p>Bắt đầu lại sẽ thay thế tiến trình hiện tại trên thiết bị này.</p>
          <button
            className="menu-dialog-done"
            onClick={() => void launch(false)}
          >
            Bắt đầu lại
          </button>
          <button
            className="menu-dialog-cancel"
            onClick={() => setDialog(null)}
          >
            Giữ lại hành trình
          </button>
        </MenuDialog>
      )}
    </main>
  );
}
