import { useEffect, useRef } from "react";

const displays = [
  { x: 0.54, y: 0.14, offset: 0, color: "244,202,128", size: 0.8 },
  { x: 0.72, y: 0.12, offset: 2.1, color: "164,210,211", size: 0.7 },
  { x: 0.89, y: 0.16, offset: 4.6, color: "236,184,149", size: 0.65 },
  { x: 0.61, y: 0.19, offset: 6.8, color: "245,218,159", size: 0.8 },
];

/** A bounded, deterministic particle display. No audio, network, timers or global renderer state. */
export function EndingFireworks({ enabled }: { enabled: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const context = element.getContext("2d", { alpha: true });
    if (!context) return;
    let width = 0,
      height = 0,
      frame = 0,
      previous = 0,
      time = 0,
      frames = 0;
    const resize = () => {
      const bounds = element.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      const ratio = Math.min(devicePixelRatio || 1, 1.5);
      element.width = Math.round(width * ratio);
      element.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();
    const dot = (
      x: number,
      y: number,
      radius: number,
      color: string,
      alpha: number,
    ) => {
      context.fillStyle = `rgba(${color},${Math.max(0, alpha)})`;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    };
    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      if (now - previous < 1000 / 30) return;
      const dt = previous ? Math.min((now - previous) / 1000, 0.08) : 0;
      previous = now;
      time += dt;
      context.clearRect(0, 0, width, height);
      const scale = Math.min(width * 0.105, height * 0.19, 150);
      for (const [index, display] of displays.entries()) {
        const age = (time + display.offset) % 10;
        const cx = width * display.x,
          cy = height * display.y;
        if (age < 2.2) {
          const flight = (t: number) => {
            const progress = Math.max(0, t) / 2.2;
            return {
              x: cx + (1 - progress) * width * (index % 2 ? 0.045 : -0.045),
              y:
                height * 0.96 +
                (cy - height * 0.96) * (1 - (1 - progress) ** 1.35),
            };
          };
          const head = flight(age);
          for (let trail = 23; trail >= 0; trail--) {
            const point = flight(age - trail * 0.018);
            dot(point.x, point.y, 1.25, display.color, (1 - trail / 24) * 0.8);
            if (trail % 3 === 0)
              dot(
                point.x + Math.sin(trail * 3 + time * 9) * 3,
                point.y + trail,
                0.8,
                display.color,
                0.45 * (1 - trail / 24),
              );
          }
          dot(head.x, head.y, 11, display.color, 0.045);
          dot(head.x, head.y, 5, display.color, 0.18);
          dot(head.x, head.y, 2.1, "255,244,213", 1);
        } else if (age < 6.2) {
          const life = age - 2.2;
          const alpha = Math.min(1, life * 5) * (1 - life / 4) ** 1.2;
          const rays = width < 600 ? 38 : 64;
          for (let ray = 0; ray < rays; ray++) {
            const angle = (ray * Math.PI * 2) / rays + index * 0.21;
            const speed =
              scale * display.size * (0.72 + ((ray * 17) % 13) / 40);
            const point = (t: number) => {
              const distance = speed * (1 - Math.exp(-t * 1.15));
              return {
                x: cx + Math.cos(angle) * distance,
                y: cy + Math.sin(angle) * distance + t * t * 12,
              };
            };
            const head = point(life),
              tail = point(Math.max(0, life - 0.3));
            context.strokeStyle = `rgba(${display.color},${alpha * 0.9})`;
            context.lineWidth = 1.3;
            context.beginPath();
            context.moveTo(tail.x, tail.y);
            context.lineTo(head.x, head.y);
            context.stroke();
            dot(head.x, head.y, 1.35, display.color, alpha);
            if (ray % 3 === 0)
              dot(head.x, head.y, 3.4, display.color, alpha * 0.07);
            if (life > 0.7 && ray % 2 === 0) {
              const ember = point(life - 0.3);
              dot(
                ember.x + Math.sin(ray) * 4,
                ember.y + life * 8,
                0.75,
                display.color,
                alpha * 0.55,
              );
            }
          }
        }
      }
      // A handful of slow embers below the title; no screen-filling flash.
      for (let i = 0; i < 18; i++) {
        const x = ((i * 0.618 + 0.1) % 1) * width;
        const y = height * (0.98 - ((time * 0.025 + i * 0.071) % 0.5));
        dot(
          x + Math.sin(time * 0.3 + i) * 10,
          y,
          i % 3 ? 0.8 : 1.3,
          "239,206,144",
          0.18,
        );
      }
      if (++frames % 15 === 0) element.dataset.frames = String(frames);
    };
    const visibility = () => {
      cancelAnimationFrame(frame);
      previous = 0;
      if (enabled && !document.hidden) frame = requestAnimationFrame(draw);
    };
    document.addEventListener("visibilitychange", visibility);
    visibility();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      context.clearRect(0, 0, width, height);
    };
  }, [enabled]);
  return (
    <canvas
      ref={canvas}
      className="ending-fireworks"
      data-active={enabled}
      aria-hidden="true"
    />
  );
}
