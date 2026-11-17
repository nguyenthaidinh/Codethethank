import {
  DynamicDrawUsage,
  InstancedMesh,
  Sphere,
  type BufferGeometry,
  type Frustum,
  type Material,
  type Matrix4,
} from "three";

/** Exact skyline meshes, compacted by conservative per-building bounds.
 * Nothing inside the view is simplified; unchanged visibility needs no upload. */
export class VisibleCityBatch {
  readonly mesh: InstancedMesh;
  private readonly bounds: Sphere[];
  private readonly transforms: Matrix4[];
  private last: number[] = [];
  private next: number[] = [];
  uploads = 0;
  constructor(
    geometry: BufferGeometry,
    material: Material | Material[],
    transforms: Matrix4[],
  ) {
    geometry.computeBoundingSphere();
    this.transforms = transforms.map((matrix) => matrix.clone());
    this.bounds = transforms.map((matrix) =>
      geometry.boundingSphere!.clone().applyMatrix4(matrix),
    );
    this.mesh = new InstancedMesh(geometry, material, transforms.length);
    this.mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    this.mesh.frustumCulled = false; // Bounds are tested per instance below.
    this.transforms.forEach((matrix, i) => this.mesh.setMatrixAt(i, matrix));
    this.last = transforms.map((_, i) => i);
  }
  update(frustum: Frustum) {
    this.next.length = 0;
    for (let i = 0; i < this.bounds.length; i++)
      if (frustum.intersectsSphere(this.bounds[i])) this.next.push(i);
    if (
      this.next.length === this.last.length &&
      this.next.every((id, i) => id === this.last[i])
    )
      return;
    this.next.forEach((id, i) => this.mesh.setMatrixAt(i, this.transforms[id]));
    this.mesh.count = this.next.length;
    this.mesh.visible = this.next.length > 0;
    if (this.mesh.count) {
      this.mesh.instanceMatrix.clearUpdateRanges();
      this.mesh.instanceMatrix.addUpdateRange(0, this.mesh.count * 16);
      this.mesh.instanceMatrix.needsUpdate = true;
      this.uploads++;
    }
    [this.last, this.next] = [this.next, this.last];
  }
  dispose() {
    this.mesh.dispose();
  }
}
