import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { blankLetter } from "../src/finale/letter";
const letter = {
  ...blankLetter,
  recipient: "Cô Vân",
  message: "Cảm ơn cô 💛",
  displayName: "An",
  audience: "public" as const,
};
let values: Map<string, string>;
const response = (status = "approved", code = 201) =>
  new Response(
    JSON.stringify({
      data: { id: "11111111-1111-4111-8111-111111111111", status },
    }),
    { status: code },
  );
beforeEach(() => {
  vi.resetModules();
  values = new Map();
  vi.stubGlobal("sessionStorage", {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  });
  vi.stubGlobal("localStorage", {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  });
});
afterEach(() => {
  vi.unstubAllGlobals();
});
describe("F5.8 explicit public copy", () => {
  it("never sends on import, private choice, or absent consent", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    const api = await import("../src/finale/public-sharing");
    await api.sendPublicLetter({ ...letter, audience: "private" }, true);
    await api.sendPublicLetter(letter, false);
    expect(fetcher).not.toHaveBeenCalled();
    expect(values.size).toBe(0);
  });
  it("posts only the explicit public fields and keeps game storage untouched", async () => {
    const fetcher = vi.fn().mockResolvedValue(response());
    vi.stubGlobal("fetch", fetcher);
    const api = await import("../src/finale/public-sharing");
    await api.sendPublicLetter(letter, true);
    const [url, options] = fetcher.mock.calls[0];
    expect(url).toBe("/api/v1/submissions");
    expect(JSON.parse(options.body)).toEqual({
      recipient: letter.recipient,
      message: letter.message,
      display_name: "An",
      consent: { accepted: true, version: "public-wall-live-v2" },
    });
    expect(options.credentials).toBe("omit");
    expect(options.headers["X-Receipt-Token"]).toMatch(/^[0-9a-f]{64}$/);
    expect(localStorage.setItem).not.toHaveBeenCalled();
    expect(localStorage.getItem).not.toHaveBeenCalled();
    await api.sendPublicLetter(letter, true);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("preserves retry keys across reload but never retries without a new gesture", async () => {
    const fetcher = vi.fn().mockRejectedValue(new TypeError("offline"));
    vi.stubGlobal("fetch", fetcher);
    let api = await import("../src/finale/public-sharing");
    await api.sendPublicLetter(letter, true);
    const first = fetcher.mock.calls[0][1];
    vi.resetModules();
    api = await import("../src/finale/public-sharing");
    expect(fetcher).toHaveBeenCalledTimes(1);
    await api.retryPublicLetter(false);
    expect(fetcher).toHaveBeenCalledTimes(1);
    fetcher.mockResolvedValue(response());
    await api.retryPublicLetter(true);
    const retry = fetcher.mock.calls[1][1];
    expect(retry.headers).toEqual(first.headers);
    expect(retry.body).toBe(first.body);
  });
  it("withdrawal scrubs public outbox only and allows a fresh explicit send", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(response())
      .mockResolvedValueOnce(response("withdrawn", 200))
      .mockResolvedValueOnce(response());
    vi.stubGlobal("fetch", fetcher);
    const api = await import("../src/finale/public-sharing");
    await api.sendPublicLetter(letter, true);
    const first = fetcher.mock.calls[0][1].headers;
    await api.withdrawPublicLetter();
    expect(fetcher.mock.calls[1][1].method).toBe("DELETE");
    expect(JSON.parse(values.get(api.SHARING_KEY)!).payload).toBeNull();
    expect(localStorage.removeItem).not.toHaveBeenCalled();
    await api.sendPublicLetter(letter, true);
    expect(fetcher.mock.calls[2][1].headers["Idempotency-Key"]).not.toBe(
      first["Idempotency-Key"],
    );
  });
  it("validation failures permit edits; rate limits retain the same uncertain attempt", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(response("pending", 422))
      .mockResolvedValueOnce(response("pending", 429));
    vi.stubGlobal("fetch", fetcher);
    const api = await import("../src/finale/public-sharing");
    await api.sendPublicLetter(letter, true);
    expect(values.has(api.SHARING_KEY)).toBe(false);
    await api.sendPublicLetter({ ...letter, message: "Một lời mới" }, true);
    expect(JSON.parse(values.get(api.SHARING_KEY)!).status).toBe("uncertain");
  });
  it("double clicks do not start parallel submissions", async () => {
    let resolve!: (value: Response) => void;
    const fetcher = vi.fn(
      () =>
        new Promise<Response>((done) => {
          resolve = done;
        }),
    );
    vi.stubGlobal("fetch", fetcher);
    const api = await import("../src/finale/public-sharing");
    const first = api.sendPublicLetter(letter, true);
    await api.sendPublicLetter(letter, true);
    expect(fetcher).toHaveBeenCalledTimes(1);
    resolve(response());
    await first;
  });
});
