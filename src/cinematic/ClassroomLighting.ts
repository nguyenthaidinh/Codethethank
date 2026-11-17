import * as T from "three";

/** Rainy daylight with a soft, local desk bounce. Classroom scene only:
 * no exposure changes, post-processing or additional shadow maps. */
export class ClassroomLighting {
  private portrait = new T.SpotLight("#fff5eb", 22, 5.5, Math.PI / 4, 0.85, 2);

  constructor(
    scene: T.Scene,
    windowLight: T.DirectionalLight,
    bounce: T.DirectionalLight,
    dialogue: T.DirectionalLight,
  ) {
    const ambient = scene.children.find(
      (light): light is T.HemisphereLight => light instanceof T.HemisphereLight,
    );
    if (ambient) {
      ambient.color.set("#b8d4e0");
      ambient.groundColor.set("#334655");
      ambient.intensity = 0.6;
    }
    windowLight.color.set("#c1dbe8");
    windowLight.intensity = 1.8;
    windowLight.position.set(-5, 4, 1);
    windowLight.target.position.set(0.2, 1, 0);
    bounce.color.set("#b7c8d4");
    bounce.intensity = 0.4;
    dialogue.color.set("#ffe9d2");

    // A broad penumbra shares the same soft source across both faces. Falloff
    // leaves the back wall quiet instead of adding another room-wide wash.
    this.portrait.position.set(0.2, 2.3, -2);
    this.portrait.target.position.set(0.25, 1.4, 0);
    this.portrait.castShadow = false;
    scene.add(this.portrait, this.portrait.target);
  }

  update(desk: T.PointLight, dialogue: T.DirectionalLight) {
    // Called after the existing per-beat cue values have been assigned, so
    // this is deterministic on reload and never accumulates across frames.
    desk.intensity *= 0.2;
    dialogue.intensity *= 0.65;
  }

  dispose() {
    this.portrait.removeFromParent();
    this.portrait.target.removeFromParent();
    this.portrait.dispose();
  }
}
