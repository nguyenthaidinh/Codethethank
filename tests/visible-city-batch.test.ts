import { describe, it, expect } from "vitest";
import {
  BoxGeometry,
  Frustum,
  Matrix4,
  MeshBasicMaterial,
  PerspectiveCamera,
  Vector3,
} from "three";
import { VisibleCityBatch } from "../src/future/VisibleCityBatch";

function view(x = 0) {
  const camera = new PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.x = x;
  camera.lookAt(x, 0, -10);
  camera.updateMatrixWorld();
  return new Frustum().setFromProjectionMatrix(
    new Matrix4().multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse,
    ),
  );
}
describe("per-building skyline culling", () => {
  it("packs only visible instances with original transforms and does not upload unchanged visibility", () => {
    const geometry = new BoxGeometry(2, 2, 2),
      material = new MeshBasicMaterial();
    const matrices = [
      new Matrix4().makeTranslation(0, 0, -10),
      new Matrix4().makeTranslation(50, 0, -10),
      new Matrix4().makeTranslation(0, 0, 10),
    ];
    const batch = new VisibleCityBatch(geometry, material, matrices);
    batch.update(view());
    expect(batch.mesh.count).toBe(1);
    expect(batch.uploads).toBe(1);
    const m = new Matrix4();
    batch.mesh.getMatrixAt(0, m);
    expect(m.equals(matrices[0])).toBe(true);
    const version = batch.mesh.instanceMatrix.version;
    batch.update(view());
    expect(batch.mesh.instanceMatrix.version).toBe(version);
    batch.update(view(50));
    expect(batch.mesh.count).toBe(1);
    batch.mesh.getMatrixAt(0, m);
    expect(m.equals(matrices[1])).toBe(true);
    batch.update(view(1000));
    expect(batch.mesh.visible).toBe(false);
    expect(batch.mesh.count).toBe(0);
    batch.update(view());
    expect(batch.mesh.visible).toBe(true);
    expect(batch.mesh.count).toBe(1);
    batch.dispose();
    geometry.dispose();
    material.dispose();
  });
  it("keeps scaled buildings intersecting a frustum edge instead of culling their centres", () => {
    const geometry = new BoxGeometry(2, 2, 2),
      material = new MeshBasicMaterial();
    const matrix = new Matrix4().makeScale(3, 4, 3).setPosition(7, 0, -10);
    expect(view().containsPoint(new Vector3(7, 0, -10))).toBe(false);
    const batch = new VisibleCityBatch(geometry, material, [matrix]);
    batch.update(view());
    expect(batch.mesh.count).toBe(1);
    expect(batch.mesh.visible).toBe(true);
    batch.dispose();
    geometry.dispose();
    material.dispose();
  });
});
