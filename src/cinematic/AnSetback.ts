import * as T from "three";
import type { NarrativeActors, NarrativeRig } from "../art/NarrativeActors";

type XYZ = [number, number, number];
export const AN_SETBACK = {
  duration: 17,
  showAnAt: 4,
  start: 8,
  raisedAt: 8.42,
  impactAt: 8.62,
  releaseAt: 9.1,
  quietAt: 12,
  rest: [-0.64, 0.91, -0.54] as XYZ,
  raised: [-0.84, 1.22, -0.23] as XYZ,
  contact: [-0.88, 0.91, -0.29] as XYZ,
  settled: [-0.83, 0.91, -0.3] as XYZ,
};
const smooth = (value: number) => T.MathUtils.smootherstep(value, 0, 1);
const mix = (a: XYZ, b: XYZ, p: number): XYZ =>
  a.map((value, i) => T.MathUtils.lerp(value, b[i], p)) as XYZ;

/** A single lift, strike and release, sampled by time so pause cannot repeat it. */
export function anSetbackPose(time: number, reduced = false, attention = 0) {
  const t = Math.max(0, time),
    timing = AN_SETBACK;
  const lift = smooth((t - timing.start) / (timing.raisedAt - timing.start));
  const strike = smooth(
    (t - timing.raisedAt) / (timing.impactAt - timing.raisedAt),
  );
  const tension = smooth((t - 6.4) / 1.4);
  const release = smooth((t - timing.releaseAt) / 1.8);
  const slump = reduced ? 1 : smooth((t - 9.8) / (timing.quietAt - 9.8));
  const listening = T.MathUtils.clamp(attention, 0, 1);
  const rebound =
    t > timing.impactAt && t < 8.92
      ? Math.sin((Math.PI * (t - timing.impactAt)) / (8.92 - timing.impactAt)) *
        0.014
      : 0;
  // Draw back along a small arc, then let the elbow lead the short downward strike.
  const control: XYZ = [-0.78, 1.04, -0.18];
  const drawnBack = mix(
    mix(timing.rest, control, lift),
    mix(control, timing.raised, lift),
    lift,
  );
  const hand = mix(drawnBack, timing.contact, strike);
  hand[1] += rebound;
  const target = reduced ? timing.settled : mix(hand, timing.settled, release);
  const sadness = 0.8 * slump * (1 - 0.75 * listening);
  const frustration = reduced ? 0 : 0.85 * tension * (1 - release);
  const bow = slump * (1 - listening);
  return {
    hand: target,
    lift: reduced ? 0 : lift * (1 - strike),
    curl: reduced
      ? 0.1
      : 0.18 + 0.68 * tension * (1 - release) - 0.08 * release,
    head: mix(
      [
        reduced
          ? 0.38
          : 0.16 - 0.05 * frustration + 0.07 * strike + 0.15 * slump,
        -0.08,
        -0.025,
      ],
      [0.18, -0.5, -0.02],
      listening,
    ),
    bodyY: 0.59 - 0.009 * bow,
    bodyLean: 0.18 + 0.055 * bow,
    concern: 0.2 + 0.28 * slump,
    frustration,
    sadness,
    gaze: [-0.15 - 0.8 * listening, 0.3 + 1.6 * bow] as [number, number],
  };
}

export function applyAnSetback(
  actors: Pick<NarrativeActors, "reach" | "articulate">,
  rig: NarrativeRig,
  time: number,
  reduced: boolean,
  attention = 0,
) {
  const pose = anSetbackPose(time, reduced, attention);
  // Apply an absolute seated pose, retaining both planted feet as his shoulders sink.
  rig.body.position.y = pose.bodyY;
  rig.body.rotation.x = pose.bodyLean;
  const thigh = -Math.acos(
    T.MathUtils.clamp((pose.bodyY - 0.4425) / 0.4, 0, 1),
  );
  rig.legs.forEach((leg) => {
    leg.rotation.x = thigh - pose.bodyLean;
  });
  rig.shins.forEach((shin) => {
    shin.rotation.x = -thigh;
  });
  actors.articulate(rig, {
    hands: [0.18, pose.curl],
    wrists: [0, 0],
    palmRoll: [0, -pose.sadness * 1.5],
    concern: pose.concern,
    warmth: 0,
    gaze: pose.gaze,
    frustration: pose.frustration,
    sadness: pose.sadness,
  });
  actors.reach(rig, 1, new T.Vector3(...pose.hand));
  rig.head.rotation.set(...pose.head);
}
