import { AudioDirector } from "../cinematic/AudioDirector";
import type { SliceSave } from "../cinematic/director";
import type { Preferences } from "./preferences";

/** Adapt menu mix levels without changing the story engine's audio implementation. */
export class GameAudio extends AudioDirector {
  constructor(private preferences: Preferences) {
    super();
  }
  override apply(state: SliceSave, paused = false) {
    super.apply(state, paused);
    const t = this.context.currentTime;
    this.foley.gain.setTargetAtTime(
      state.sfx ? this.preferences.effects : 0,
      t,
      0.1,
    );
    this.ambience.gain.setTargetAtTime(
      state.sfx ? this.mix.ambience * this.preferences.effects : 0,
      t,
      0.15,
    );
    this.music.gain.setTargetAtTime(
      state.music
        ? this.mix.music * (this.preferences.music || 0.55) * this.voiceDuck
        : 0,
      t,
      0.15,
    );
  }
}
