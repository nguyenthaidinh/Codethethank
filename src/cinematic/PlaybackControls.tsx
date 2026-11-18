import { useEffect, useRef, useState } from "react";
import { PauseIcon, SoundIcon } from "./SceneChrome";

const playbackSpeeds = [1, 2, 3] as const;
export type PlaybackSpeed = (typeof playbackSpeeds)[number];

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element;
  webkitExitFullscreen?: () => void;
};
type FullscreenRoot = HTMLElement & { webkitRequestFullscreen?: () => void };

function fullscreenElement() {
  return (
    document.fullscreenElement ??
    (document as FullscreenDocument).webkitFullscreenElement
  );
}

function exitFullscreen() {
  if (document.exitFullscreen) return document.exitFullscreen();
  return (document as FullscreenDocument).webkitExitFullscreen?.();
}

export function PlaybackControls({
  muted,
  music,
  onSound,
  onMusic,
  onPause,
  speed,
  onSpeed,
  onGuide,
}: {
  muted: boolean;
  music: boolean;
  onSound: () => void;
  onMusic: () => void;
  onPause: () => void;
  speed: PlaybackSpeed;
  onSpeed: (speed: PlaybackSpeed) => void;
  onGuide: () => void;
}) {
  const [expanded, setExpanded] = useState(() => Boolean(fullscreenElement()));
  const [notice, setNotice] = useState("");
  const requested = useRef(false);
  useEffect(() => {
    const sync = () => {
      setExpanded(Boolean(fullscreenElement()));
      if (!fullscreenElement()) requested.current = false;
    };
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
      if (requested.current && fullscreenElement())
        void Promise.resolve(exitFullscreen()).catch(() => {});
    };
  }, []);
  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(""), 4200);
    return () => window.clearTimeout(id);
  }, [notice]);
  const toggleFullscreen = async () => {
    setNotice("");
    const root = document.documentElement as FullscreenRoot;
    try {
      if (fullscreenElement()) await exitFullscreen();
      else if (root.requestFullscreen || root.webkitRequestFullscreen) {
        requested.current = true;
        if (root.requestFullscreen) await root.requestFullscreen();
        else root.webkitRequestFullscreen?.();
      } else
        setNotice("Trình duyệt này chưa hỗ trợ toàn màn hình cho trò chơi.");
    } catch {
      requested.current = false;
      setNotice("Trình duyệt chưa cho phép mở toàn màn hình.");
    }
  };
  const fullLabel = expanded ? "Thoát toàn màn hình" : "Mở toàn màn hình";
  const soundLabel = muted ? "Bật âm thanh" : "Tắt âm thanh";
  const musicOn = music && !muted;
  const musicLabel = musicOn ? "Tắt nhạc lo-fi" : "Bật nhạc lo-fi";
  return (
    <div className="minimal-controls">
      <button
        type="button"
        onClick={toggleFullscreen}
        title={fullLabel}
        aria-label={fullLabel}
        aria-pressed={expanded}
      >
        <svg
          viewBox="0 0 24 24"
          width="19"
          height="19"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path
            d={
              expanded
                ? "M3 8h5V3m13 5h-5V3M3 16h5v5m13-5h-5v5"
                : "M3 9V4h5m8 0h5v5M3 15v5h5m8 0h5v-5"
            }
          />
        </svg>
      </button>
      <button
        type="button"
        onClick={onMusic}
        title={musicLabel}
        aria-label={musicLabel}
        aria-pressed={musicOn}
      >
        <svg
          viewBox="0 0 24 24"
          width="19"
          height="19"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 17V6l11-3v12M9 9l11-3" />
          <ellipse cx="6" cy="17.5" rx="3" ry="2.4" />
          <ellipse cx="17" cy="15.5" rx="3" ry="2.4" />
          {!musicOn && <path d="m3 3 18 18" />}
        </svg>
      </button>
      <button
        type="button"
        onClick={onSound}
        title={soundLabel}
        aria-label={soundLabel}
      >
        <SoundIcon muted={muted} />
      </button>
      <button
        type="button"
        onClick={onPause}
        title="Tạm dừng"
        aria-label="Tạm dừng"
      >
        <PauseIcon />
      </button>
      <div className="playback-options">
        <div
          className="playback-rates"
          role="group"
          aria-label="Tốc độ trò chơi"
        >
          {playbackSpeeds.map((rate) => (
            <button
              key={rate}
              type="button"
              aria-pressed={rate === speed}
              onClick={() => onSpeed(rate)}
            >
              ×{rate}
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-haspopup="dialog"
          aria-label="Tóm tắt & hướng dẫn"
          onClick={onGuide}
        >
          Hướng dẫn
        </button>
      </div>
      {notice && (
        <span className="playback-notice" role="status">
          {notice}
        </span>
      )}
    </div>
  );
}
