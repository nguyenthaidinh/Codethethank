import * as T from "three";

/** Model-space surfaces only: no changes to the gameplay rig or its anchors. */
export function characterHead(teacher: boolean) {
  const geometry = new T.SphereGeometry(0.167, 64, 48);
  const p = geometry.getAttribute("position");
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i),
      y = p.getY(i),
      z = p.getZ(i);
    const jaw = T.MathUtils.smoothstep(y, -0.16, -0.025);
    const front = T.MathUtils.smoothstep(z, 0.04, 0.12);
    const bridge =
      Math.exp(-((x / 0.019) ** 2) - ((y + 0.003) / 0.052) ** 2) *
      (teacher ? 0.019 : 0.014);
    const tip =
      Math.exp(-((x / 0.023) ** 2) - ((y + 0.025) / 0.017) ** 2) *
      (teacher ? 0.018 : 0.012);
    const cheek =
      Math.exp(
        -(((Math.abs(x) - 0.075) / 0.035) ** 2) - ((y + 0.025) / 0.037) ** 2,
      ) * (teacher ? 0.007 : 0.005);
    const lips = teacher
      ? 0
      : Math.exp(-((x / 0.045) ** 2) - ((y + 0.052) / 0.018) ** 2) * 0.003;
    p.setXYZ(
      i,
      x * ((teacher ? 0.67 : 0.7) + (teacher ? 0.21 : 0.15) * jaw),
      y * 1.13,
      z * 0.93 + front * (bridge + tip + cheek + lips),
    );
  }
  geometry.computeVertexNormals();
  return geometry;
}

/** Flattened, tapered swept lock. Control points follow the scalp rather than float in front of it. */
export function hairLock(points: [number, number, number][], width: number) {
  const curve = new T.CatmullRomCurve3(points.map((p) => new T.Vector3(...p)));
  const positions: number[] = [],
    uv: number[] = [],
    indices: number[] = [];
  const rows = 20,
    cols = 8;
  for (let j = 0; j <= rows; j++) {
    const t = j / rows,
      center = curve.getPoint(t),
      tangent = curve.getTangent(t);
    const outward = center.clone().normalize();
    const across = new T.Vector3().crossVectors(tangent, outward).normalize();
    const normal = new T.Vector3().crossVectors(across, tangent).normalize();
    const taper = 0.12 + 0.88 * Math.sin(Math.PI * (0.13 + t * 0.87)) ** 0.65;
    for (let i = 0; i <= cols; i++) {
      const u = (i / cols) * 2 - 1;
      const p = center
        .clone()
        .addScaledVector(across, u * width * taper)
        .addScaledVector(normal, (1 - u * u) * 0.008 * taper);
      positions.push(p.x, p.y, p.z);
      uv.push(i / cols, t);
      if (j < rows && i < cols) {
        const a = j * (cols + 1) + i,
          b = a + cols + 1;
        indices.push(a, a + 1, b, b, a + 1, b + 1);
      }
    }
  }
  const geometry = new T.BufferGeometry();
  geometry.setAttribute("position", new T.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export function sleeveGeometry(upper: boolean) {
  const rings = upper
    ? [
        [0.066, 0],
        [0.06, 0.027],
        [0.043, 0.049],
        [0.02, 0.061],
        [0, 0.066],
        [-0.06, 0.07],
        [-0.11, 0.067],
        [-0.16, 0.061],
        [-0.205, 0.056],
        [-0.245, 0.052],
        [-0.275, 0.045],
      ]
    : [
        [0.015, 0.046],
        [-0.025, 0.052],
        [-0.12, 0.044],
        [-0.205, 0.033],
        [-0.24, 0.032],
      ];
  const geometry = new T.LatheGeometry(
    rings
      .slice()
      .reverse()
      .map(([y, r]) => new T.Vector2(r, y)),
    24,
  );
  geometry.scale(1, 1, 0.88);
  return geometry;
}

/** Five separate digits attached to a shallow palm; rests in the existing forearm coordinate system. */
export function handGeometry(side: number) {
  const parts: T.BufferGeometry[] = [];
  const palm = new T.SphereGeometry(1, 20, 12);
  palm.scale(0.029, 0.039, 0.016);
  palm.translate(0, -0.265, 0.008);
  parts.push(palm);
  const lengths = [0.045, 0.057, 0.054, 0.041];
  lengths.forEach((length, i) => {
    const finger = new T.CapsuleGeometry(0.007, length - 0.014, 4, 8);
    finger.rotateX(-0.2 - i * 0.035);
    finger.rotateZ((i - 1.5) * 0.045);
    finger.translate((i - 1.5) * 0.014, -0.291 - length / 2, 0.013);
    parts.push(finger);
  });
  const thumb = new T.CapsuleGeometry(0.009, 0.025, 4, 8);
  thumb.rotateZ(-side * 0.65);
  thumb.rotateX(-0.4);
  thumb.translate(-side * 0.031, -0.279, 0.025);
  parts.push(thumb);
  return parts;
}
