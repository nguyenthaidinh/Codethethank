import { useEffect, useRef, useState } from "react";
import { createLanternArt } from "./tribute-lantern";

import { useLiveWishes } from "./useLiveWishes";

export function TributeCelebration() {
  const { wishes, status } = useLiveWishes();
  const canvas = useRef<HTMLCanvasElement>(null);
  const music = useRef<HTMLAudioElement>(null);
  const [sound, setSound] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const audio = music.current;
    let disposed = false;
    if (audio) {
      audio.volume = 0.65;
      if (!document.hidden) {
        void audio
          .play()
          .then(() => {
            if (disposed || document.hidden) {
              audio.pause();
              return;
            }
            setSound(!audio.paused);
            setNotice("");
          })
          .catch((error: unknown) => {
            if (
              disposed ||
              (error instanceof DOMException && error.name === "AbortError")
            )
              return;
            setSound(false);
            setNotice(
              "Trình duyệt chưa cho phép tự phát. Bấm bật nhạc để nghe.",
            );
          });
      }
    }
    const hide = () => {
      if (document.hidden) {
        audio?.pause();
        setSound(false);
      }
    };
    document.addEventListener("visibilitychange", hide);
    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", hide);
      audio?.pause();
    };
  }, []);
  useEffect(() => {
    const el = canvas.current,
      ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const lantern = createLanternArt();
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0,
      last = 0,
      clock = 0;
    let width = 0,
      height = 0;
    const resize = () => {
      width = innerWidth;
      height = innerHeight;
      const dpr = Math.min(devicePixelRatio, 1.5);
      el.width = width * dpr;
      el.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      if (document.hidden || now - last < 33) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!reduced.matches) clock += dt;
      ctx.clearRect(0, 0, width, height);
      if (lantern)
        for (let i = 0; i < 16; i++) {
          const side = i % 2;
          const x =
            width * (side ? 0.79 + (i % 7) * 0.027 : 0.025 + (i % 7) * 0.027);
          const y = height * (1.15 - ((i * 0.173 + clock * 0.025) % 1.35));
          const size = Math.max(25, width * (0.027 + (i % 3) * 0.006));
          ctx.globalAlpha = 0.65;
          ctx.drawImage(
            lantern,
            x + Math.sin(clock + i) * 8 - size,
            y - size,
            size * 2,
            size * 2.3,
          );
        }
      ctx.globalAlpha = 1;
      if (!reduced.matches)
        for (let burst = 0; burst < 4; burst++) {
          const age = (clock + burst * 1.17) % 4.8;
          if (age > 2.1) continue;
          const cx = width * (burst % 2 ? 0.87 : 0.13),
            cy = height * (0.18 + (burst % 3) * 0.22);
          ctx.globalAlpha = Math.max(0, 1 - age / 2.1);
          ctx.strokeStyle = burst % 2 ? "#a4e5ee" : "#f4c887";
          ctx.lineWidth = 1.3;
          for (let ray = 0; ray < 28; ray++) {
            const angle = (ray * Math.PI * 2) / 28;
            const radius = age * Math.min(width * 0.075, 110);
            ctx.beginPath();
            ctx.moveTo(
              cx + Math.cos(angle) * radius * 0.87,
              cy + Math.sin(angle) * radius * 0.87 + age * age * 16,
            );
            ctx.lineTo(
              cx + Math.cos(angle) * radius,
              cy + Math.sin(angle) * radius + age * age * 16,
            );
            ctx.stroke();
            ctx.fillStyle = burst % 2 ? "#d5f8ff" : "#ffe3aa";
            ctx.beginPath();
            ctx.arc(
              cx + Math.cos(angle) * radius,
              cy + Math.sin(angle) * radius + age * age * 16,
              1.8 * (1 - age / 2.5),
              0,
              Math.PI * 2,
            );
            ctx.fill();
          }
        }
      ctx.globalAlpha = 1;
    };
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return (
    <>
      <canvas ref={canvas} className="game-tribute-sky" aria-hidden="true" />
      <aside
        className="game-tribute-wishes"
        aria-label="Lời chúc công khai từ Live Wall"
      >
        {wishes.map((wish, index) => (
          <div
            key={wish.id}
            className={`game-tribute-wish side-${index % 2}`}
            style={{ animationDelay: `${-8 - index * 3.2}s` }}
          >
            <span aria-hidden="true">✦</span>
            <p title={wish.message}>{wish.message}</p>
            <small>
              Gửi {wish.recipient}
              {wish.display_name ? ` · ${wish.display_name}` : ""}
            </small>
          </div>
        ))}
      </aside>
      <p className="game-live-wish-status" role="status">
        {status}
      </p>
      <audio
        ref={music}
        src={`${import.meta.env.BASE_URL}audio/tribute/thank-you.m4a?v=1794936859859`}
        loop
        preload="metadata"
      />
      <div className="game-tribute-sound">
        <button
          onClick={async () => {
            if (!music.current) return;
            if (sound) {
              music.current.pause();
              setSound(false);
              return;
            }
            try {
              await music.current.play();
              setSound(true);
              setNotice("");
            } catch {
              setNotice("Chưa phát được nhạc. Bấm để thử lại.");
            }
          }}
        >
          {sound ? "Tắt nhạc" : "Bật nhạc tri ân"}
        </button>
        <span role="status">{notice}</span>
      </div>
    </>
  );
}
