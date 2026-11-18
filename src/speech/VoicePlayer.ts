import type { AudioDirector } from "../cinematic/AudioDirector";
import catalog from "./catalog.json";
import { speechText, speechKey } from "./text";
import openingTrack from "./opening-track.json" with { type: "json" };
type Entry = { file: string };
/** A number follows the opening track. An authored clip uses its scene offset. */
export type VoicePosition = number | { file: string; offset: number };
type Status = "idle" | "loading" | "speaking" | "off" | "unavailable";
/** Local, authored-line audio only. Never accepts a letter/name for synthesis. */
export class VoicePlayer {
  private source: AudioBufferSourceNode | null = null;
  private cache = new Map<string, AudioBuffer>();
  private request: AbortController | null = null;
  private generation = 0;
  private key = "";
  private closed = false;
  private status: Status = "idle";
  private started = 0;
  private completed = 0;
  private rate = 1;
  private trackTime: number | undefined;
  constructor(
    private audio: AudioDirector,
    private notify: (status: Status) => void,
  ) {}
  private state(status: Status) {
    this.status = status;
    if (!this.closed) this.notify(status);
  }
  private cancel() {
    this.generation++;
    this.request?.abort();
    this.request = null;
    const source = this.source;
    this.source = null;
    if (source) {
      source.onended = null;
      source.stop();
      source.disconnect();
    }
    this.audio.setVoiceActive(false);
  }
  update(
    caption: string | null,
    enabled: boolean,
    paused: boolean,
    position?: VoicePosition,
    rate = 1,
  ) {
    const clip = typeof position === "object" ? position : undefined;
    this.trackTime =
      clip?.offset ?? (typeof position === "number" ? position : undefined);
    const text = speechText(caption),
      key = text
        ? (clip?.file ??
          (typeof position === "number"
            ? "opening-continuous"
            : speechKey(text)))
        : "";
    if (this.closed) return;
    if (this.rate !== rate) {
      this.rate = rate;
      if (this.source) this.source.playbackRate.value = rate;
    }
    if (!enabled) {
      if (this.key || this.status !== "off") this.cancel();
      this.key = "";
      this.state("off");
      return;
    }
    if (paused) return; // The shared AudioContext is suspended by the game.
    if (key === this.key) return;
    this.cancel();
    this.key = key;
    if (!key) {
      this.state("idle");
      return;
    }
    const entry =
      clip ??
      (key === "opening-continuous"
        ? openingTrack
        : (catalog as Record<string, Entry>)[key]);
    if (!entry) {
      this.state("unavailable");
      return;
    }
    const generation = this.generation;
    this.state("loading");
    const request = new AbortController();
    this.request = request;
    const timeout = setTimeout(() => request.abort(), 8000);
    void (async () => {
      try {
        let buffer = this.cache.get(key);
        if (!buffer) {
          const response = await fetch(import.meta.env.BASE_URL + entry.file, {
            signal: request.signal,
          });
          if (!response.ok) throw Error("Voice clip unavailable");
          buffer = await this.audio.context.decodeAudioData(
            await response.arrayBuffer(),
          );
          if (this.closed || generation !== this.generation) return;
          this.cache.set(key, buffer);
          while (this.cache.size > 12)
            this.cache.delete(this.cache.keys().next().value!);
        }
        if (this.closed || generation !== this.generation) return;
        const offset = Math.max(0, this.trackTime ?? 0);
        if (offset >= buffer.duration) {
          this.state("idle");
          return;
        }
        const source = this.audio.context.createBufferSource();
        source.buffer = buffer;
        if (this.rate !== 1) source.playbackRate.value = this.rate;
        source.connect(this.audio.dialogue);
        this.source = source;
        source.onended = () => {
          if (this.closed || generation !== this.generation) return;
          source.disconnect();
          this.source = null;
          this.audio.setVoiceActive(false);
          this.completed++;
          this.state("idle");
        };
        this.audio.setVoiceActive(true);
        if (position !== undefined) source.start(0, offset);
        else source.start();
        this.started++;
        this.state("speaking");
      } catch {
        if (!this.closed && generation === this.generation) {
          this.audio.setVoiceActive(false);
          this.state("unavailable");
        }
      } finally {
        clearTimeout(timeout);
      }
    })();
  }
  busyFor(caption: string | null) {
    if (this.trackTime !== undefined) return false;
    return speechKey(speechText(caption)) === this.key && this.busy;
  }
  get busy() {
    return (
      !this.closed &&
      this.audio.context.state === "running" &&
      (this.status === "loading" || this.status === "speaking")
    );
  }
  get loading() {
    return !this.closed && this.status === "loading";
  }
  snapshot() {
    return {
      status: this.status,
      clip: this.key || null,
      started: this.started,
      completed: this.completed,
      busy: this.busy,
      continuous: this.key === "opening-continuous",
      trackTime: this.trackTime ?? null,
    };
  }
  dispose() {
    if (this.closed) return;
    this.closed = true;
    this.cancel();
    this.cache.clear();
  }
}
