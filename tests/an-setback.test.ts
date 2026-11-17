import { describe, expect, it } from "vitest";
import * as T from "three";
import {
  AN_SETBACK,
  anSetbackPose,
  applyAnSetback,
} from "../src/cinematic/AnSetback";
import type { ActingFrame } from "../src/art/CharacterActing";
import { TEACHER_ENTRANCE } from "../src/cinematic/TeacherEntrance";
import { anSetbackShot } from "../src/cinematic/ClassroomCinematography";
import { classroomReview } from "../src/verdict/state";
import { verdictCaption } from "../src/verdict/story";

describe("An's setback before the teacher enters", () => {
  it("lifts once, contacts the tabletop, then releases into a quiet hold", () => {
    const first = anSetbackPose(0);
    const raised = anSetbackPose(AN_SETBACK.raisedAt);
    const contact = anSetbackPose(AN_SETBACK.impactAt);
    const quiet = anSetbackPose(AN_SETBACK.quietAt);
    expect(raised.hand[1] - first.hand[1]).toBeGreaterThan(0.22);
    expect(raised.hand[1] - first.hand[1]).toBeLessThan(0.34);
    expect(contact.hand).toEqual(AN_SETBACK.contact);
    expect(contact.hand[1]).toBeGreaterThan(0.875); // Desk surface; no penetration.
    expect(quiet.hand).toEqual(AN_SETBACK.settled);
    expect(quiet.curl).toBeLessThan(contact.curl);
    for (const t of [12, 14, 17]) expect(anSetbackPose(t)).toEqual(quiet);
    expect(AN_SETBACK.duration - AN_SETBACK.quietAt).toBeGreaterThanOrEqual(5);
    expect(anSetbackPose(8.3)).toEqual(anSetbackPose(8.3));
  });
  it("changes from frustration to sadness and looks up only when she is nearby", () => {
    const angry = anSetbackPose(AN_SETBACK.raisedAt);
    const sad = anSetbackPose(AN_SETBACK.quietAt);
    const listening = anSetbackPose(AN_SETBACK.duration, false, 1);
    expect(angry.frustration).toBeGreaterThan(0.7);
    expect(angry.sadness).toBe(0);
    expect(sad.frustration).toBe(0);
    expect(sad.sadness).toBeGreaterThan(0.7);
    expect(sad.curl).toBeLessThan(0.2);
    expect(sad.head[0]).toBeGreaterThan(angry.head[0] + 0.15);
    expect(sad.bodyLean).toBeGreaterThan(angry.bodyLean);
    expect(listening.head[0]).toBeLessThan(sad.head[0]);
    expect(listening.sadness).toBeLessThan(sad.sadness);
  });
  it("keeps his feet planted and avoids posture drift while the quiet pose holds", () => {
    const root = new T.Group(),
      body = new T.Group(),
      head = new T.Group();
    root.add(body);
    body.add(head);
    const legs = [-0.1, 0.1].map((x) => {
      const leg = new T.Group();
      leg.position.x = x;
      body.add(leg);
      return leg;
    });
    const shins = legs.map((leg) => {
      const shin = new T.Group();
      shin.position.y = -0.4;
      leg.add(shin);
      return shin;
    });
    const rig = {
      root,
      body,
      head,
      legs,
      shins,
      arms: [new T.Group(), new T.Group()],
    };
    const frames: ActingFrame[] = [];
    const actors = {
      articulate: (_rig: unknown, frame: ActingFrame) => frames.push(frame),
      reach: () => {},
    };
    applyAnSetback(actors, rig, AN_SETBACK.raisedAt, false);
    expect(frames.at(-1)?.frustration).toBeGreaterThan(0.7);
    for (let i = 0; i < 100; i++)
      applyAnSetback(actors, rig, AN_SETBACK.quietAt, false);
    expect(frames.at(-1)?.sadness).toBeGreaterThan(0.7);
    expect(frames.at(-1)?.palmRoll?.[1]).toBeLessThan(-0.9);
    expect(body.rotation.x).toBeCloseTo(0.235);
    for (const shin of shins)
      expect(shin.localToWorld(new T.Vector3(0, -0.4425, 0.05)).y).toBeCloseTo(
        0,
        8,
      );
  });
  it("keeps the reduced-motion pose still and composes both viewport shapes", () => {
    expect(anSetbackPose(0, true)).toEqual(anSetbackPose(9, true));
    for (const portrait of [false, true]) {
      const shot = anSetbackShot(portrait);
      expect(shot.eye[1]).toBeGreaterThan(shot.at[1]);
      expect(shot.at[1]).toBeLessThan(1.2);
      expect(shot.fov).toBeGreaterThanOrEqual(46);
      expect(anSetbackShot(portrait, 12)).toEqual(anSetbackShot(portrait, 17));
      expect(anSetbackShot(portrait, 4, true)).toEqual(
        anSetbackShot(portrait, 17, true),
      );
    }
  });
  it("shows the strike and silence before two readable greeting lines", () => {
    const reaction = {
      ...classroomReview,
      phase: "reaction" as const,
      selected: "an" as const,
    };
    expect(verdictCaption(reaction, 0, null)).toContain("NOT RECOMMENDED");
    expect(verdictCaption(reaction, 8.7, null)).toContain(
      "đập xuống bàn một lần",
    );
    expect(verdictCaption(reaction, 13, null)).toContain("chỉ còn tiếng mưa");
    const entry = { ...reaction, phase: "teacher_enter" as const };
    expect(verdictCaption(entry, TEACHER_ENTRANCE.greetAt, null)).toContain(
      "Em vẫn chưa về sao",
    );
    expect(verdictCaption(entry, TEACHER_ENTRANCE.askAt, null)).toContain(
      "Có chỗ nào chưa làm được",
    );
    expect(
      TEACHER_ENTRANCE.duration - TEACHER_ENTRANCE.askAt,
    ).toBeGreaterThanOrEqual(5);
  });
});
