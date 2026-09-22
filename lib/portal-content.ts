// Shared portal types and the Cambridge syllabus unit listings used across
// the teacher and student portals. Extracted verbatim from app/page.tsx.

export type TeacherView =
  | "dashboard"
  | "stage7" | "stage8" | "stage9"
  | "physicsIgcse" | "physicsAs" | "physicsExam"
  | "papers" | "submissions" | "students";
export type AssignmentSummary = {
  id: string;
  title: string;
  subject: string;
  syllabus: string;
  paper_mode: "structured" | "multiple_choice";
  due_date: string | null;
  status: string;
  lower_secondary_stage?: number | null;
  is_practice_library?: boolean;
  source_year?: string | null;
  resource_kind?: "exam" | "homework";
  content_start_page?: number | null;
  content_end_page?: number | null;
};
export type StudentPaperStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "awaiting_review"
  | "result_available";
export const stage7Chapters = [
  { id: "integers", strand: "Number", title: "Integers and place value", summary: "Ordering, rounding, operations and negative numbers", icon: "±" },
  { id: "fractions", strand: "Number", title: "Fractions, decimals and percentages", summary: "Equivalence, comparison and calculations", icon: "%" },
  { id: "ratio", strand: "Number", title: "Ratio and proportion", summary: "Sharing, rates and real-life proportion", icon: ":" },
  { id: "powers", strand: "Number", title: "Powers and roots", summary: "Squares, cubes, roots and index notation", icon: "²" },
  { id: "expressions", strand: "Algebra", title: "Expressions and formulae", summary: "Terms, substitution and simplifying expressions", icon: "x" },
  { id: "equations", strand: "Algebra", title: "Equations and inequalities", summary: "Solving and representing simple relationships", icon: "=" },
  { id: "sequences", strand: "Algebra", title: "Sequences and functions", summary: "Term-to-term rules and pattern reasoning", icon: "↗" },
  { id: "geometry", strand: "Geometry and Measure", title: "Angles and geometrical reasoning", summary: "Angle facts, constructions and properties", icon: "△" },
  { id: "measure", strand: "Geometry and Measure", title: "Perimeter, area and volume", summary: "Measures, formulae and compound shapes", icon: "□" },
  { id: "transformations", strand: "Geometry and Measure", title: "Position and transformations", summary: "Coordinates, symmetry and transformations", icon: "◇" },
  { id: "statistics", strand: "Statistics and Probability", title: "Statistics and data", summary: "Representing, interpreting and comparing data", icon: "▥" },
  { id: "probability", strand: "Statistics and Probability", title: "Probability", summary: "Probability scales, outcomes and experiments", icon: "◉" },
];

export type LowerSecondaryUnit = { id: string; strand: string; title: string; summary: string; icon: string };
export const stage8Units: LowerSecondaryUnit[] = [
  { id:"s8-u1", strand:"Number", title:"1. Integers", summary:"Integer operations, factors, multiples, primes, roots and indices", icon:"±" },
  { id:"s8-u2", strand:"Algebra", title:"2. Expressions, formulae and equations", summary:"Simplifying, substituting, expanding and solving", icon:"x" },
  { id:"s8-u3", strand:"Number", title:"3. Place value and rounding", summary:"Place value, estimation and accurate rounding", icon:"≈" },
  { id:"s8-u4", strand:"Number", title:"4. Decimals", summary:"Decimal operations and problem solving", icon:"." },
  { id:"s8-u5", strand:"Geometry and Measure", title:"5. Angles and constructions", summary:"Angle properties and accurate constructions", icon:"∠" },
  { id:"s8-u6", strand:"Statistics", title:"6. Collecting data", summary:"Sampling, questionnaires and data collection", icon:"▥" },
  { id:"s8-u7", strand:"Number", title:"7. Fractions", summary:"Equivalent fractions and fraction calculations", icon:"½" },
  { id:"s8-u8", strand:"Geometry and Measure", title:"8. Shapes and symmetry", summary:"Properties, congruence and symmetry", icon:"◇" },
  { id:"s8-u9", strand:"Algebra", title:"9. Sequences and functions", summary:"Rules, terms, functions and patterns", icon:"↗" },
  { id:"s8-u10", strand:"Number", title:"10. Percentages", summary:"Percentage calculations and applications", icon:"%" },
  { id:"s8-u11", strand:"Algebra", title:"11. Graphs", summary:"Coordinates, relationships and interpreting graphs", icon:"⌁" },
  { id:"s8-u12", strand:"Number", title:"12. Ratio and proportion", summary:"Ratios, rates and proportional reasoning", icon:":" },
  { id:"s8-u13", strand:"Probability", title:"13. Probability", summary:"Outcomes, experiments and probability models", icon:"◉" },
  { id:"s8-u14", strand:"Geometry and Measure", title:"14. Position and transformation", summary:"Coordinates and geometric transformations", icon:"↻" },
  { id:"s8-u15", strand:"Geometry and Measure", title:"15. Distance, area and volume", summary:"Measurement, formulae and compound problems", icon:"□" },
  { id:"s8-u16", strand:"Statistics", title:"16. Interpreting and discussing results", summary:"Analyse, compare and communicate conclusions", icon:"▤" },
];
export const stage9Units: LowerSecondaryUnit[] = [
  { id:"s9-u1", strand:"Number", title:"1. Number and calculation", summary:"Number properties, operations and problem solving", icon:"±" },
  { id:"s9-u2", strand:"Algebra", title:"2. Expressions and formulae", summary:"Manipulating expressions and using formulae", icon:"x" },
  { id:"s9-u3", strand:"Number", title:"3. Decimals, percentages and rounding", summary:"Accuracy, percentages and decimal calculations", icon:"%" },
  { id:"s9-u4", strand:"Algebra", title:"4. Equations and inequalities", summary:"Solve and represent equations and inequalities", icon:"=" },
  { id:"s9-u5", strand:"Geometry and Measure", title:"5. Angles", summary:"Angle relationships and geometrical reasoning", icon:"∠" },
  { id:"s9-u6", strand:"Statistics", title:"6. Statistical investigations", summary:"Plan investigations and work with data", icon:"▥" },
  { id:"s9-u7", strand:"Geometry and Measure", title:"7. Shapes and measurements", summary:"Properties, constructions and measurement", icon:"△" },
  { id:"s9-u8", strand:"Number", title:"8. Fractions", summary:"Fraction calculations and applications", icon:"½" },
  { id:"s9-u9", strand:"Algebra", title:"9. Sequences and functions", summary:"Generate, describe and analyse relationships", icon:"↗" },
  { id:"s9-u10", strand:"Algebra", title:"10. Graphs", summary:"Plot, interpret and use graphs", icon:"⌁" },
  { id:"s9-u11", strand:"Number", title:"11. Ratio and proportion", summary:"Proportional change, scale and rates", icon:":" },
  { id:"s9-u12", strand:"Probability", title:"12. Probability", summary:"Combined outcomes and experimental probability", icon:"◉" },
  { id:"s9-u13", strand:"Geometry and Measure", title:"13. Position and transformation", summary:"Coordinates, vectors and transformations", icon:"↻" },
  { id:"s9-u14", strand:"Geometry and Measure", title:"14. Volume, surface area and symmetry", summary:"Three-dimensional measures and symmetry", icon:"▣" },
  { id:"s9-u15", strand:"Statistics", title:"15. Interpreting and discussing results", summary:"Evaluate evidence and communicate conclusions", icon:"▤" },
];

export type PhysicsUnit = { id: string; title: string; summary: string; icon: string; available: boolean };
export const igcsePhysicsUnits: PhysicsUnit[] = [
  { id:"igcse-u1", title:"1.1 Physical quantities & measurement", summary:"SI units, conversions, precision and error types", icon:"⚖", available:true },
  { id:"igcse-u2", title:"1.2 Motion", summary:"Speed, velocity, acceleration and motion graphs", icon:"→", available:true },
  { id:"igcse-u3", title:"1.3–1.4 Mass, weight & density", summary:"Mass, weight, gravity and density calculations", icon:"◆", available:true },
  { id:"igcse-u4", title:"1.5 Forces & their effects", summary:"Hooke's law, turning effects and equilibrium", icon:"↕", available:true },
  { id:"igcse-u5", title:"1.6 Momentum", summary:"Momentum and conservation of momentum", icon:"⇒", available:true },
  { id:"igcse-u6", title:"1.7 Energy, work & power", summary:"Energy transfers, work done and power", icon:"⚡", available:true },
  { id:"igcse-u7", title:"1.8 Pressure", summary:"Pressure in solids, liquids and gases", icon:"▼", available:true },
  { id:"igcse-u8", title:"2.1 Kinetic model of matter", summary:"States of matter and particle behaviour", icon:"◌", available:true },
  { id:"igcse-u9", title:"2.2 Thermal properties & temperature", summary:"Thermal expansion, specific heat and temperature", icon:"🌡", available:true },
  { id:"igcse-u10", title:"2.3 Thermal energy transfer", summary:"Conduction, convection and radiation", icon:"↺", available:true },
  { id:"igcse-u11", title:"3.1 General wave properties", summary:"Wave terminology, speed, frequency and wavelength", icon:"∿", available:true },
  { id:"igcse-u12", title:"3.2 Light", summary:"Reflection, refraction and lenses", icon:"☀", available:true },
  { id:"igcse-u13", title:"3.3–3.4 Electromagnetic spectrum & sound", summary:"EM spectrum properties and sound waves", icon:"📡", available:true },
  { id:"igcse-u14", title:"4.1 Magnetism", summary:"Magnetic fields, materials and electromagnets", icon:"🧲", available:true },
  { id:"igcse-u15", title:"4.2 Electrical quantities", summary:"Charge, current, e.m.f., p.d., resistance and power", icon:"⏚", available:true },
  { id:"igcse-u16", title:"4.3 Electric circuits", summary:"Circuit diagrams, series and parallel circuits", icon:"🔌", available:true },
  { id:"igcse-u17", title:"4.4 Electrical safety", summary:"Hazards, fuses, earthing and double insulation", icon:"⚠", available:true },
  { id:"igcse-u18", title:"4.5 Electromagnetic effects", summary:"Induction, generators, motors and transformers", icon:"🔄", available:true },
  { id:"igcse-u19", title:"5.1 The nuclear model of the atom", summary:"Atomic structure, protons, neutrons and isotopes", icon:"⚛", available:true },
  { id:"igcse-u20", title:"5.2 Radioactivity", summary:"Nuclear radiation, decay and half-life", icon:"☢", available:true },
  { id:"igcse-u21", title:"6.1–6.2 Space physics", summary:"The Solar System, stars and the Universe", icon:"🌌", available:true },
];
export const asPhysicsUnits: PhysicsUnit[] = [
  { id:"as-u1", title:"1. Physical quantities & units", summary:"SI units, errors and dimensional analysis", icon:"⚖", available:true },
  { id:"as-u2", title:"2. Kinematics", summary:"Motion graphs, equations of motion and projectiles", icon:"→", available:true },
  { id:"as-u3", title:"3. Dynamics", summary:"Newton's laws, momentum and collisions", icon:"⇒", available:true },
  { id:"as-u4", title:"4. Forces, density & pressure", summary:"Equilibrium, moments, density and pressure", icon:"↕", available:true },
  { id:"as-u5", title:"5. Work, energy and power", summary:"Work, energy conservation, efficiency, power and energy changes", icon:"⚡", available:true },
  { id:"as-u6", title:"6. Deformation of solids", summary:"Hooke's law, stress, strain and the Young modulus", icon:"◆", available:true },
  { id:"as-u7", title:"7. Waves", summary:"Wave motion, Doppler effect, electromagnetic spectrum and polarisation", icon:"∿", available:true },
  { id:"as-u8", title:"8. Superposition", summary:"Stationary waves, interference, diffraction and gratings", icon:"≈", available:true },
  { id:"as-u9", title:"9. Electricity", summary:"Charge, current, resistance, resistivity and power", icon:"⏚", available:true },
  { id:"as-u10", title:"10. D.C. circuits", summary:"Kirchhoff’s laws, internal resistance and potential dividers", icon:"⎋", available:true },
  { id:"as-u11", title:"11. Particle physics", summary:"Nuclei, decay equations, quarks and leptons", icon:"☢", available:true },
];
