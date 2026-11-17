import type { FinalePhase } from "../finale/state";
import type { RipplePhase } from "../ripple/state";
import { AudioDirector } from "../cinematic/AudioDirector";
import type { SliceSave } from "../cinematic/director";
import type { StayPhase } from "../stayed/story";
import type { FuturePlace } from "../future/direction";
/** Original synthesized crowd, machinery and motifs; no fetched or unlicensed audio. */
export class ChapterAudio extends AudioDirector {
  private future: GainNode;
  private voices: GainNode;
  private oscillators: AudioScheduledSourceNode[] = [];
  private school = 0;
  private chapterSettings?: SliceSave;
  constructor(private levels = { music: 1, effects: 1 }) {
    super();
    const c = this.context;
    this.future = c.createGain();
    this.future.gain.value = 0.3;
    this.future.connect(this.ambience);
    this.voices = c.createGain();
    this.voices.gain.value = 0.03;
    this.voices.connect(this.ambience);
    const noise = c.createBuffer(1, c.sampleRate * 3, c.sampleRate),
      data = noise.getChannelData(0);
    let seed = 2046;
    for (let i = 0; i < data.length; i++) {
      seed = (seed * 16807) % 2147483647;
      data[i] = (seed / 2147483647 - 0.5) * 0.3;
    }
    for (const hz of [240, 420, 730]) {
      const src = c.createBufferSource();
      src.buffer = noise;
      src.loop = true;
      const filter = c.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = hz;
      filter.Q.value = 4;
      const trem = c.createOscillator(),
        gain = c.createGain();
      trem.frequency.value = 1.2 + hz / 600;
      trem.connect(gain.gain);
      gain.gain.value = 0.1;
      // Low amplitude formant fluctuations suggest distant conversation, not intelligible dialogue.
      src.connect(filter);
      filter.connect(gain);
      gain.connect(this.voices);
      src.start();
      trem.start();
      this.oscillators.push(src, trem);
    }
    for (const hz of [55, 110, 164.81]) {
      const o = c.createOscillator(),
        g = c.createGain();
      o.frequency.value = hz;
      g.gain.value = 0.024;
      o.connect(g);
      g.connect(this.future);
      o.start();
      this.oscillators.push(o);
    }
    for (const hz of [130.81, 196]) {
      const o = c.createOscillator(),
        g = c.createGain();
      o.frequency.value = hz;
      g.gain.value = 0.04;
      o.connect(g);
      g.connect(this.music);
      o.start();
      this.oscillators.push(o);
    }
    this.environment(0);
  }
  override apply(s: SliceSave, paused = false) {
    this.chapterSettings = s;
    super.apply(s, paused);
    const t = this.context.currentTime;
    this.foley.gain.setTargetAtTime(s.sfx ? this.levels.effects : 0, t, 0.1);
    this.ambience.gain.setTargetAtTime(
      s.sfx ? this.mix.ambience * this.levels.effects : 0,
      t,
      0.15,
    );
    this.music.gain.setTargetAtTime(
      s.music ? this.mix.music * this.levels.music * this.voiceDuck : 0,
      t,
      0.15,
    );
  }
  environment(school: number, silence = false) {
    this.school = school;
    const t = this.context.currentTime;
    this.future.gain.setTargetAtTime(
      silence ? 0 : (1 - school) * 0.35,
      t,
      0.45,
    );
    this.voices.gain.setTargetAtTime(
      silence ? 0 : school === 1 ? 0.008 : 0.045 * (1 - school),
      t,
      0.5,
    );
    this.rain.gain.setTargetAtTime(silence ? 0 : school * 0.2, t, 0.6);
    this.fan.gain.setTargetAtTime(silence ? 0 : school * 0.035, t, 0.6);
    this.mix.ambience = silence ? 0 : 1;
    this.mix.music = silence ? 0 : 0.1 * (1 - school);
    if (this.chapterSettings) this.apply(this.chapterSettings);
  }
  signalFocus(focused: boolean) {
    const t = this.context.currentTime;
    this.future.gain.setTargetAtTime(focused ? 0.04 : 0.08, t, 0.3);
    this.voices.gain.setTargetAtTime(focused ? 0.002 : 0.006, t, 0.3);
    if (focused) this.chime("focus", 440);
  }
  openingSpace(place: FuturePlace) {
    if (this.school !== 0) return;
    const t = this.context.currentTime;
    this.future.gain.setTargetAtTime(
      place === "city"
        ? 0.22
        : place === "headquarters"
          ? 0.16
          : place === "core"
            ? 0.09
            : 0.045,
      t,
      0.8,
    );
    this.voices.gain.setTargetAtTime(
      place === "headquarters" ? 0.025 : place === "city" ? 0.012 : 0.003,
      t,
      0.8,
    );
    this.mix.music =
      place === "city"
        ? 0.035
        : place === "headquarters"
          ? 0.075
          : place === "core"
            ? 0.16
            : 0;
    if (this.chapterSettings) this.apply(this.chapterSettings);
    this.events.push({ cue: "aion.space." + place, time: t });
  }
  chime(name: string, hz = 440) {
    const c = this.context,
      t = c.currentTime,
      o = c.createOscillator(),
      g = c.createGain();
    o.frequency.value = hz;
    g.gain.setValueAtTime(0.045, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
    o.connect(g);
    g.connect(this.foley);
    o.start();
    o.stop(t + 0.8);
    o.onended = () => {
      o.disconnect();
      g.disconnect();
    };
    this.events.push({ cue: name, time: t });
  }
  motif() {
    this.chime("aion-motif", 261.63);
    this.chime("aion-overtone", 392);
  }
  stayMix(phase: StayPhase) {
    this.mix.ambience = ["chair", "notebook", "unwritten"].includes(phase)
      ? 1
      : 0.7;
    this.mix.music = ["written", "closing", "next"].includes(phase) ? 0.13 : 0;
    const soft = phase === "closing" || phase === "next";
    this.mix.rain = soft ? 0.07 : 0.14;
    this.rain.gain.setTargetAtTime(
      this.mix.rain,
      this.context.currentTime,
      soft ? 2.5 : 0.4,
    );
    if (this.chapterSettings) this.apply(this.chapterSettings);
  }
  rippleMix(phase: RipplePhase, milestones: number) {
    const school = ["sketch", "change", "echo"].includes(phase);
    this.environment(school ? 1 : 0);
    this.mix.rain = school ? 0.07 : 0;
    this.rain.gain.setTargetAtTime(
      this.mix.rain,
      this.context.currentTime,
      0.8,
    );
    this.mix.ambience =
      phase === "align" ? 0.2 : phase === "reveal" ? 0.45 : 0.7;
    this.mix.music = [
      "chair",
      "echo",
      "align",
      "approach",
      "record",
      "sketch",
      "years",
    ].includes(phase)
      ? 0
      : 0.06;
    if (phase === "milestone") this.mix.music = 0.03 + milestones * 0.015;
    if (this.chapterSettings) this.apply(this.chapterSettings);
  }
  finaleMix(phase: FinalePhase) {
    const sky = ["galaxy", "closing", "ending"].includes(phase);
    this.environment(0);
    const t = this.context.currentTime;
    this.voices.gain.setTargetAtTime(0, t, 0.7);
    this.future.gain.setTargetAtTime(sky ? 0.035 : 0.12, t, 1.5);
    this.mix.rain = ["memory", "lesson", "question"].includes(phase)
      ? 0.025
      : 0;
    this.rain.gain.setTargetAtTime(this.mix.rain, t, 1.5);
    this.mix.ambience = phase === "transform" ? 0.22 : 0.5;
    this.mix.music = sky ? 0.05 : 0.015;
    if (this.chapterSettings) this.apply(this.chapterSettings);
  }
  endingCue() {
    this.beat("paper");
  }
  override focus(f: Parameters<AudioDirector["focus"]>[0]) {
    if (this.school >= 1) super.focus(f);
  }
  override dispose() {
    this.oscillators.forEach((o) => o.stop());
    super.dispose();
  }
}
