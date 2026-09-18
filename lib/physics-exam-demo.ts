// physics-exam-demo.ts
//
// Generates a small, original (non-Cambridge) synthetic practice paper so a
// teacher can try the full paper/answer/mark workflow without needing to
// upload a real past paper first. Relocated from physics-exam-studio's
// src/services/demo.ts with the import path updated to StudyTrack's flat
// lib/ convention; content unchanged and already verified (physics
// independently checked: x²=0.01 m² for x=0.10m, E=½×200×0.01=1 J).

import type { Paper } from "./physics-extraction-schema";

const numeric = { accepted: ["F = ma = 5 × 2 = 10 N"], unitRequired: true, relativeTolerance: .005, absoluteTolerance: 0, range: null };

export function demoPaper(): Paper {
  return {
    id: crypto.randomUUID(), title: "Forces & energy · guided practice", syllabus: "0625", status: "ready",
    createdAt: new Date().toISOString(), revision: 1, demo: true, files: [],
    warnings: ["Original synthetic questions. This is not a Cambridge past paper."],
    questions: [
      { id: "5(a)", text: "A 5.0 kg trolley accelerates at 2.0 m/s². Calculate the resultant force. Include a unit.", context: "A trolley moves along a straight, level track.", marks: 1, topic: "Forces & motion", sourcePages: [1], references: [], issues: [] },
      { id: "5(b)", text: "Explain why the trolley moves at constant velocity when the resultant force becomes zero.", context: "", marks: 2, topic: "Forces & motion", sourcePages: [1], references: [], issues: [] },
      { id: "6(a)", text: "Name the energy store associated with a stretched spring.", context: "", marks: 1, topic: "Energy", sourcePages: [1], references: [], issues: [] },
      { id: "6(b)", text: "A spring has stiffness 200 N/m and extension 0.10 m. Calculate extension squared, then elastic energy using E = ½kx².", context: "Enter the evidence for each marking point below.", marks: 2, topic: "Energy", sourcePages: [1], references: [], issues: [] },
    ],
    schemes: [
      { questionId: "5(a)", raw: numeric.accepted[0], expected: "10 N", marks: 1, kind: "numeric", numeric, accepted: [], points: [], notes: [], unresolvedRules: [], finalAnswerAwardsAll: false, sourcePages: [1] },
      { questionId: "5(b)", raw: "No acceleration; velocity remains constant.", expected: "With zero resultant force there is no acceleration, so velocity remains constant.", marks: 2, kind: "manual", numeric: null, accepted: [], points: [{ id: "B1", description: "Zero acceleration", marks: 1, kind: "manual", accepted: [], numeric: null, dependsOn: [] }, { id: "B2", description: "Velocity remains constant", marks: 1, kind: "manual", accepted: [], numeric: null, dependsOn: [] }], notes: [], unresolvedRules: [], finalAnswerAwardsAll: false, sourcePages: [1] },
      { questionId: "6(a)", raw: "elastic potential energy", expected: "Elastic potential energy", marks: 1, kind: "exact", numeric: null, accepted: ["elastic potential energy", "elastic potential", "elastic strain energy"], points: [], notes: [], unresolvedRules: [], finalAnswerAwardsAll: false, sourcePages: [1] },
      { questionId: "6(b)", raw: "x² = 0.010 m²; E = 1.0 J", expected: "1.0 J", marks: 2, kind: "stepped", numeric: null, accepted: [], points: [
        { id: "B1", description: "Calculate x²", marks: 1, kind: "numeric", accepted: [], numeric: { ...numeric, accepted: ["0.01 m^2"] }, dependsOn: [] },
        { id: "A1", description: "Calculate elastic energy", marks: 1, kind: "numeric", accepted: [], numeric: { ...numeric, accepted: ["1 J"] }, dependsOn: ["B1"] },
      ], notes: [], unresolvedRules: [], finalAnswerAwardsAll: false, sourcePages: [1] },
    ],
  };
}
