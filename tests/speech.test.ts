import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { VoicePlayer } from "../src/speech/VoicePlayer";
import type { AudioDirector } from "../src/cinematic/AudioDirector";
import { speechText } from "../src/speech/text";
import { freshSlice, readSlice } from "../src/cinematic/director";
import manifest from "../docs/opening-readability-proof/voice-manifest.json";
import { openingNarration } from "../src/speech/policy";
import { OPENING_TIMING } from "../src/future/direction";
import catalog from "../src/speech/catalog.json";
import openingTrack from "../src/speech/opening-track.json";

afterEach(() => vi.unstubAllGlobals());
const caption = manifest.lines[0].caption;
function fixture() {
  const nodes: {
    stop: ReturnType<typeof vi.fn>;
    start: ReturnType<typeof vi.fn>;
    onended: null | (() => void);
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
  }[] = [];
  const duck = vi.fn();
  const context = {
    state: "running",
    decodeAudioData: vi.fn(async () => ({ duration: 60 })),
    createBufferSource: () => {
      const node = {
        stop: vi.fn(),
        start: vi.fn(),
        connect: vi.fn(),
        disconnect: vi.fn(),
        onended: null as null | (() => void),
      };
      nodes.push(node);
      return node;
    },
  };
  const player = new VoicePlayer(
    { context, dialogue: {}, setVoiceActive: duck } as unknown as AudioDirector,
    vi.fn(),
  );
  return { player, nodes, duck, context };
}
describe("Vietnamese narration", () => {
  it("ships intact local audio matching the generated manifest", () => {
    expect(manifest.lines).toHaveLength(7);
    for (const line of manifest.lines) {
      const entry = catalog[line.key as keyof typeof catalog];
      expect(entry, line.caption).toBeDefined();
      const bytes = readFileSync(`public/${entry.sourceFile}`);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(
        line.sha256,
      );
      expect(entry.tempo).toBe(0.88);
      expect(
        createHash("sha256")
          .update(readFileSync(`public/${entry.file}`))
          .digest("hex"),
      ).toBe(entry.sha256);
      expect(entry.seconds).toBeGreaterThan(0);
    }
    expect(speechText("[Tiếng mưa. Một khoảng lặng.]")).toBe("");
    expect(speechText("Cô Vân: “Để thử lại.”".normalize("NFD"))).toBe(
      "Để thử lại.",
    );
  });
  it("keeps the opening narrator within the opening cinematic", () => {
    expect(openingNarration("OPENING_CINEMATIC", 0)).toContain("2046");
    expect(
      openingNarration("OPENING_CINEMATIC", OPENING_TIMING.silent - 1),
    ).not.toBeNull();
    expect(
      openingNarration("OPENING_CINEMATIC", OPENING_TIMING.silent),
    ).toBeNull();
    for (const beat of [
      "PLAYER_CONTROL_ENABLED",
      "SIGNAL_INVESTIGATION",
      "MEMORY_TRANSITION",
      "CLASSROOM_ESTABLISHING",
      "CLASSROOM_EXPLORATION",
      "LAPTOP_INVESTIGATION",
      "NEXT_SCENE_READY",
    ] as const)
      for (const time of [0, 5, 27, 42])
        expect(openingNarration(beat, time)).toBeNull();
  });
  it("stops old speech, ducks music and never restarts the same caption each frame", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(8),
      })),
    );
    const { player, nodes, duck } = fixture();
    player.update(caption, true, false);
    await vi.waitFor(() => expect(player.snapshot().status).toBe("speaking"));
    player.update(caption, true, false);
    expect(nodes).toHaveLength(1);
    expect(duck).toHaveBeenLastCalledWith(true);
    player.update("[Mưa ngoài cửa sổ.]", true, false);
    expect(nodes[0].stop).toHaveBeenCalledOnce();
    expect(duck).toHaveBeenLastCalledWith(false);
    expect(player.snapshot().busy).toBe(false);
    player.dispose();
  });
  it("keeps one continuous source across subtitle changes and pause, then resumes a mute at the current position", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(8),
      })),
    );
    const { player, nodes } = fixture();
    player.update(caption, true, false, 0);
    await vi.waitFor(() => expect(player.snapshot().status).toBe("speaking"));
    expect(nodes[0].start).toHaveBeenCalledWith(0, 0);
    player.update(manifest.lines[1].caption, true, false, 7);
    player.update(manifest.lines[2].caption, true, true, 12);
    player.update(manifest.lines[2].caption, true, false, 12);
    expect(nodes).toHaveLength(1);
    expect(nodes[0].stop).not.toHaveBeenCalled();
    expect(player.busyFor(caption)).toBe(false);
    player.update(manifest.lines[2].caption, false, false, 15);
    expect(nodes[0].stop).toHaveBeenCalledOnce();
    player.update(manifest.lines[3].caption, true, false, 17.5);
    await vi.waitFor(() => expect(nodes).toHaveLength(2));
    expect(nodes[1].start).toHaveBeenCalledWith(0, 17.5);
    expect(player.snapshot().continuous).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(1);
    player.dispose();
  });
  it("ships a verified continuous recording with brief pauses and no missing narrator segments", () => {
    expect(openingTrack.clips.map((clip) => clip.key)).toEqual(
      Object.keys(catalog),
    );
    expect(
      createHash("sha256")
        .update(readFileSync(`public/${openingTrack.file}`))
        .digest("hex"),
    ).toBe(openingTrack.sha256);
    for (let i = 1; i < openingTrack.clips.length; i++) {
      const gap = openingTrack.clips[i].start - openingTrack.clips[i - 1].end;
      expect(gap).toBeGreaterThan(0.15);
      expect(gap).toBeLessThan(0.3);
    }
  });
  it("ignores a late audio response after mute and keeps captions usable on a failed asset", async () => {
    let resolve!: (value: unknown) => void;
    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          new Promise((done) => {
            resolve = done;
          }),
      ),
    );
    const { player, nodes } = fixture();
    player.update(caption, true, false);
    player.update(caption, false, false);
    resolve({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) });
    await new Promise((done) => setTimeout(done, 10));
    expect(nodes).toHaveLength(0);
    expect(player.snapshot().status).toBe("off");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false })),
    );
    player.update(caption, true, false);
    await vi.waitFor(() =>
      expect(player.snapshot().status).toBe("unavailable"),
    );
    expect(player.snapshot().busy).toBe(false);
    expect(JSON.stringify(player.snapshot())).not.toContain("Cô Vân");
    player.dispose();
  });
  it("preserves legacy checkpoints and the explicit voice-off preference", () => {
    const legacy = { ...freshSlice };
    delete legacy.voice;
    expect(readSlice(JSON.stringify(legacy)).voice).toBe(true);
    expect(readSlice(JSON.stringify({ ...legacy, voice: false })).voice).toBe(
      false,
    );
  });
});
