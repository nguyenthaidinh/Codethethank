import * as T from "three";

export class ResearchLighting {
  readonly root = new T.Group();
  private key = new T.DirectionalLight("#ffe4c5", 2.1);
  private rim = new T.DirectionalLight("#9ac8df", 1.1);
  private screen = new T.PointLight("#91b8cc", 1.1, 2.8, 2);
  constructor() {
    this.key.position.set(1.6, 3.1, -3.6);
    this.key.target.position.set(-0.5, 1.5, 0.38);
    this.rim.position.set(-2, 3, 2);
    this.rim.target.position.set(-0.5, 1.4, 0.38);
    this.screen.position.set(-0.4, 1.65, -0.8);
    this.root.add(
      this.key,
      this.key.target,
      this.rim,
      this.rim.target,
      this.screen,
    );
  }
  update(active: boolean, year: number) {
    this.root.visible = active;
    if (!active) return;
    this.key.color.set(year === 2029 ? "#ffe4c5" : "#dce8f0");
    this.screen.intensity = year === 2029 ? 0.75 : 1.15;
  }
}

/** Three-quarter face angle beside the monitor, rather than behind An's chair. */
export function researchShot(
  time: number,
  portrait: boolean,
  reduced: boolean,
  reading: boolean,
) {
  const p = reduced ? 1 : Math.min(1, Math.max(0, time / 7));
  const drift = p * p * p * (p * (p * 6 - 15) + 10);
  const eye: [number, number, number] = portrait
    ? [3.7 - 0.15 * drift, 2.05, -0.15]
    : [3.05 - 0.15 * drift, 1.85 - 0.04 * drift, -0.2];
  const at: [number, number, number] = portrait
    ? [-0.23, 1.2, -0.15]
    : [-0.05, 1.25, -0.16];
  return { eye, at, fov: portrait ? 54 : reading ? 46 : 43 };
}
