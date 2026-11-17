# Teacher movement pass

Scope: one implementation pass for entrance gait, chair handling and sitting. Camera, lighting, audio timings, story/checkpoints and letter files are outside the owned changes.

- TeacherLocomotion.ts: distance-based stance/swing gait; short foot placement steps; two-link leg IK; ankle orientation; lateral weight shift and arm counter-swing; knee unlocking, hip travel and a small seat-settling compression. Poses are analytic, not accumulated.
- NarrativeActors.ts: separate ankle groups around existing shoe meshes; existing mesh positions remain identical at rest. Reset/batching respects the ankle joints.
- ClassroomPerformance.ts: integrates the classroom-only movement; prepares the grip during the preceding line. Intentional choreography revision: release the chair just after the1.25s pull (at1.3s), bring the hand to the desk, then sit during the unchanged2.6–3.9s interval. The previous late-release tests were updated to assert this new ordering, not removed.
- WorldRenderer.ts: passes the existing beat into its already-gated classroom performance call. No camera or light edit.

Checks: typecheck, lint, production build;8targeted movement/hand tests. A short desktop browser smoke checks teacher_enter→discussion→chair→question and captures entrance/sit/seated frames. No long E2E campaign, mobile/device pass or new screencast in this iteration, per the request to prioritize implementation and direct playtesting.

An earlier selected run caught unreachable foot placement during preparation; corrected by unlocking the knees and placing the feet in smaller steps. The old whole-source hash guard also reports FinaleControls.tsx drift because the other session is changing the letter UI. Those files were not edited or reverted here; scope.json lists concurrent changes. The full repository suite is not claimed PASS.

Preview: http://127.0.0.1:4218/_motion-preview.html — isolated local checkpoint from the teacher's entrance; does not reset5173/4173 progress. Production artifact: dist-motion-review. No push/deploy.
