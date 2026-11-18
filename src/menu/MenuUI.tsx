import {
  useEffect,
  useRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import type { Preferences } from "./preferences";

export function Icon({
  name,
}: {
  name: "play" | "folder" | "settings" | "about" | "sound" | "mute" | "close";
}) {
  const paths = {
    play: "m9 5 11 7-11 7Z",
    folder: "M3 7V5h7l2 3h9v12H3Zm0 3h18",
    settings:
      "m10 3-.5 3-2 1-3-.5-2 4 2.5 2v2L3 17l2 4 3-1 2 1 1 2h4l1-3 2-1 3 .5 2-4-2.5-2v-2L23 9l-2-4-3 1-2-1-1-2Zm7 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
    about: "M12 8v.1M12 11v6M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
    sound: "M3 9h4l5-4v14l-5-4H3ZM16 8q4 4 0 8m3-11q7 7 0 14",
    mute: "M3 9h4l5-4v14l-5-4H3Zm13 0 6 6m0-6-6 6",
    close: "m6 6 12 12M6 18 18 6",
  };
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 26 26"
      fill={name === "play" ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}

export function GameLogo() {
  return (
    <div className="menu-logo">
      <span className="menu-eyebrow">MỘT CÂU CHUYỆN VỀ NHỮNG ĐIỀU Ở LẠI</span>
      <h1 aria-label="The Unwritten Lesson">
        <span>The</span>
        <span>Unwritten</span>
        <em>Lesson</em>
      </h1>
      <svg
        className="menu-paper-plane"
        viewBox="0 0 110 62"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="m6 22 93-15-40 44-8-22L6 22Zm45 7L99 7 43 23m16 28 8-17"
          stroke="currentColor"
        />
        <path
          d="M47 45Q8 73 3 42"
          stroke="currentColor"
          strokeOpacity=".3"
          strokeDasharray="2 4"
        />
      </svg>
      <p>
        Có những bài học
        <br className="menu-mobile-break" /> không nằm trong sách vở.
      </p>
    </div>
  );
}

export function MenuButton({
  icon,
  primary,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: Parameters<typeof Icon>[0]["name"];
  primary?: boolean;
}) {
  return (
    <button
      {...props}
      className={`menu-button ${primary ? "menu-primary" : ""}`}
    >
      <Icon name={icon} />
      <span>{children}</span>
      <span className="menu-arrow" aria-hidden="true">
        ↗
      </span>
    </button>
  );
}

export function AudioControls({
  preferences,
  onChange,
}: {
  preferences: Preferences;
  onChange: (patch: Partial<Preferences>) => void;
}) {
  return (
    <>
      <button
        className="menu-tool"
        aria-label={preferences.muted ? "Bật âm thanh" : "Tắt âm thanh"}
        aria-pressed={!preferences.muted}
        onClick={() => onChange({ muted: !preferences.muted })}
      >
        <Icon name={preferences.muted ? "mute" : "sound"} />
      </button>
      <button
        className="menu-tool menu-cc"
        aria-label="Phụ đề"
        aria-pressed={preferences.captions}
        onClick={() => onChange({ captions: !preferences.captions })}
      >
        CC
      </button>
    </>
  );
}

export function LanguageSelector() {
  return (
    <label className="menu-language">
      <span className="menu-sr-only">Ngôn ngữ</span>
      <select aria-label="Ngôn ngữ" defaultValue="vi">
        <option value="vi">VI</option>
        <option value="en" disabled>
          EN — Chưa có bản dịch
        </option>
      </select>
    </label>
  );
}

export function MenuDialog({
  title,
  eyebrow = "THE UNWRITTEN LESSON",
  onClose,
  children,
}: {
  title: string;
  eyebrow?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.showModal();
    const element = dialog.current;
    return () => {
      element?.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      className="menu-dialog"
      ref={dialog}
      aria-labelledby="menu-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="menu-dialog-inner">
        <div className="menu-dialog-heading">
          <div>
            <span className="menu-eyebrow">{eyebrow}</span>
            <h2 id="menu-dialog-title">{title}</h2>
          </div>
          <button
            className="menu-tool"
            aria-label="Đóng"
            onClick={onClose}
            autoFocus
          >
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}

export function SettingsModal({
  preferences,
  onChange,
  onClose,
}: {
  preferences: Preferences;
  onChange: (patch: Partial<Preferences>) => void;
  onClose: () => void;
}) {
  return (
    <MenuDialog title="Cài đặt" onClose={onClose}>
      <p className="menu-dialog-note">
        Một không gian vừa với bạn. Tùy chọn được lưu trên thiết bị này.
      </p>
      {(["music", "effects"] as const).map((key) => (
        <div className="menu-setting" key={key}>
          <label htmlFor={`menu-${key}`}>
            {key === "music" ? "Âm lượng nhạc" : "Âm lượng hiệu ứng"}
            <span aria-hidden="true">
              {Math.round(preferences[key] * 100)}%
            </span>
          </label>
          <input
            id={`menu-${key}`}
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={preferences[key]}
            aria-valuetext={`${Math.round(preferences[key] * 100)}%`}
            onChange={(e) => onChange({ [key]: Number(e.target.value) })}
          />
        </div>
      ))}
      {(
        [
          { key: "muted", label: "Tắt âm thanh" },
          { key: "captions", label: "Hiển thị phụ đề" },
          { key: "voice", label: "Giọng dẫn và AION" },
          { key: "reduced", label: "Giảm chuyển động" },
        ] as const
      ).map(({ key, label }) => (
        <label className="menu-toggle" key={key}>
          <span>{label}</span>
          <input
            type="checkbox"
            checked={
              key === "voice" ? preferences.voice !== false : preferences[key]
            }
            onChange={(e) => onChange({ [key]: e.target.checked })}
          />
        </label>
      ))}
      <label className="menu-toggle">
        <span>Đồ họa môi trường menu</span>
        <select
          value={preferences.quality}
          onChange={(e) =>
            onChange({ quality: e.target.value as Preferences["quality"] })
          }
        >
          <option value="auto">Tự động</option>
          <option value="low">Thấp</option>
          <option value="high">Cao</option>
        </select>
      </label>
      <div className="menu-toggle">
        <span>Ngôn ngữ</span>
        <LanguageSelector />
      </div>
      <p className="menu-dialog-note">
        Tiếng Việt · Bản tiếng Anh đang được chuẩn bị.
        <br />
        Thiết lập giảm chuyển động của hệ điều hành luôn được tôn trọng.
      </p>
      <button className="menu-dialog-done" onClick={onClose}>
        Trở về khung cửa
      </button>
    </MenuDialog>
  );
}

export function SaveGameStatus({ available }: { available: boolean }) {
  return (
    <p className="menu-save-status">
      {available
        ? "Tiến trình đã lưu · Sẵn sàng trở lại câu chuyện"
        : "Một trang giấy mới đang chờ bạn"}
    </p>
  );
}

export function CinematicTransition({ active }: { active: boolean }) {
  return (
    <div
      className={`menu-transition ${active ? "is-active" : ""}`}
      aria-hidden="true"
    >
      <span>THE UNWRITTEN LESSON</span>
    </div>
  );
}
