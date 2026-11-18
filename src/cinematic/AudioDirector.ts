import lofiUrl from "./audio/after-class-lofi.mp3?url";
import type { Beat, Focus, SliceSave } from "./director";
import { CHAIR_MOTIF } from "./motifs";
export type Foley =
  | "bell"
  | "step"
  | "door"
  | "chair"
  | "key"
  | "verdict"
  | "paper"
  | "pen"
  | "desk";
/** Entire soundscape is synthesized locally; the same chair buffer can be reused for a match-cut. */
export class AudioDirector {
  context: AudioContext;
  output: MediaStreamAudioDestinationNode;
  master: GainNode;
  ambience: GainNode;
  foley: GainNode;
  music: GainNode;
  dialogue: GainNode;
  rain: GainNode;
  fan: GainNode;
  rainPan: StereoPannerNode;
  private sources: AudioScheduledSourceNode[] = [];
  private scoreLoad?: Promise<void>;
  private scoreFailed = false;
  private scoreAbort = new AbortController();
  private chairBuffer: AudioBuffer;
  private voiceActive = false;
  private voicePaused = false;
  get voiceDuck() {
    return this.voiceActive ? 0.3 : 1;
  }
  setVoiceActive(active: boolean) {
    this.voiceActive = active;
    if (this.settings && this.context.state !== "closed")
      this.apply(this.settings, this.voicePaused);
  }
  private settings: SliceSave | null = null;
  events: { cue: string; time: number }[] = [];
  mix = { rain: 0, fan: 0, ambience: 1, music: 0.38 };
  constructor() {
    this.context = new AudioContext();
    const c = this.context;
    this.output = c.createMediaStreamDestination();
    this.master = c.createGain();
    this.master.gain.value = 0;
    this.master.connect(c.destination);
    this.master.connect(this.output);
    this.ambience = c.createGain();
    this.foley = c.createGain();
    this.music = c.createGain();
    this.dialogue = c.createGain();
    for (const bus of [this.ambience, this.foley, this.music, this.dialogue])
      bus.connect(this.master);
    this.rain = c.createGain();
    this.rain.gain.value = 0.12;
    this.rainPan = c.createStereoPanner();
    this.rainPan.pan.value = -0.65;
    this.rain.connect(this.rainPan);
    this.rainPan.connect(this.ambience);
    const rainSource = c.createBufferSource();
    rainSource.buffer = this.noise(4);
    rainSource.loop = true;
    const filter = c.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1900;
    rainSource.connect(filter);
    filter.connect(this.rain);
    rainSource.start();
    this.sources.push(rainSource);
    this.fan = c.createGain();
    this.fan.gain.value = 0.025;
    this.fan.connect(this.ambience);
    for (const hz of [64, 128, 192]) {
      const o = c.createOscillator();
      o.type = "sine";
      o.frequency.value = hz;
      const g = c.createGain();
      g.gain.value = hz === 64 ? 0.65 : 0.12;
      o.connect(g);
      g.connect(this.fan);
      o.start();
      this.sources.push(o);
    }
    const room = c.createBufferSource();
    room.buffer = this.noise(3);
    room.loop = true;
    const f = c.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 280;
    f.Q.value = 0.5;
    room.connect(f);
    f.connect(this.fan);
    room.start();
    this.sources.push(room);
    this.chairBuffer = this.noise(CHAIR_MOTIF.soundSeconds, true);
    this.music.gain.value = 0;
  }
  private noise(seconds: number, scrape = false) {
    const c = this.context,
      b = c.createBuffer(1, Math.floor(c.sampleRate * seconds), c.sampleRate),
      a = b.getChannelData(0);
    let seed = CHAIR_MOTIF.seed,
      previous = 0;
    for (let i = 0; i < a.length; i++) {
      seed = (seed * 16807) % 2147483647;
      const white = (seed / 2147483647) * 2 - 1;
      previous = (previous + 0.035 * white) / 1.035;
      a[i] = scrape
        ? (white * 0.25 + previous * 3) *
          Math.sin((Math.PI * i) / a.length) *
          (0.5 + 0.5 * Math.sin((i / c.sampleRate) * 58))
        : white * 0.4 + previous * 2;
    }
    return b;
  }
  private startScore() {
    if (this.scoreLoad || this.scoreAbort.signal.aborted) return;
    this.scoreLoad = (async () => {
      const response = await fetch(lofiUrl, { signal: this.scoreAbort.signal });
      if (!response.ok) throw new Error("Unable to load the game score");
      const buffer = await this.context.decodeAudioData(await response.arrayBuffer());
      if (this.scoreAbort.signal.aborted) return;
      const source = this.context.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(this.music);
      source.start();
      this.sources.push(source);
    })().catch(() => {
      this.scoreFailed = true;
    });
  }
  async unlock() {
    if (this.scoreFailed) {
      this.scoreLoad = undefined;
      this.scoreFailed = false;
    }
    await this.context.resume();
    if (this.settings?.music && !this.settings.muted) this.startScore();
  }
  playChairMotif() {
    this.events.push({ cue: CHAIR_MOTIF.id, time: this.context.currentTime });
    this.cue("chair");
  }
  apply(s: SliceSave, paused = false) {
    this.settings = s;
    this.voicePaused = paused;
    const t = this.context.currentTime;
    if (s.music && !s.muted && !paused) this.startScore();
    this.master.gain.setTargetAtTime(s.muted || paused ? 0 : s.volume, t, 0.12);
    this.foley.gain.setTargetAtTime(s.sfx ? 1 : 0, t, 0.1);
    this.ambience.gain.setTargetAtTime(s.sfx ? this.mix.ambience : 0, t, 0.15);
    this.music.gain.setTargetAtTime(
      s.music ? this.mix.music * this.voiceDuck : 0,
      t,
      0.15,
    );
  }
  focus(focus: Focus) {
    const t = this.context.currentTime;
    this.mix.rain = focus === "window" ? 0.38 : focus === "door" ? 0.08 : 0.14;
    this.mix.fan =
      focus === "window" ? 0.016 : focus === "laptop" ? 0.08 : 0.045;
    this.rain.gain.setTargetAtTime(this.mix.rain, t, 0.7);
    this.fan.gain.setTargetAtTime(this.mix.fan, t, 0.7);
    this.rainPan.pan.setTargetAtTime(
      focus === "window" ? -0.15 : -0.65,
      t,
      0.7,
    );
    this.events.push({ cue: `focus.${focus}`, time: t });
  }
  beat(beat: Beat) {
    this.mix.ambience =
      beat === "verdict"
        ? 0.18
        : beat === "response" || beat === "invitation"
          ? 0.6
          : 1;
    this.mix.music = beat === "verdict" ? 0 : ["chair", "invitation"].includes(beat) ? 0.045 : 0.38;
    if (this.settings) this.apply(this.settings);
    if (beat === "paper") {
      this.tone(261.63, 3, 0.12, this.music);
      this.tone(392, 4, 0.08, this.music, 0.7);
    }
    this.events.push({ cue: `beat.${beat}`, time: this.context.currentTime });
  }
  private tone(
    hz: number,
    duration: number,
    level: number,
    bus: AudioNode,
    delay = 0,
  ) {
    const c = this.context,
      t = c.currentTime + delay,
      o = c.createOscillator(),
      g = c.createGain();
    o.frequency.value = hz;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(level, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    o.connect(g);
    g.connect(bus);
    o.start(t);
    o.stop(t + duration);
    o.onended = () => {
      o.disconnect();
      g.disconnect();
    };
  }
  cue(cue: Foley) {
    const c = this.context,
      t = c.currentTime;
    this.events.push({ cue, time: t });
    if (cue === "bell") {
      [660, 880, 1320].forEach((f, i) =>
        this.tone(f, 2, 0.07, this.foley, i * 0.06),
      );
      return;
    }
    if (cue === "verdict") {
      this.tone(78, 0.4, 0.13, this.foley);
      return;
    }
    if (cue === "key") {
      this.tone(700, 0.035, 0.035, this.foley);
      return;
    }
    if (cue === "desk") this.tone(95, 0.16, 0.14, this.foley);
    const source = c.createBufferSource(),
      filter = c.createBiquadFilter(),
      gain = c.createGain(),
      pan = c.createStereoPanner();
    const duration =
      cue === "desk"
        ? 0.22
        : cue === "chair"
          ? 1.25
          : cue === "door"
            ? 0.4
            : cue === "pen"
              ? 0.25
              : cue === "paper"
                ? 0.6
                : 0.13;
    source.buffer = cue === "chair" ? this.chairBuffer : this.noise(duration);
    filter.type = ["step", "door", "desk"].includes(cue)
      ? "lowpass"
      : "bandpass";
    filter.frequency.value =
      cue === "desk"
        ? 850
        : cue === "chair"
          ? 650
          : cue === "pen"
            ? 3200
            : cue === "paper"
              ? 2400
              : cue === "door"
                ? 180
                : 330;
    filter.Q.value = 0.6;
    gain.gain.setValueAtTime(
      cue === "desk"
        ? 0.38
        : cue === "chair"
          ? 0.65
          : cue === "step"
            ? 0.9
            : 0.5,
      t,
    );
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    pan.pan.value = cue === "step" ? 0.45 : 0;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(pan);
    pan.connect(this.foley);
    source.start();
    source.onended = () => {
      source.disconnect();
      filter.disconnect();
      gain.disconnect();
      pan.disconnect();
    };
  }
  async pause(paused: boolean) {
    if (paused) await this.context.suspend();
    else await this.context.resume();
  }
  dispose() {
    this.scoreAbort.abort();
    for (const source of this.sources) source.stop();
    void this.context.close();
  }
}
