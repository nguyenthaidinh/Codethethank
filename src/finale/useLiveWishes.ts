import { useEffect, useState } from "react";

export interface LiveWish {
  id: string;
  recipient: string;
  message: string;
  display_name: string | null;
}

export function useLiveWishes() {
  const [wishes, setWishes] = useState<LiveWish[]>([]);
  const [status, setStatus] = useState("Đang kết nối lời chúc công khai…");
  useEffect(() => {
    let disposed = false,
      timer = 0,
      controller: AbortController | null = null;
    const base = (import.meta.env.VITE_GRATITUDE_API_BASE || "/api/v1").replace(
      /\/$/,
      "",
    );
    async function poll() {
      if (disposed || document.hidden) return;
      const request = new AbortController();
      controller = request;
      const timeout = window.setTimeout(() => request.abort(), 3500);
      try {
        const response = await fetch(`${base}/wall/game-feed`, {
          cache: "no-store",
          credentials: "omit",
          signal: request.signal,
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw Error("feed unavailable");
        const data = await response.json();
        if (typeof data.blank !== "boolean" || !Array.isArray(data.items))
          throw Error("invalid feed");
        const rows: LiveWish[] = data.items.slice(0, 6);
        if (
          rows.some(
            (row) =>
              !row ||
              typeof row.id !== "string" ||
              typeof row.recipient !== "string" ||
              typeof row.message !== "string" ||
              !(
                row.display_name === null ||
                typeof row.display_name === "string"
              ),
          )
        )
          throw Error("invalid wish");
        if (disposed || request.signal.aborted || document.hidden) return;
        setWishes(data.blank ? [] : rows);
        setStatus(
          data.blank
            ? "Lời chúc đang được tạm che bởi ban tổ chức."
            : rows.length
              ? "Lời chúc công khai · cập nhật trực tiếp từ Live Wall"
              : "Chưa có lời chúc công khai. Lời mới sẽ hiện tại đây.",
        );
      } catch {
        if (!disposed && !document.hidden && controller === request) {
          setWishes([]);
          setStatus("Đang kết nối lại Live Wall…");
        }
      } finally {
        clearTimeout(timeout);
        if (!disposed && !document.hidden && controller === request)
          timer = window.setTimeout(poll, 1500);
      }
    }
    const visibility = () => {
      clearTimeout(timer);
      controller?.abort();
      controller = null;
      setWishes([]);
      if (!document.hidden) void poll();
    };
    void poll();
    document.addEventListener("visibilitychange", visibility);
    return () => {
      disposed = true;
      clearTimeout(timer);
      controller?.abort();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  return { wishes, status };
}
