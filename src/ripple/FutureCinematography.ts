import * as T from "three";
import { chairMatchShot, chairReturnHold } from "../cinematic/ChairMatchCut";
import type { RippleSave } from "./state";
import { futureArrivalCue } from "./FutureArrival";

type XYZ = [number, number, number];
const ease = (t: number) => T.MathUtils.smoothstep(t, 0, 1);
const mix = (a: XYZ, b: XYZ, p: number): XYZ =>
  a.map((n, i) => T.MathUtils.lerp(n, b[i], p)) as XYZ;
const together = (portrait: boolean) => ({
  eye: (portrait ? [3.8, 1.94, -4.3] : [3.8, 1.86, -3.2]) as XYZ,
  at: [0.3, 1.39, 0.28] as XYZ,
  fov: portrait ? 53 : 40,
});

/** Keep the original sound/low insert, then rise outside the desk to eye level. */
export function futureConversationShot(
  s: RippleSave,
  time: number,
  portrait: boolean,
  reduced: boolean,
) {
  if (s.phase === "approach") {
    const p = reduced ? 1 : ease(time / 6);
    return {
      eye: mix([5.2, 2, -3.7], [4.6, 1.92, -3.5], p),
      at: [1.25, 1.43, 0.5] as XYZ,
      fov: portrait ? 57 : 46,
    };
  }
  if (s.phase === "chair") {
    const insert = chairMatchShot(0, portrait);
    const end = together(portrait);
    if (reduced) return insert;
    const arc = ease((time - chairReturnHold) / 4.2);
    const lift = ease((time - chairReturnHold) / 1.8);
    const eye = mix(insert.eye, end.eye, arc);
    const at = mix(insert.at, end.at, arc);
    eye[1] = T.MathUtils.lerp(insert.eye[1], end.eye[1], lift);
    at[1] = T.MathUtils.lerp(insert.at[1], end.at[1], lift);
    return { eye, at, fov: T.MathUtils.lerp(insert.fov, end.fov, arc) };
  }
  if (s.phase === "reflection" || (s.phase === "reconstruct" && !s.selected)) {
    const shot = together(portrait);
    const p = reduced ? 0 : ease(time / 6);
    shot.eye[0] -= p * 0.12;
    shot.eye[2] += p * 0.12;
    return shot;
  }
  return null;
}

/** Exclusive to Ripple 2046: warm faces, cool separation, a quiet desk bounce. */
export class FutureLighting2046 {
  readonly root = new T.Group();
  private key = new T.DirectionalLight("#ffdab0", 2.15);
  private rim = new T.DirectionalLight("#a7d4ed", 1.5);
  private bounce = new T.PointLight("#dfd5bb", 0.9, 4, 2);
  constructor() {
    this.key.position.set(2.8, 3.9, -2.6);
    this.key.target.position.set(0.45, 1.4, 0.3);
    this.rim.position.set(-2.5, 3.7, 3);
    this.rim.target.position.set(0.4, 1.35, 0.3);
    this.bounce.position.set(0.2, 2.1, -0.65);
    this.root.add(
      this.key,
      this.key.target,
      this.rim,
      this.rim.target,
      this.bounce,
    );
  }
  update(
    active: boolean,
    phase: RippleSave["phase"],
    time: number,
    reduced = false,
  ) {
    this.root.visible = active;
    if (!active) return;
    const arrival = futureArrivalCue(phase, time, reduced);
    // Light settles gently with the decision to stay; never a brightness flash.
    const intimate = [
      "chair",
      "reflection",
      "reconstruct",
      "principle",
    ].includes(phase);
    const settle = phase === "chair" ? ease((time - 1.4) / 3.5) : 1;
    this.key.intensity =
      0.8 + 1.35 * arrival.architecture + (intimate ? 0.2 * settle : 0);
    this.rim.intensity = 0.3 + 1.2 * arrival.core;
    this.bounce.intensity =
      0.2 + 0.7 * arrival.desk + (intimate ? 0.25 * settle : 0);
  }
}
