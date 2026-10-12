import asSyllabus from "@/lib/as-physics-syllabus.json";
import { igcsePhysicsSyllabus } from "@/lib/physics-syllabus";

// The syllabus checklists students tick off, one per physics level. IGCSE
// objectives are core or supplement; the AS syllabus has no such split, so
// its objectives carry no type. Both come from the syllabus documents:
// lib/physics-syllabus.ts (generated) and lib/as-physics-syllabus.json.
export type ChecklistObjective = { id: string; text: string; type?: "core" | "supplement" };
export type ChecklistTopic = { id: string; title: string; groups: Array<{ id: string; title: string; objectives: ChecklistObjective[] }> };
export type ChecklistLevel = "igcse" | "as";

export const asPhysicsChecklist: ChecklistTopic[] = asSyllabus.topics.map((topic) => ({
  id: topic.id,
  title: topic.title,
  groups: topic.groups.map((group) => ({
    id: group.id,
    title: group.title,
    objectives: group.objectives.map((objective) => ({ id: objective.id, text: objective.text })),
  })),
}));

export const checklistFor = (level: ChecklistLevel): ChecklistTopic[] =>
  level === "as" ? asPhysicsChecklist : igcsePhysicsSyllabus;

const objectiveIds = {
  igcse: new Set(igcsePhysicsSyllabus.flatMap((topic) => topic.groups.flatMap((group) => group.objectives.map((objective) => objective.id)))),
  as: new Set(asPhysicsChecklist.flatMap((topic) => topic.groups.flatMap((group) => group.objectives.map((objective) => objective.id)))),
};

export const isChecklistObjective = (level: ChecklistLevel, id: string) => objectiveIds[level].has(id);
