import { createLanternArt } from "./lantern-art.js";
import { createTribute } from "./tribute.js";

(() => {
    "use strict";
    const root = document.body,
        preview = root.dataset.preview === "true",
        blackout = document.querySelector("#blackout"),
        hint = document.querySelector("#pair-hint"),
        dedication = document.querySelector("#dedication"),
        wishes = document.querySelector("#wishes");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const tribute = createTribute({ preview, reduced });
    let token = "",
        snapshot = null,
        revision = -1,
        ack = 0,
        lease = 0,
        localBlank = false,
        busy = false,
        active = false,
        receivedAt = 0,
        pageKey = "",
        effects = true;
    const fragment = new URLSearchParams(location.hash.slice(1));
    if (fragment.has("token")) {
        token = fragment.get("token");
        history.replaceState(null, "", location.pathname);
        try {
            sessionStorage.setItem("aion-wall-display", token);
        } catch {}
    } else
        try {
            token = sessionStorage.getItem("aion-wall-display") || "";
        } catch {}
    function clear() {
        tribute.reset();
        blackout.hidden = false;
        dedication.hidden = true;
        wishes.replaceChildren();
        document.querySelector("#message").textContent = "";
        document.querySelector("#recipient").textContent = "";
        document.querySelector("#sender").textContent = "";
        document.querySelector("#page-number").textContent = "";
        snapshot = null;
        active = false;
        pageKey = "";
    }
    function paint() {
        if (
            !snapshot ||
            localBlank ||
            snapshot.blank ||
            document.hidden ||
            performance.now() >= lease
        ) {
            clear();
            return;
        }
        blackout.hidden = true;
        active = true;
        effects = snapshot.effects;
        if (tribute.paint(snapshot.tribute, snapshot.server_now_ms + performance.now() - receivedAt)) {
            dedication.hidden = true;
            ack = snapshot.revision;
            return;
        }
        const current = snapshot.current;
        dedication.hidden = !current;
        if (current) {
            const elapsed = Math.max(
                0,
                snapshot.server_now_ms -
                    snapshot.started_at_ms +
                    performance.now() -
                    receivedAt,
            );
            const index =
                Math.floor(elapsed / (snapshot.page_seconds * 1000)) %
                current.pages.length;
            const key = `${current.id}:${index}`;
            if (key !== pageKey) {
                if (!reduced.matches) {
                    dedication.animate(
                        [
                            { opacity: 0, transform: "translateY(8px)" },
                            { opacity: 1, transform: "translateY(0)" },
                        ],
                        { duration: 850, easing: "ease-out" },
                    );
                }
                document.querySelector("#recipient").textContent =
                    `Gửi ${current.recipient}`;
                document.querySelector("#message").textContent =
                    current.pages[index];
                document.querySelector("#sender").textContent =
                    `— ${current.display_name || "Một người biết ơn"}`;
                document.querySelector("#page-number").textContent =
                    current.pages.length > 1
                        ? `${index + 1} / ${current.pages.length}`
                        : "";
                pageKey = key;
            }
        }
        ack = snapshot.revision;
    }
    function syncWishes(items) {
        const selected = items.slice(0, 8),
            valid = new Set(selected.map((item) => item.id));
        for (const el of wishes.children)
            if (!valid.has(el.dataset.id)) el.remove();
        selected.forEach((item, index) => {
            if ([...wishes.children].some((el) => el.dataset.id === item.id))
                return;
            const el = document.createElement("div");
            el.className = "flying-wish";
            el.dataset.id = item.id;
            el.style.left =
                index % 2 === 0
                    ? `${2 + (index % 4) * 1.3}%`
                    : `${79 - (index % 4) * 1.3}%`;
            el.style.animationDelay = `-${index * 3.1}s`;
            const text = document.createElement("span");
            text.textContent =
                item.message.length > 95
                    ? `${Array.from(item.message).slice(0, 90).join("")}…`
                    : item.message;
            const sender = document.createElement("small");
            sender.textContent = `GỬI ${item.recipient}`;
            el.append(text, sender);
            wishes.append(el);
        });
    }
    async function poll() {
        if (busy || document.hidden || (!preview && !token)) return;
        busy = true;
        const started = performance.now();
        try {
            const response = await fetch(
                `${root.dataset.endpoint}?ack=${ack}`,
                {
                    cache: "no-store",
                    headers: preview
                        ? { Accept: "application/json" }
                        : { Accept: "application/json", "X-Wall-Token": token },
                    signal: AbortSignal.timeout(4500),
                },
            );
            if (!response.ok) {
                if ([401, 403, 404, 419].includes(response.status)) clear();
                throw Error();
            }
            const data = await response.json();
            if (data.revision < revision) return;
            revision = data.revision;
            lease = started + Math.min(data.lease_ms, 6500);
            snapshot = data;
            receivedAt = performance.now();
            if (data.blank) {
                clear();
                ack = data.revision;
            } else {
                paint();
                if (active) syncWishes(data.items);
            }
        } catch {
            if (performance.now() >= lease) clear();
        } finally {
            busy = false;
        }
    }
    if (!preview && !token) {
        hint.hidden = false;
    } else {
        poll();
        setInterval(poll, 1000);
    }
    setInterval(paint, 100);
    document.addEventListener("visibilitychange", () => {
        clear();
        if (!document.hidden) poll();
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" || event.key.toLowerCase() === "b") {
            localBlank = true;
            clear();
        }
        if (event.key.toLowerCase() === "r") {
            localBlank = false;
            poll();
        }
        if (event.key.toLowerCase() === "f") fullscreen();
    });
    const start = document.querySelector("#fullscreen");
    async function fullscreen() {
        try {
            if (!document.fullscreenElement)
                await document.documentElement.requestFullscreen();
        } catch {}
        start.hidden = true;
    }
    start.addEventListener("click", fullscreen);
    if (!preview && token) {
        start.hidden = false;
        setTimeout(() => {
            start.hidden = true;
        }, 8000);
        document.addEventListener("dblclick", fullscreen);
    }
    // Procedural environment: bounded particles, device-pixel ratio and GPU canvas size.
    const canvas = document.querySelector("#sky"),
        ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    let width = 0,
        height = 0,
        last = 0,
        time = 0,
        burstAt = 0,
        particles = [];
    const lanterns = Array.from({ length: 22 }, (_, i) => ({
        x: 0.02 + (((i + 0.5) * 0.61803398875) % 1) * 0.96,
        y: ((i + 0.5) * 0.754877666) % 1,
        s: 0.35 + (((i + 0.5) * 0.41421356) % 1) * 0.72,
        speed: 0.008 + (((i + 0.5) * 0.7320508) % 1) * 0.012,
    }));
    const stars = Array.from({ length: 95 }, (_, i) => ({
        x: ((i * 7919) % 1000) / 1000,
        y: ((i * 6271) % 1000) / 1000,
        a: 0.12 + (i % 5) * 0.08,
    }));
    function resize() {
        width = innerWidth;
        height = innerHeight;
        const dpr = Math.min(devicePixelRatio || 1, 1.5);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    addEventListener("resize", resize);
    resize();
    const lanternArt = createLanternArt();
    function lantern(x, y, size, alpha) {
        if (!lanternArt) return;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.sin(time * 0.38 + x * 0.009) * 0.055);
        ctx.globalAlpha = alpha;
        ctx.drawImage(
            lanternArt,
            -size * 2.1,
            -size * 2.02,
            size * 4.2,
            size * 4.9,
        );
        ctx.globalCompositeOperation = "screen";
        ctx.globalAlpha = alpha * (0.055 + 0.025 * Math.sin(time * 2.4 + x));
        ctx.drawImage(
            lanternArt,
            -size * 2.1,
            -size * 2.02,
            size * 4.2,
            size * 4.9,
        );
        ctx.restore();
    }
    function frame(stamp) {
        requestAnimationFrame(frame);
        if (document.hidden || !active) return;
        const interval = reduced.matches ? 1000 : 1000 / 40;
        if (stamp - last < interval) return;
        const dt = Math.min((stamp - last) / 1000, 0.05);
        last = stamp;
        if (!reduced.matches) time += dt;
        ctx.clearRect(0, 0, width, height);
        for (const star of stars) {
            ctx.fillStyle = `rgba(170,210,225,${star.a})`;
            ctx.fillRect(star.x * width, star.y * height, 1.2, 1.2);
        }
        ctx.strokeStyle = "#85cfe010";
        ctx.lineWidth = 1;
        for (let i = -8; i <= 8; i++) {
            ctx.beginPath();
            ctx.moveTo(width * 0.5, height * 0.79);
            ctx.lineTo(width * 0.5 + i * width * 0.15, height);
            ctx.stroke();
        }
        for (let i = 1; i < 8; i++) {
            const y = height * (0.8 + 0.2 * (i / 8) ** 2);
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        for (const l of lanterns) {
            const y = height * (1.15 - ((l.y + time * l.speed) % 1.4));
            const x = width * l.x + Math.sin(time * 0.2 + l.x * 20) * 12;
            const center =
                x > width * 0.22 &&
                x < width * 0.78 &&
                y > height * 0.08 &&
                y < height * 0.82;
            lantern(
                x,
                y,
                Math.min(width * 0.029, 54) * l.s,
                center ? 0.12 : 0.48 + l.s * 0.3,
            );
        }
        if (!reduced.matches && effects && time > burstAt) {
            burstAt = time + 4.5;
            const x = width * (time % 2 < 1 ? 0.16 : 0.84),
                y = height * (0.22 + Math.random() * 0.18);
            for (let i = 0; i < 56; i++) {
                const angle = (i / 56) * Math.PI * 2,
                    speed = 35 + Math.random() * 90;
                particles.push({
                    x,
                    y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 2.6,
                    color: i % 3 ? "230,183,120" : "147,220,229",
                });
            }
            particles = particles.slice(-168);
        }
        if (!effects || reduced.matches) particles = [];
        for (const p of particles) {
            p.life -= dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 14 * dt;
            ctx.strokeStyle = `rgba(${p.color},${Math.max(0, p.life / 3) * 0.8})`;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - p.vx * 0.045, p.y - p.vy * 0.045);
            ctx.stroke();
        }
        particles = particles.filter((p) => p.life > 0);
    }
    requestAnimationFrame(frame);
})();
