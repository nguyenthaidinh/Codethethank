import type { Preferences } from "./preferences";

/** Original, locally synthesized ambience. No network or autoplay. */
export class MenuAudio {
  private context: AudioContext | null = null;
  private music: GainNode | null = null;
  private effects: GainNode | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private settings: Preferences;
  constructor(settings: Preferences) {
    this.settings = settings;
  }
  async unlock() {
    if (!this.context) {
      const c = new AudioContext();
      this.context = c;
      this.music = c.createGain();
      this.effects = c.createGain();
      this.music.connect(c.destination);
      this.effects.connect(c.destination);
      this.apply(this.settings);
      const buffer = c.createBuffer(1, c.sampleRate * 3, c.sampleRate);
      const samples = buffer.getChannelData(0);
      let previous = 0;
      for (let i = 0; i < samples.length; i++) {
        previous = (previous + (Math.random() * 2 - 1) * 0.025) / 1.025;
        samples[i] = previous * 0.12;
      }
      const wind = c.createBufferSource();
      wind.buffer = buffer;
      wind.loop = true;
      wind.connect(this.effects);
      wind.start();
      let step = 0;
      const phrase = [220, 329.63, 440, 392, 293.66, 329.63, 261.63, 196];
      this.timer = setInterval(() => {
        if (c.state === "running")
          this.note(phrase[step++ % phrase.length], 3.8, 0.045, this.music);
      }, 2100);
    }
    await this.context.resume();
  }
  apply(settings: Preferences) {
    this.settings = settings;
    const t = this.context?.currentTime ?? 0;
    this.music?.gain.setTargetAtTime(
      settings.muted ? 0 : settings.music,
      t,
      0.12,
    );
    this.effects?.gain.setTargetAtTime(
      settings.muted ? 0 : settings.effects,
      t,
      0.12,
    );
  }
  private note(
    hz: number,
    duration: number,
    level: number,
    bus: GainNode | null,
  ) {
    const c = this.context;
    if (!c || !bus || c.state !== "running") return;
    const oscillator = c.createOscillator(),
      envelope = c.createGain(),
      t = c.currentTime;
    oscillator.frequency.value = hz;
    envelope.gain.setValueAtTime(0, t);
    envelope.gain.linearRampToValueAtTime(level, t + 0.025);
    envelope.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    oscillator.connect(envelope);
    envelope.connect(bus);
    oscillator.start();
    oscillator.stop(t + duration);
    oscillator.onended = () => {
      oscillator.disconnect();
      envelope.disconnect();
    };
  }
  cue(kind: "hover" | "click" | "transition") {
    this.note(
      kind === "hover" ? 660 : kind === "click" ? 440 : 146.83,
      kind === "transition" ? 1.4 : 0.13,
      kind === "hover" ? 0.012 : 0.035,
      this.effects,
    );
  }
  visibility(hidden: boolean) {
    if (hidden) void this.context?.suspend().catch(() => {});
    else if (!this.settings.muted) void this.context?.resume().catch(() => {});
  }
  dispose() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    void this.context?.close().catch(() => {});
    this.context = null;
  }
}
