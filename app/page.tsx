"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { upload as uploadBlob } from "@vercel/blob/client";
import {
  SignIn,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { igcsePhysicsSyllabus } from "@/lib/physics-syllabus";
type Role = "choose" | "teacher" | "student";
type TeacherView = "dashboard" | "stage7" | "stage89" | "physics" | "papers" | "students" | "submissions";
type AssignmentSummary = {
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
type StudentPaperStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "awaiting_review"
  | "result_available";
const questions = [
  {
    n: "1(a)",
    topic: "Number",
    marks: 2,
    text: "Evaluate 3.6 × 2.5 and give your answer.",
    answer: "9",
  },
  {
    n: "1(b)",
    topic: "Number",
    marks: 3,
    text: "A value increases from 80 to 92. Calculate the percentage increase.",
    answer: "15",
  },
  {
    n: "2",
    topic: "Algebra",
    marks: 4,
    text: "Solve 3x² − 12 = 0. Give both values of x.",
    answer: "-2, 2",
  },
  {
    n: "3",
    topic: "Geometry",
    marks: 5,
    text: "A right-angled triangle has shorter sides 7 cm and 9 cm. Calculate its area.",
    answer: "31.5",
  },
];
const stage7Chapters = [
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

type LowerSecondaryUnit = { id: string; strand: string; title: string; summary: string; icon: string };
const stage8Units: LowerSecondaryUnit[] = [
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
const stage9Units: LowerSecondaryUnit[] = [
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

type PhysicsUnit = { id: string; title: string; summary: string; icon: string; available: boolean };
const igcsePhysicsUnits: PhysicsUnit[] = [
  { id:"igcse-u1", title:"1.1 Physical quantities & measurement", summary:"SI units, conversions, precision and error types", icon:"⚖", available:true },
  { id:"igcse-u2", title:"1.2 Motion", summary:"Speed, velocity, acceleration and motion graphs", icon:"→", available:false },
  { id:"igcse-u3", title:"1.3–1.4 Mass, weight & density", summary:"Mass, weight, gravity and density calculations", icon:"◆", available:false },
  { id:"igcse-u4", title:"1.5 Forces & their effects", summary:"Hooke's law, turning effects and equilibrium", icon:"↕", available:false },
  { id:"igcse-u5", title:"1.6 Momentum", summary:"Momentum and conservation of momentum", icon:"⇒", available:false },
  { id:"igcse-u6", title:"1.7 Energy, work & power", summary:"Energy transfers, work done and power", icon:"⚡", available:false },
  { id:"igcse-u7", title:"1.8 Pressure", summary:"Pressure in solids, liquids and gases", icon:"▼", available:false },
  { id:"igcse-u8", title:"2.1 Kinetic model of matter", summary:"States of matter and particle behaviour", icon:"◌", available:false },
  { id:"igcse-u9", title:"2.2 Thermal properties & temperature", summary:"Thermal expansion, specific heat and temperature", icon:"🌡", available:false },
  { id:"igcse-u10", title:"2.3 Thermal energy transfer", summary:"Conduction, convection and radiation", icon:"↺", available:false },
  { id:"igcse-u11", title:"3.1 General wave properties", summary:"Wave terminology, speed, frequency and wavelength", icon:"∿", available:false },
  { id:"igcse-u12", title:"3.2 Light", summary:"Reflection, refraction and lenses", icon:"☀", available:false },
  { id:"igcse-u13", title:"3.3–3.4 Electromagnetic spectrum & sound", summary:"EM spectrum properties and sound waves", icon:"📡", available:false },
  { id:"igcse-u14", title:"4.1 Magnetism", summary:"Magnetic fields, materials and electromagnets", icon:"🧲", available:true },
  { id:"igcse-u15", title:"4.2 Electrical quantities", summary:"Charge, current, e.m.f., p.d., resistance and power", icon:"⏚", available:true },
  { id:"igcse-u16", title:"4.3 Electric circuits", summary:"Circuit diagrams, series and parallel circuits", icon:"🔌", available:true },
  { id:"igcse-u17", title:"4.4 Electrical safety", summary:"Hazards, fuses, earthing and double insulation", icon:"⚠", available:true },
  { id:"igcse-u18", title:"4.5 Electromagnetic effects", summary:"Induction, generators, motors and transformers", icon:"🔄", available:true },
  { id:"igcse-u19", title:"5.1 The nuclear model of the atom", summary:"Atomic structure, protons, neutrons and isotopes", icon:"⚛", available:false },
  { id:"igcse-u20", title:"5.2 Radioactivity", summary:"Nuclear radiation, decay and half-life", icon:"☢", available:false },
  { id:"igcse-u21", title:"6.1–6.2 Space physics", summary:"The Solar System, stars and the Universe", icon:"🌌", available:false },
];
const asPhysicsUnits: PhysicsUnit[] = [
  { id:"as-u1", title:"1. Physical quantities & units", summary:"SI units, errors and dimensional analysis", icon:"⚖", available:false },
  { id:"as-u2", title:"2. Kinematics", summary:"Motion graphs, equations of motion and projectiles", icon:"→", available:false },
  { id:"as-u3", title:"3. Dynamics", summary:"Newton's laws, momentum and collisions", icon:"⇒", available:false },
  { id:"as-u4", title:"4. Forces, density & pressure", summary:"Equilibrium, moments, density and pressure", icon:"↕", available:false },
  { id:"as-u5", title:"5. Work, energy & power", summary:"Work done, energy conservation and efficiency", icon:"⚡", available:false },
  { id:"as-u6", title:"6. Deformation of solids", summary:"Hooke's law, stress, strain and the Young modulus", icon:"◆", available:false },
  { id:"as-u7", title:"7. Waves", summary:"Wave properties, the Doppler effect and EM waves", icon:"∿", available:false },
  { id:"as-u8", title:"8. Superposition", summary:"Interference, diffraction and stationary waves", icon:"≈", available:false },
  { id:"as-u9", title:"9. Electricity", summary:"Current, resistance, resistivity and power", icon:"⏚", available:false },
  { id:"as-u10", title:"10. D.C. circuits", summary:"Circuit analysis, EMF and internal resistance", icon:"⎋", available:false },
  { id:"as-u11", title:"11. Particle physics", summary:"Atomic structure, particles and radiation", icon:"☢", available:false },
];

export default function Home() {
  return (
    <main className="portal-app">
      <SignedOut>
        <div className="portal-choice">
          <header>
            <Logo />
            <span className="preview-badge">SECURE ACCESS</span>
          </header>
          <section>
            <div className="choice-copy">
              <p>CAMBRIDGE LEARNING WORKSPACE</p>
              <h1>Welcome to StudyTrack.</h1>
              <h2>Sign in with the account created for you by your teacher.</h2>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "1rem 0 3rem",
              }}
            >
              <SignIn routing="hash" />
            </div>
          </section>
        </div>
      </SignedOut>
      <SignedIn>
        <RolePortal />
      </SignedIn>
    </main>
  );
}

function RolePortal() {
  const { user, isLoaded } = useUser();
  if (!isLoaded)
    return (
      <div className="portal-choice">
        <header>
          <Logo />
        </header>
        <section>
          <div className="choice-copy">
            <p>SECURE ACCESS</p>
            <h1>Loading your workspace…</h1>
          </div>
        </section>
      </div>
    );
  const role = user?.publicMetadata.role;
  if (role === "teacher") return <TeacherPortal switchRole={() => {}} />;
  if (role === "student") return <StudentPortal switchRole={() => {}} />;
  return (
    <div className="portal-choice">
      <header>
        <Logo />
        <UserButton />
      </header>
      <section>
        <div className="choice-copy">
          <p>ACCOUNT SETUP REQUIRED</p>
          <h1>Your account is signed in.</h1>
          <h2>
            A teacher or student role has not yet been assigned. The
            administrator can assign the first teacher role in Clerk.
          </h2>
        </div>
        <aside>
          Set Public metadata to <b>{'{"role":"teacher"}'}</b> for the teacher
          account, then refresh this page.
        </aside>
      </section>
    </div>
  );
}

function Logo() {
  return (
    <div className="brand">
      <span className="brand-mark">S</span>
      <div>
        <b>StudyTrack</b>
        <small>Cambridge learner planner</small>
      </div>
    </div>
  );
}
function PreviewBadge() {
  return <span className="preview-badge">SECURE TEST LOGIN ACTIVE</span>;
}

function PortalChoice({ onChoose }: { onChoose: (r: Role) => void }) {
  return (
    <div className="portal-choice">
      <header>
        <Logo />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <PreviewBadge />
          <UserButton />
        </div>
      </header>
      <section>
        <div className="choice-copy">
          <p>CAMBRIDGE LEARNING WORKSPACE</p>
          <h1>
            One place for teaching,
            <br />
            practice and progress.
          </h1>
          <h2>
            Your sign-in is protected by Clerk. Choose a workspace to continue
            testing.
          </h2>
        </div>
        <div className="role-grid">
          <button onClick={() => onChoose("teacher")}>
            <span className="role-icon teacher">▤</span>
            <small>FOR EDUCATORS</small>
            <h3>Teacher portal</h3>
            <p>
              Create classes, upload papers, assign revision and review student
              answers.
            </p>
            <b>Open teacher portal →</b>
          </button>
          <button onClick={() => onChoose("student")}>
            <span className="role-icon student">π</span>
            <small>FOR LEARNERS</small>
            <h3>Student portal</h3>
            <p>
              Open assigned papers, submit typed or handwritten work and view
              feedback.
            </p>
            <b>Open student portal →</b>
          </button>
        </div>
        <aside>
          🔒 Authentication is active. Teacher and student roles will be
          assigned when the first test accounts are created.
        </aside>
      </section>
    </div>
  );
}

function Shell({
  role,
  nav,
  children,
}: {
  role: "Teacher" | "Student";
  onSwitch: () => void;
  nav: React.ReactNode;
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const displayName =
    user?.fullName || user?.username || (role === "Teacher" ? "Teacher" : "Student");
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || (role === "Teacher" ? "T" : "S");
  return (
    <>
      <header className="portal-top">
        <Logo />
        <div>
          <PreviewBadge />
          <UserButton />
          <span className={`portal-avatar ${role.toLowerCase()}`}>
            {initials}
          </span>
        </div>
      </header>
      <div className="portal-shell">
        <aside>
          <div className="portal-person">
            <span className={role.toLowerCase()}>
              {initials}
            </span>
            <div>
              <b>{displayName}</b>
              <small>
                {role === "Teacher"
                  ? "Cambridge teacher"
                  : "Cambridge student portal"}
              </small>
            </div>
          </div>
          {nav}
          <div className="portal-help">
            <b>Need help?</b>
            <small>Portal setup guide</small>
          </div>
        </aside>
        <section className="portal-main">{children}</section>
      </div>
    </>
  );
}

function TeacherPortal({ switchRole }: { switchRole: () => void }) {
  const [view, setView] = useState<TeacherView>("dashboard"),
    [modal, setModal] = useState(false),
    [paper, setPaper] = useState<File | null>(null),
    [scheme, setScheme] = useState<File | null>(null),
    [uploadProfile, setUploadProfile] = useState("igcse-mathematics-0580"),
    [creatingAssignment, setCreatingAssignment] = useState(false);
  const homeworkUpload = uploadProfile === "lower-secondary-homework";
  const nav = (
    <nav className="portal-nav">
      <p>TEACHING</p>
      {(
        [
          ["dashboard", "⌂", "Overview"],
          ["stage7", "7", "Stage 7 mastery"],
          ["stage89", "8", "Stages 8 & 9"],
          ["physics", "⚛", "Physics practice"],
          ["papers", "▤", "Papers & assignments"],
          ["submissions", "✓", "Marking queue"],
          ["students", "♙", "Students"],
        ] as const
      ).map((x) => (
        <button
          key={x[0]}
          className={view === x[0] ? "active" : ""}
          onClick={() => setView(x[0])}
        >
          <span>{x[1]}</span>
          {x[2]}
        </button>
      ))}
    </nav>
  );
  return (
    <Shell role="Teacher" onSwitch={switchRole} nav={nav}>
      {view === "dashboard" ? (
        <TeacherDashboard setView={setView} upload={() => setModal(true)} />
      ) : view === "stage7" ? (
        <Stage7Teacher />
      ) : view === "stage89" ? (
        <Stage89Teacher />
      ) : view === "physics" ? (
        <PhysicsTeacher />
      ) : view === "papers" ? (
        <Papers upload={() => setModal(true)} />
      ) : view === "submissions" ? (
        <Submissions />
      ) : (
        <Students />
      )}
      {modal && (
        <div className="portal-modal" onMouseDown={() => setModal(false)}>
          <form
            onMouseDown={(e) => e.stopPropagation()}
            onSubmit={async (e) => {
              e.preventDefault();
              setCreatingAssignment(true);
              try {
                const data = new FormData(e.currentTarget);
                if (homeworkUpload) {
                  if (!paper) throw new Error("Choose the homework PDF first.");
                  if (paper.size > 60_000_000) throw new Error("The homework PDF must be smaller than 60 MB.");
                  const uploaded = await uploadBlob(
                    `homework/${crypto.randomUUID()}/${paper.name}`,
                    paper,
                    { access: "private", handleUploadUrl: "/api/blob-upload", multipart: true },
                  );
                  data.delete("paper");
                  data.set("paperUrl", uploaded.url);
                  data.set("resourceKind", "homework");
                  data.delete("scheme");
                }
                const response = await fetch("/api/assignments", { method: "POST", body: data });
                const result = await response.json();
                if (!response.ok) throw new Error(result.error || "The assignment could not be saved.");
                alert(homeworkUpload ? "Homework book saved. Open question setup to review its worksheet pages." : "Assignment and PDFs saved securely.");
                setModal(false);
                setPaper(null);
                setScheme(null);
              } catch (error) {
                alert(error instanceof Error ? error.message : "The assignment could not be saved.");
              } finally {
                setCreatingAssignment(false);
              }
            }}
          >
            <button type="button" className="x" onClick={() => setModal(false)}>
              ×
            </button>
            <small>NEW CAMBRIDGE ASSIGNMENT</small>
            <h2>Upload paper materials</h2>
            <label>
              Subject profile
              <select name="profile" value={uploadProfile} onChange={(event)=>{setUploadProfile(event.target.value);setScheme(null);}}>
                <option value="igcse-mathematics-0580">IGCSE Mathematics · 0580</option>
                <option value="igcse-physics-0625">IGCSE Physics · 0625</option>
                <option value="as-mathematics-9709">AS Level Mathematics · 9709</option>
                <option value="as-physics-9702">AS Level Physics · 9702</option>
                <option value="cambridge-general">Other Cambridge syllabus · teacher review</option>
                <option value="lower-secondary-homework">Lower Secondary homework · no mark scheme</option>
              </select>
              <small>{homeworkUpload ? "Homework without a memo is held for teacher marking before results are published." : "The profile controls detection and marking safeguards."}</small>
            </label>
            {homeworkUpload && <div className="form-row"><label>Homework stage<select name="stage" defaultValue="8"><option value="8">Stage 8</option><option value="9">Stage 9</option></select></label><label>First exercise page<input name="contentStartPage" type="number" min="1" defaultValue="5"/></label><label>Last exercise page<input name="contentEndPage" type="number" min="1" defaultValue="112"/></label></div>}
            {!homeworkUpload ? <label>
              Paper format
              <select name="paperMode" defaultValue="structured">
                <option value="structured">Structured / written answers</option>
                <option value="multiple_choice">Multiple choice · A–D</option>
              </select>
              <small>Multiple-choice papers are marked and published automatically.</small>
            </label> : <input type="hidden" name="paperMode" value="structured"/>}
            <label>
              Assignment title
              <input
                key={uploadProfile}
                name="title"
                defaultValue={homeworkUpload ? "Complete Mathematics Homework Book 2" : "0580/42 May/June revision"}
                required
              />
            </label>
            <div className="modal-files">
              <label>
                <input
                  name="paper"
                  type="file"
                  accept="application/pdf,.pdf"
                  required
                  onChange={(e) => setPaper(e.target.files?.[0] || null)}
                />
                <span>{paper ? "✓" : "⇧"}</span>
                <b>{paper?.name || (homeworkUpload ? "Homework book" : "Question paper")}</b>
                <small>PDF</small>
              </label>
              {!homeworkUpload && <label>
                <input
                  name="scheme"
                  type="file"
                  accept="application/pdf,.pdf"
                  required
                  onChange={(e) => setScheme(e.target.files?.[0] || null)}
                />
                <span>{scheme ? "✓" : "⇧"}</span>
                <b>{scheme?.name || "Mark scheme"}</b>
                <small>PDF</small>
              </label>}
            </div>
            <div className="form-row">
              <label>
                Class
                <select key={uploadProfile} name="className" defaultValue={homeworkUpload ? "Lower Secondary Stage 8" : "IGCSE Mathematics 2026"}>
                  <option>IGCSE Mathematics 2026</option>
                  <option>IGCSE Physics 2026</option>
                  <option>Cambridge Revision 2026</option>
                  <option>Lower Secondary Stage 8</option>
                  <option>Lower Secondary Stage 9</option>
                </select>
              </label>
              <label>
                Due date
                <input name="dueDate" type="date" defaultValue="2026-08-31" />
              </label>
            </div>
            <button className="primary" disabled={creatingAssignment}>{creatingAssignment ? (homeworkUpload ? "Uploading large homework PDF…" : "Saving assignment…") : "Create assignment"}</button>
          </form>
        </div>
      )}
    </Shell>
  );
}

function TeacherDashboard({
  setView,
  upload,
}: {
  setView: (v: TeacherView) => void;
  upload: () => void;
}) {
  const { user } = useUser();
  const [dashboard, setDashboard] = useState<{
    active_students: number;
    needs_review: number;
    active_papers: number;
    class_average: number;
    recent_submissions: Array<{
      id: string;
      student_name: string;
      status: string;
      title: string;
      subject: string;
      syllabus: string;
      total_proposed: number | null;
      total_final: number | null;
      maximum: number;
    }>;
    assignments: Array<{
      id: string;
      title: string;
      subject: string;
      syllabus: string;
      due_date: string | null;
      status: string;
      assigned_count: number;
      submitted_count: number;
    }>;
    topic_performance: Array<{
      topic: string;
      percentage: number;
      responses: number;
    }>;
  } | null>(null);
  const [dashboardError, setDashboardError] = useState("");

  useEffect(() => {
    fetch("/api/dashboard")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Dashboard could not load.");
        setDashboard(result);
      })
      .catch((error) => setDashboardError(error.message));
  }, []);

  const today = new Date().toLocaleDateString("en-ZA", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const firstName = user?.firstName || user?.fullName || user?.username || "Teacher";
  const statusLabel = (status: string) =>
    status === "awaiting_review"
      ? "Needs review"
      : status === "published"
        ? "Published"
        : status === "reviewed"
          ? "Ready to publish"
          : "Submitted";
  const resultText = (submission: NonNullable<typeof dashboard>["recent_submissions"][number]) => {
    const mark = submission.total_final ?? submission.total_proposed;
    return mark !== null && submission.maximum > 0 ? `${mark}/${submission.maximum}` : "—";
  };

  return (
    <>
      <div className="portal-heading">
        <div>
          <p>{today.toUpperCase()}</p>
          <h1>Welcome back, {firstName}</h1>
          <h2>Your classes, papers and marking work are summarised here.</h2>
        </div>
        <button className="primary" onClick={upload}>
          ＋ Upload & assign paper
        </button>
      </div>
      <div className="teacher-stats">
        <article>
          <span className="violet">♙</span>
          <div>
            <small>ACTIVE STUDENTS</small>
            <b>{dashboard?.active_students ?? "—"}</b>
            <em>Assigned across your papers</em>
          </div>
        </article>
        <article>
          <span className="mint">✓</span>
          <div>
            <small>SUBMISSIONS TO REVIEW</small>
            <b>{dashboard?.needs_review ?? "—"}</b>
            <em>{dashboard?.needs_review ? "Ready for teacher approval" : "Queue is clear"}</em>
          </div>
        </article>
        <article>
          <span className="sky">▤</span>
          <div>
            <small>ACTIVE PAPERS</small>
            <b>{dashboard?.active_papers ?? "—"}</b>
            <em>Available to assigned students</em>
          </div>
        </article>
        <article>
          <span className="amber">◎</span>
          <div>
            <small>PUBLISHED AVERAGE</small>
            <b>{dashboard ? `${dashboard.class_average}%` : "—"}</b>
            <em>Based on published results</em>
          </div>
        </article>
      </div>
      <div className="teacher-grid">
        <section className="panel">
          <header>
            <div>
              <h3>Recent submissions</h3>
              <p>Latest student activity</p>
            </div>
            <button onClick={() => setView("submissions")}>View all</button>
          </header>
          {dashboard?.recent_submissions.map((submission) => (
            <div className="submission-row" key={submission.id}>
              <span>
                {submission.student_name
                  .split(" ")
                  .map((x) => x[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join("")}
              </span>
              <div>
                <b>{submission.student_name}</b>
                <small>{submission.syllabus} · {submission.title}</small>
              </div>
              <em className={submission.status === "awaiting_review" ? "needs-review" : ""}>
                {statusLabel(submission.status)}
              </em>
              <strong>{resultText(submission)}</strong>
              <button onClick={() => setView("submissions")}>Review →</button>
            </div>
          ))}
          {dashboard && dashboard.recent_submissions.length === 0 && (
            <DashboardEmpty text="No submissions yet. Student work will appear here as soon as it is handed in." />
          )}
          {!dashboard && !dashboardError && <DashboardEmpty text="Loading recent submissions…" />}
        </section>
        <section className="panel assignments">
          <header>
            <div>
              <h3>Active assignments</h3>
              <p>Current paper completion</p>
            </div>
            <button onClick={() => setView("papers")}>Manage</button>
          </header>
          {dashboard?.assignments.map((assignment) => {
            const progress = assignment.assigned_count
              ? Math.min(100, Math.round((assignment.submitted_count / assignment.assigned_count) * 100))
              : 0;
            return (
              <article key={assignment.id}>
                <span>{assignment.subject === "Physics" ? "⚛" : "π"}</span>
                <div>
                  <b>{assignment.title}</b>
                  <small>
                    {assignment.subject} · {assignment.syllabus}
                    {assignment.due_date
                      ? ` · Due ${new Date(`${assignment.due_date}T00:00:00`).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}`
                      : ""}
                  </small>
                  <i><em style={{ width: `${progress}%` }} /></i>
                  <p>{assignment.submitted_count} of {assignment.assigned_count} submitted</p>
                </div>
              </article>
            );
          })}
          {dashboard && dashboard.assignments.length === 0 && (
            <DashboardEmpty text="No papers yet. Upload your first paper to begin." />
          )}
        </section>
      </div>
      <section className="panel class-insight">
        <header>
          <div>
            <h3>Class topic insight</h3>
            <p>Based on teacher-published results</p>
          </div>
          <span>All published work</span>
        </header>
        {dashboard?.topic_performance.map((topic) => (
          <div key={topic.topic}>
            <b>{topic.topic}</b>
            <span>
              <i style={{ width: `${Math.max(0, Math.min(100, topic.percentage))}%` }} />
            </span>
            <em>{topic.percentage}%</em>
          </div>
        ))}
        {dashboard && dashboard.topic_performance.length === 0 && (
          <DashboardEmpty text="Topic insight will appear after the first results are published." />
        )}
        {dashboardError && <DashboardEmpty text={dashboardError} />}
      </section>
    </>
  );
}

function DashboardEmpty({ text }: { text: string }) {
  return <p className="dashboard-empty">{text}</p>;
}

type LowerSecondaryStudent = { id:string; name:string; username:string; enrolled:boolean };

function PastPaperLibrary({stage}:{stage:8|9}){
  const [papers,setPapers]=useState<AssignmentSummary[]>([]),[uploading,setUploading]=useState(false),[showUpload,setShowUpload]=useState(false),[message,setMessage]=useState(""),[setup,setSetup]=useState<AssignmentSummary|null>(null),[reviewing,setReviewing]=useState<AssignmentSummary|null>(null);
  const load=()=>fetch("/api/assignments").then(response=>response.json()).then(rows=>setPapers((Array.isArray(rows)?rows:[]).filter((paper:AssignmentSummary)=>paper.is_practice_library&&paper.lower_secondary_stage===stage)));
  useEffect(()=>{load();setMessage("");setShowUpload(false);setSetup(null);setReviewing(null);},[stage]);
  const upload=async(event:React.FormEvent<HTMLFormElement>)=>{event.preventDefault();setUploading(true);setMessage("Uploading both PDFs securely…");const data=new FormData(event.currentTarget);data.set("profile",`lower-secondary-stage${stage}`);data.set("paperMode","structured");data.set("className",`Stage ${stage} past-paper library`);data.set("library","true");data.set("stage",String(stage));const response=await fetch("/api/assignments",{method:"POST",body:data});const result=await response.json();setUploading(false);if(!response.ok){setMessage(result.error||"The paper could not be uploaded.");return;}setPapers(current=>[result,...current]);setShowUpload(false);setMessage("Paper saved. Open question setup to detect, match and approve its questions.");};
  return <section className="panel past-paper-library"><header><div><small>TEACHER-CONTROLLED SOURCE LIBRARY</small><h3>Stage {stage} past papers</h3><p>Upload a question paper with its mark scheme, then approve every detected question before it joins practice.</p></div><button className="primary" onClick={()=>setShowUpload(value=>!value)}>{showUpload?"Cancel":"＋ Upload paper"}</button></header>{message&&<p className="queue-message">{message}</p>}{showUpload&&<form className="past-paper-upload" onSubmit={upload}><label>Paper title<input name="title" placeholder={`Stage ${stage} End-of-year paper`} required/></label><label>Year or session<input name="year" placeholder="2025" required/></label><label>Question paper PDF<input name="paper" type="file" accept="application/pdf,.pdf" required/></label><label>Mark scheme PDF<input name="scheme" type="file" accept="application/pdf,.pdf" required/></label><button className="primary" disabled={uploading}>{uploading?"Uploading…":"Save to library →"}</button></form>}<div className="past-paper-grid">{papers.map(paper=><article key={paper.id}><span>PDF</span><div><b>{paper.title}</b><small>Stage {stage} · {paper.source_year||"Year not set"}</small><em className={paper.status==="assigned"?"paper-ready":"paper-paused"}>{paper.status==="assigned"?"Approved for practice":"Teacher setup required"}</em></div><div className="past-paper-actions"><button onClick={()=>setReviewing(paper)}>Review uploaded files</button><button onClick={()=>setSetup(paper)}>{paper.status==="assigned"?"Review questions":"Set up questions"} →</button></div></article>)}{!papers.length&&!showUpload&&<p className="dashboard-empty">No Stage {stage} past papers have been uploaded yet.</p>}</div>{reviewing&&<FileReview assignment={reviewing} close={()=>setReviewing(null)} openSetup={()=>{setSetup(reviewing);setReviewing(null);}} replaced={(status,notice)=>{setPapers(current=>current.map(paper=>paper.id===reviewing.id?{...paper,status}:paper));setReviewing(current=>current?{...current,status}:current);setMessage(notice);}}/>}{setup&&<QuestionSetup assignment={setup} close={()=>setSetup(null)} saved={()=>{setPapers(current=>current.map(paper=>paper.id===setup.id?{...paper,status:"assigned"}:paper));setMessage("Questions approved. Eligible typed questions can now be selected for Stage practice.");setSetup(null);}}/>}</section>;
}

function PhysicsSyllabusChecklist({ level }:{ level:"igcse"|"as" }) {
  const [checked,setChecked]=useState<Set<string>>(new Set());
  const [state,setState]=useState("Loading syllabus checklist…");
  const syllabus = level==="igcse" ? igcsePhysicsSyllabus : [];
  useEffect(()=>{
    setState("Loading syllabus checklist…");
    fetch(`/api/physics/checklist?level=${level}`).then(response=>response.json()).then(data=>{
      setChecked(new Set(Array.isArray(data.checked)?data.checked:[]));
      setState(level==="as"?"AS Level syllabus content is coming soon.":"");
    }).catch(()=>setState("The checklist could not be loaded."));
  },[level]);
  const toggle=async(objectiveId:string)=>{
    setChecked(current=>{const next=new Set(current);next.has(objectiveId)?next.delete(objectiveId):next.add(objectiveId);return next;});
    await fetch("/api/physics/checklist",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({level,objectiveId})});
  };
  const totalObjectives = syllabus.reduce((sum,topic)=>sum+topic.groups.reduce((s,g)=>s+g.objectives.length,0),0);
  return <div className="syllabus-checklist">
    {state && <p className="queue-message panel">{state}</p>}
    {!!totalObjectives && <p className="checklist-progress"><b>{checked.size} of {totalObjectives} objectives checked</b><span>{Math.round((checked.size/totalObjectives)*100)}%</span></p>}
    {syllabus.map(topic=>(
      <details key={topic.id} className="syllabus-topic">
        <summary>{topic.id}. {topic.title}</summary>
        {topic.groups.map(group=>(
          <div key={group.id} className="syllabus-group">
            <h4>{group.id} {group.title}</h4>
            {group.objectives.map(objective=>(
              <label key={objective.id} className={objective.type}>
                <input type="checkbox" checked={checked.has(objective.id)} onChange={()=>toggle(objective.id)}/>
                <span>{objective.text}</span>
                <em>{objective.type}</em>
              </label>
            ))}
          </div>
        ))}
      </details>
    ))}
  </div>;
}

function PhysicsTeacher() {
  const [level,setLevel]=useState<"igcse"|"as">("igcse");
  const [view,setView]=useState<"progress"|"checklist">("progress");
  const [students,setStudents]=useState<Array<{student_id:string;student_name:string;chapter_id:string;attempts:number;average:number;strong_sets:number;mastered:boolean;last_active:string}>>([]);
  const [state,setState]=useState("Loading physics practice activity…");
  const units = level==="as" ? asPhysicsUnits : igcsePhysicsUnits;
  const titleFor = (chapterId:string) => units.find(unit=>unit.id===chapterId)?.title || chapterId;
  useEffect(()=>{
    if(view!=="progress")return;
    setState("Loading physics practice activity…");
    fetch(`/api/physics/practice?level=${level}`).then(response=>response.json()).then(data=>{
      setStudents(Array.isArray(data.students)?data.students:[]);
      setState(Array.isArray(data.students)&&!data.students.length ? "No students have practised yet." : "");
    }).catch(()=>setState("Physics practice activity could not be loaded."));
  },[level,view]);
  return <>
    <div className="portal-heading">
      <div><p>PHYSICS</p><h1>Physics practice</h1><h2>See how students are progressing through generated IGCSE and AS Level Physics practice sets.</h2></div>
      <div className="stage89-switch">
        <button className={level==="igcse"?"primary":""} onClick={()=>setLevel("igcse")}>IGCSE Physics</button>
        <button className={level==="as"?"primary":""} onClick={()=>setLevel("as")}>AS Level Physics</button>
      </div>
    </div>
    <div className="stage89-switch">
      <button className={view==="progress"?"primary":""} onClick={()=>setView("progress")}>Student progress</button>
      <button className={view==="checklist"?"primary":""} onClick={()=>setView("checklist")}>Syllabus checklist</button>
    </div>
    {view==="checklist" ? <PhysicsSyllabusChecklist level={level} /> : <>
    {state && <p className="queue-message panel">{state}</p>}
    {!!students.length && <table className="mastery-table">
      <thead><tr><th>Student</th><th>Topic</th><th>Attempts</th><th>Average</th><th>Strong sets</th><th>Status</th><th>Last active</th></tr></thead>
      <tbody>{students.map((row,index)=>
        <tr key={index}>
          <td>{row.student_name}</td>
          <td>{titleFor(row.chapter_id)}</td>
          <td>{row.attempts}</td>
          <td>{row.average}%</td>
          <td>{row.strong_sets} / 2</td>
          <td>{row.mastered?"Mastered":"In progress"}</td>
          <td>{row.last_active ? new Date(row.last_active).toLocaleDateString() : "—"}</td>
        </tr>
      )}</tbody>
    </table>}
    </>}
  </>;
}

function Stage89Teacher() {
  const [stage, setStage] = useState<8 | 9>(8);
  const [focus, setFocus] = useState<string[]>([]);
  const [students, setStudents] = useState<LowerSecondaryStudent[]>([]);
  const [progress, setProgress] = useState<Array<{student_id:string;student_name:string;source_stage:number;chapter_id:string;attempts:number;average:number;strong_sets:number;mastered:boolean}>>([]);
  const [search, setSearch] = useState("");
  const [showRevision, setShowRevision] = useState(false);
  const [focusState, setFocusState] = useState("Loading weekly focus…");
  const [classState, setClassState] = useState("");
  const units = stage === 8 ? stage8Units : stage9Units;
  const stage7RevisionUnits = stage7Chapters.filter(unit => unit.id === "integers");
  const prerequisiteUnits = stage === 9
    ? [...stage8Units, ...stage7RevisionUnits]
    : stage7RevisionUnits;
  const allUnits = [...stage7Chapters, ...stage8Units, ...stage9Units];
  useEffect(() => {
    setFocusState("Loading weekly focus…"); setClassState("");
    Promise.all([
      fetch(`/api/lower-secondary/focus?stage=${stage}`).then(response => response.json()),
      fetch(`/api/lower-secondary/students?stage=${stage}`).then(response => response.json()),
      fetch(`/api/lower-secondary/practice?stage=${stage}`).then(response => response.json()),
    ]).then(([focusResult, studentResult, progressResult]) => {
      setFocus(Array.isArray(focusResult.chapters) ? focusResult.chapters : []);
      setStudents(Array.isArray(studentResult) ? studentResult : []);
      setProgress(Array.isArray(progressResult.students) ? progressResult.students : []);
      setFocusState("");
    }).catch(() => setFocusState("The class information could not be loaded."));
  }, [stage]);
  const toggleFocus = (id:string) => {
    setFocusState("");
    setFocus(current => current.includes(id) ? current.filter(item => item !== id) : current.length < 6 ? [...current, id] : current);
  };
  const saveFocus = async () => {
    setFocusState("Saving weekly focus…");
    const response = await fetch("/api/lower-secondary/focus", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({stage, chapters:focus}) });
    const result = await response.json();
    setFocusState(response.ok ? `✓ Stage ${stage} weekly focus saved` : result.error || "The focus could not be saved.");
  };
  const saveClass = async () => {
    setClassState("Saving class…");
    const response = await fetch("/api/lower-secondary/students", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({stage, studentIds:students.filter(student=>student.enrolled).map(student=>student.id)}) });
    const result = await response.json();
    setClassState(response.ok ? `${result.enrolled} student${result.enrolled===1?"":"s"} saved to Stage ${stage}.` : result.error || "The class could not be saved.");
  };
  const strands = Array.from(new Set(units.map(unit => unit.strand)));
  return <>
    <div className="portal-heading stage7-heading"><div><p>CAMBRIDGE LOWER SECONDARY MATHEMATICS</p><h1>Stages 8 and 9 mastery</h1><h2>Manage each class separately, set the weekly focus and keep the full curriculum open.</h2></div><div className="stage89-switch" role="group" aria-label="Choose stage"><button className={stage===8?"primary":""} onClick={()=>setStage(8)}>Stage 8</button><button className={stage===9?"primary":""} onClick={()=>setStage(9)}>Stage 9</button></div></div>
    <section className="stage7-rule panel"><span>{stage}</span><div><b>Stage {stage} class</b><p>{units.length} units based on the uploaded Stage {stage} scheme of work.</p></div><div><b>Mastery rule</b><p>Two practice sets at 80% or higher. Every unit remains available for revision.</p></div></section>
    <PastPaperLibrary stage={stage}/>
    <section className="panel stage7-class-manager"><header><div><h3>Stage {stage} students</h3><p>Select the existing student accounts that belong to this class.</p></div><b>{students.filter(student=>student.enrolled).length} enrolled</b></header><div className="stage7-class-tools"><input value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search students…"/><button className="primary" onClick={saveClass}>Save Stage {stage} class</button></div>{classState&&<p className="queue-message">{classState}</p>}<div className="stage7-student-picker">{students.filter(student=>`${student.name} ${student.username}`.toLowerCase().includes(search.toLowerCase())).map(student=><label key={student.id} className={student.enrolled?"selected":""}><input type="checkbox" checked={student.enrolled} onChange={()=>{setClassState("");setStudents(current=>current.map(item=>item.id===student.id?{...item,enrolled:!item.enrolled}:item));}}/><span>{student.name.split(" ").map(part=>part[0]).slice(0,2).join("")}</span><div><b>{student.name}</b><small>@{student.username}</small></div><em>{student.enrolled?"Added":"Add"}</em></label>)}</div></section>
    <section className="panel stage7-progress-panel"><header><div><h3>Stage {stage} class mastery activity</h3><p>Current-stage work and prerequisite revision are shown together</p></div><span>{progress.filter(item=>item.mastered).length} mastered records</span></header>{progress.length?progress.map(item=>{const unit=allUnits.find(value=>value.id===item.chapter_id);return <article key={`${item.student_id}-${item.source_stage}-${item.chapter_id}`}><span>{item.student_name.split(" ").map(part=>part[0]).slice(0,2).join("")}</span><div><b>{item.student_name} · {unit?.title||item.chapter_id}</b><small>Stage {item.source_stage} mastery · {item.attempts} practice sets · {item.average}% average</small></div><em className={item.mastered?"mastered":"progress"}>{item.mastered?"Mastered":`${item.strong_sets}/2 strong sets`}</em></article>}):<p className="dashboard-empty">Student results will appear here after the first practice set.</p>}</section>
    <section className="panel stage89-focus-bar"><div><small>WEEKLY FOCUS</small><h3>{focus.length} of 6 units selected</h3><p>Students can still open every other Stage {stage} unit for independent revision.</p></div><button className="primary" onClick={saveFocus}>Save Stage {stage} focus</button>{focusState&&<b>{focusState}</b>}</section>
    <section className="panel prerequisite-focus"><header><div><small>PREREQUISITE REVISION</small><h3>Earlier-stage foundations</h3><p>Add an earlier unit to this class’s weekly focus when students need reinforcement.</p></div><button onClick={()=>setShowRevision(value=>!value)}>{showRevision?"Hide earlier stages":"Choose earlier-stage focus"}</button></header>{showRevision&&<div className="stage7-chapter-grid teacher">{prerequisiteUnits.map(unit=>{const sourceStage=unit.id.startsWith("s8-")?8:7;const selected=focus.includes(unit.id);return <button key={`${sourceStage}-${unit.id}`} className={selected?"selected":""} onClick={()=>toggleFocus(unit.id)}><span>{unit.icon}</span><div><small>STAGE {sourceStage}</small><b>{unit.title}</b><p>{unit.summary}</p></div><em>{selected?"✓ This week":"+ Add focus"}</em></button>;})}</div>}</section>
    {strands.map(strand=><section className="stage7-strand" key={strand}><header><div><small>STAGE {stage} STRAND</small><h2>{strand}</h2></div><span>{units.filter(unit=>unit.strand===strand).length} units</span></header><div className="stage7-chapter-grid teacher">{units.filter(unit=>unit.strand===strand).map(unit=>{const selected=focus.includes(unit.id);return <button key={unit.id} className={selected?"selected":""} onClick={()=>toggleFocus(unit.id)}><span>{unit.icon}</span><div><b>{unit.title}</b><p>{unit.summary}</p></div><em>{selected?"✓ This week":"+ Add focus"}</em></button>;})}</div></section>)}
  </>;
}

type PastPaperPracticeSource={assignmentId:string;label:string;pageNumber:number;cropX:number;cropY:number;cropWidth:number;cropHeight:number;title:string};
function PastPaperPracticeCrop({source}:{source:PastPaperPracticeSource}){
  const [pdf,setPdf]=useState<any>(null),[failed,setFailed]=useState(false);
  useEffect(()=>{setPdf(null);setFailed(false);import("pdfjs-dist").then(async pdfjs=>{pdfjs.GlobalWorkerOptions.workerSrc="/pdf.worker.min.mjs";const response=await fetch(`/api/assignments/${source.assignmentId}/paper`);if(!response.ok)throw new Error("paper");return pdfjs.getDocument({data:await response.arrayBuffer()}).promise;}).then(setPdf).catch(()=>setFailed(true));},[source.assignmentId]);
  if(failed)return <p className="practice-hint">The past-paper image could not be loaded. Ask your teacher to review this library paper.</p>;
  if(!pdf)return <p className="practice-hint">Loading past-paper question…</p>;
  const question={id:"source",position:1,label:source.label,marks:null,page_number:source.pageNumber,crop_x:source.cropX,crop_y:source.cropY,crop_width:source.cropWidth,crop_height:source.cropHeight,response_type:"typed" as const,answer_slots:1,response_layout:"answer" as const,expected_answer:null,mark_scheme_notes:null,topic:null};
  return <div className="past-paper-practice-crop"><small>{source.title} · Question {source.label}</small><QuestionCropPreview pdf={pdf} question={question}/></div>;
}

type CrossStagePracticeUnit = LowerSecondaryUnit & { sourceStage: 7 | 8 | 9 };

function PhysicsStudent({ back }:{ back:()=>void }) {
  const [level, setLevel] = useState<"igcse"|"as">("igcse");
  const [libraryView,setLibraryView]=useState<"topics"|"checklist">("topics");
  const [progress,setProgress]=useState<Record<string,{attempts:number;average:number;strong_sets:number;mastered:boolean}>>({});
  const [practice,setPractice]=useState<PhysicsUnit|null>(null);
  const [session,setSession]=useState<{id:string;level:string;chapter:string;difficulty:string;questions:Array<{templateId?:string;objective?:string;difficulty?:string;answerFormat?:string;prompt:string;hint:string}>}|null>(null);
  const [answers,setAnswers]=useState<string[]>([]),[hints,setHints]=useState<boolean[]>([]),[cursor,setCursor]=useState(0),[result,setResult]=useState<any>(null),[message,setMessage]=useState("");
  const units = level==="as" ? asPhysicsUnits : igcsePhysicsUnits;

  useEffect(()=>{
    fetch(`/api/physics/practice?level=${level}&all=1`).then(response=>response.json()).then(data=>{
      const next:Record<string,any>={};
      (Array.isArray(data.units)?data.units:[]).forEach((item:any)=>next[item.chapter_id]=item);
      setProgress(next);
    }).catch(()=>{});
  },[level]);

  const startPractice=async(unit:PhysicsUnit)=>{
    if(!unit.available){setMessage(`${unit.title} is coming soon.`);return;}
    setMessage("Preparing a fresh practice set…");
    const response=await fetch("/api/physics/practice",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"start",level,chapter:unit.id})});
    const data=await response.json();
    if(!response.ok){setMessage(data.error||"Practice could not start.");return;}
    setPractice(unit);setSession(data);setAnswers(Array(data.questions.length).fill(""));setHints(Array(data.questions.length).fill(false));setCursor(0);setResult(null);setMessage("");
  };
  const submitPractice=async()=>{
    if(!session||!practice)return;
    setMessage("Marking and saving your set…");
    const response=await fetch("/api/physics/practice",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"submit",id:session.id,answers,hints})});
    const data=await response.json();
    if(!response.ok){setMessage(data.error||"The set could not be saved.");return;}
    setResult(data);
    setProgress(current=>({...current,[practice.id]:{attempts:(current[practice.id]?.attempts||0)+1,average:data.score,strong_sets:data.strong_sets,mastered:data.mastered}}));
    setMessage("");
  };
  const closePractice=()=>{setPractice(null);setSession(null);setResult(null);setMessage("");};

  if(practice&&session){
    const question=session.questions[cursor];
    if(result)
      return <section className="stage7-practice panel practice-summary">
        <header><button onClick={closePractice}>← Curriculum</button><div><small>{level.toUpperCase()} PHYSICS · PRACTICE COMPLETE</small><h2>{practice.title}</h2></div><span>{result.mastered?"Mastered":"Keep practising"}</span></header>
        <main>
          <div className="mastery-score"><b>{result.score}%</b><span>{result.score>=80?"Strong set achieved":"Target: 80%"}</span></div>
          <h2>{result.mastered?"Unit mastery achieved":"Your worked review"}</h2>
          <p>{result.strong_sets} of 2 strong sets completed · {result.hints_used} hints used</p>
          <div className="worked-review">{result.results.map((item:any,index:number)=>
            <article className={item.correct?"correct":"retry"} key={index}>
              <span>{item.correct?"✓":"!"}</span>
              <div><b>Question {index+1}: {item.prompt}</b><p>Your answer: {item.answer||"No answer"}</p><strong>{item.solution}</strong></div>
            </article>
          )}</div>
        </main>
        <footer><button onClick={closePractice}>Return to curriculum</button><button className="primary" onClick={()=>startPractice(practice)}>Start a fresh set →</button></footer>
      </section>;
    return <section className="stage7-practice panel">
      <header><button onClick={closePractice}>← Curriculum</button><div><small>{level.toUpperCase()} PHYSICS · {session.difficulty.toUpperCase()}</small><h2>{practice.title}</h2></div><span>Question {cursor+1} of {session.questions.length}</span></header>
      <div className="practice-progress"><i style={{width:`${((cursor+1)/session.questions.length)*100}%`}}/></div>
      <main>
        <small>QUESTION {cursor+1}</small>
        {question.objective&&<p className="practice-objective">{question.objective}</p>}
        <h1>{question.prompt}</h1>
        {hints[cursor]&&<p className="practice-hint">Hint: {question.hint}</p>}
        <label>Your answer{question.answerFormat&&<small className="answer-format">Answer format: {question.answerFormat}</small>}
          <input value={answers[cursor]} placeholder={question.answerFormat||"Enter your answer"} onChange={event=>setAnswers(answers.map((value,index)=>index===cursor?event.target.value:value))} onKeyDown={event=>{if(event.key==="Enter"){event.preventDefault();cursor<session.questions.length-1?setCursor(cursor+1):submitPractice();}}} autoFocus/>
        </label>
      </main>
      <footer>
        <button onClick={()=>setHints(hints.map((value,index)=>index===cursor?true:value))}>{hints[cursor]?"Hint shown":"Show hint"}</button>
        <div>
          <button disabled={cursor===0} onClick={()=>setCursor(cursor-1)}>← Previous</button>
          {cursor<session.questions.length-1?<button className="primary" onClick={()=>setCursor(cursor+1)}>Next →</button>:<button className="primary" onClick={submitPractice}>Finish &amp; mark set →</button>}
        </div>
      </footer>
      {message&&<p className="queue-message">{message}</p>}
    </section>;
  }

  return <>
    <div className="portal-heading">
      <div><p>CAMBRIDGE PHYSICS</p><h1>Physics practice</h1><h2>Generated practice questions with instant, reliable marking — separate from your assigned past papers.</h2></div>
      <div className="stage89-switch">
        <button className={level==="igcse"?"primary":""} onClick={()=>setLevel("igcse")}>IGCSE Physics</button>
        <button className={level==="as"?"primary":""} onClick={()=>setLevel("as")}>AS Level Physics</button>
        <button onClick={back}>← Assigned papers</button>
      </div>
    </div>
    <div className="stage89-switch">
      <button className={libraryView==="topics"?"primary":""} onClick={()=>setLibraryView("topics")}>Topic library</button>
      <button className={libraryView==="checklist"?"primary":""} onClick={()=>setLibraryView("checklist")}>Syllabus checklist</button>
    </div>
    {libraryView==="checklist" ? <PhysicsSyllabusChecklist level={level} /> : <>
    {message&&<p className="queue-message panel">{message}</p>}
    <div className="stage7-library-head">
      <div><small>{level.toUpperCase()} CURRICULUM</small><h2>Topic library</h2><p>New topics are added regularly — available ones are ready to practise now.</p></div>
      <span>{units.filter(unit=>progress[unit.id]?.mastered).length} of {units.filter(unit=>unit.available).length} mastered</span>
    </div>
    <div className="stage7-chapter-grid student">{units.map(unit=>{
      const item=progress[unit.id];
      return <article key={unit.id} className={unit.available?"":"locked"}>
        <span>{unit.icon}</span>
        <small>{level.toUpperCase()} Physics</small>
        <h3>{unit.title}</h3>
        <p>{unit.summary}</p>
        <div><em>{!unit.available?"Coming soon":item?.mastered?"Mastered":item?.attempts?"In progress":"Not started"}</em><b>{unit.available&&item?.attempts?`${item.average}%`:"—"}</b></div>
        <button disabled={!unit.available} onClick={()=>startPractice(unit)}>{unit.available?"Practise unit →":"Coming soon"}</button>
      </article>;
    })}</div>
    </>}
  </>;
}

function Stage89Student({ back }:{ back:()=>void }) {
  const [homeStage, setHomeStage] = useState<8 | 9>(8);
  const [sourceStage, setSourceStage] = useState<7 | 8 | 9>(8);
  const [records, setRecords] = useState<Record<number,{chapters:string[];enrolled:boolean}>>({8:{chapters:[],enrolled:false},9:{chapters:[],enrolled:false}});
  const [loaded, setLoaded] = useState(false);
  const [progress,setProgress]=useState<Record<string,{attempts:number;average:number;strong_sets:number;mastered:boolean}>>({});
  const [practice,setPractice]=useState<CrossStagePracticeUnit|null>(null);
  const [session,setSession]=useState<{id:string;source_stage:number;difficulty:string;questions:Array<{templateId?:string;objective?:string;difficulty?:string;answerFormat?:string;prompt:string;hint:string;source?:PastPaperPracticeSource}>}|null>(null);
  const [answers,setAnswers]=useState<string[]>([]),[hints,setHints]=useState<boolean[]>([]),[cursor,setCursor]=useState(0),[result,setResult]=useState<any>(null),[message,setMessage]=useState("");
  const stage7Available = stage7Chapters.filter(unit=>unit.id==="integers");
  const unitsForStage=(value:7|8|9):LowerSecondaryUnit[]=>value===9?stage9Units:value===8?stage8Units:stage7Available;
  const sourceForUnit=(id:string):7|8|9=>id.startsWith("s9-")?9:id.startsWith("s8-")?8:7;
  const accessibleStages = ([7,8,9] as const).filter(value=>value<=homeStage);
  const allAccessibleUnits:CrossStagePracticeUnit[]=accessibleStages.flatMap(value=>unitsForStage(value).map(unit=>({...unit,sourceStage:value})));
  const sourceUnits=unitsForStage(sourceStage).map(unit=>({...unit,sourceStage}));
  const focus=records[homeStage]?.chapters||[];
  const focusUnits=focus.map(id=>allAccessibleUnits.find(unit=>unit.id===id)).filter(Boolean) as CrossStagePracticeUnit[];
  const stage9Prerequisites:Record<string,string>={"s9-u1":"s8-u1","s9-u2":"s8-u2","s9-u3":"s8-u3","s9-u4":"s8-u2","s9-u5":"s8-u5","s9-u6":"s8-u16","s9-u7":"s8-u8","s9-u8":"s8-u7","s9-u9":"s8-u9","s9-u10":"s8-u11","s9-u11":"s8-u12","s9-u12":"s8-u13","s9-u13":"s8-u14","s9-u14":"s8-u15","s9-u15":"s8-u16"};
  const recommendedIds=homeStage===9
    ? stage9Units.filter(unit=>(progress[unit.id]?.attempts||0)>0&&(progress[unit.id]?.average||0)<70).map(unit=>stage9Prerequisites[unit.id])
    : (progress["s8-u1"]?.attempts||0)>0&&(progress["s8-u1"]?.average||0)<70?["integers"]:[];
  const recommendations=Array.from(new Set(recommendedIds)).map(id=>allAccessibleUnits.find(unit=>unit.id===id)).filter(Boolean) as CrossStagePracticeUnit[];

  useEffect(()=>{Promise.all([8,9].map(value=>fetch(`/api/lower-secondary/focus?stage=${value}`).then(response=>response.json()))).then(results=>{const next:any={};results.forEach(result=>next[result.stage]={chapters:Array.isArray(result.chapters)?result.chapters:[],enrolled:Boolean(result.enrolled)});setRecords(next);const first=([8,9] as const).find(value=>next[value]?.enrolled);if(first){setHomeStage(first);setSourceStage(first);}setLoaded(true);}).catch(()=>setLoaded(true));},[]);
  useEffect(()=>{const stages=([7,8,9] as const).filter(value=>value<=homeStage);Promise.all(stages.map(value=>fetch(`/api/lower-secondary/practice?stage=${value}&all=1`).then(response=>response.json()))).then(results=>{const next:Record<string,any>={};results.forEach(data=>(Array.isArray(data.units)?data.units:[]).forEach((item:any)=>next[item.chapter_id]=item));setProgress(next);});},[homeStage]);

  const chooseHomeStage=(value:8|9)=>{setHomeStage(value);setSourceStage(value);setMessage("");};
  const startPractice=async(unit:LowerSecondaryUnit,origin:7|8|9=sourceForUnit(unit.id))=>{setMessage("Preparing a fresh practice set…");const response=await fetch("/api/lower-secondary/practice",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"start",stage:origin,homeStage,chapter:unit.id})});const data=await response.json();if(!response.ok){setMessage(data.error||"Practice could not start.");return;}setPractice({...unit,sourceStage:origin});setSession(data);setAnswers(Array(data.questions.length).fill(""));setHints(Array(data.questions.length).fill(false));setCursor(0);setResult(null);setMessage("");};
  const submitPractice=async()=>{if(!session||!practice)return;setMessage("Marking and saving your set…");const response=await fetch("/api/lower-secondary/practice",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"submit",id:session.id,answers,hints})});const data=await response.json();if(!response.ok){setMessage(data.error||"The set could not be saved.");return;}setResult(data);setProgress(current=>({...current,[practice.id]:{attempts:(current[practice.id]?.attempts||0)+1,average:data.score,strong_sets:data.strong_sets,mastered:data.mastered}}));setMessage("");};
  const closePractice=()=>{setPractice(null);setSession(null);setResult(null);setMessage("");};
  const enrolledStages=([8,9] as const).filter(value=>records[value]?.enrolled);

  if(loaded&&!enrolledStages.length)return <><div className="portal-heading"><div><p>CAMBRIDGE LOWER SECONDARY MATHEMATICS</p><h1>Stages 8 and 9 mastery</h1><h2>Your teacher has not added you to a Stage 8 or Stage 9 class yet.</h2></div><button onClick={back}>← Assigned papers</button></div><section className="panel dashboard-empty">Ask your teacher to add your account under Stages 8 &amp; 9.</section></>;
  if(practice&&session){const question=session.questions[cursor];if(result)return <section className="stage7-practice panel practice-summary"><header><button onClick={closePractice}>← Curriculum</button><div><small>STAGE {practice.sourceStage} · PRACTICE COMPLETE</small><h2>{practice.title}</h2></div><span>{result.mastered?"Mastered":"Keep practising"}</span></header><main><div className="mastery-score"><b>{result.score}%</b><span>{result.score>=80?"Strong set achieved":"Target: 80%"}</span></div><h2>{result.mastered?`Stage ${practice.sourceStage} unit mastery achieved`:"Your worked review"}</h2><p>{result.strong_sets} of 2 strong sets completed · {result.hints_used} hints used</p><div className="worked-review">{result.results.map((item:any,index:number)=><article className={item.correct?"correct":"retry"} key={index}><span>{item.correct?"✓":"!"}</span><div><b>Question {index+1}: {item.prompt}</b><p>Your answer: {item.answer||"No answer"}</p><strong>{item.solution}</strong></div></article>)}</div></main><footer><button onClick={closePractice}>Return to curriculum</button><button className="primary" onClick={()=>startPractice(practice,practice.sourceStage)}>Start a fresh set →</button></footer></section>;
    return <section className="stage7-practice panel"><header><button onClick={closePractice}>← Curriculum</button><div><small>STAGE {practice.sourceStage} {practice.sourceStage<homeStage?"REVISION":"PRACTICE"} · {session.difficulty.toUpperCase()}</small><h2>{practice.title}</h2></div><span>Question {cursor+1} of {session.questions.length}</span></header><div className="practice-progress"><i style={{width:`${((cursor+1)/session.questions.length)*100}%`}}/></div><main><small>QUESTION {cursor+1}</small>{question.objective&&<p className="practice-objective">{question.objective}</p>}<h1>{question.prompt}</h1>{question.source&&<PastPaperPracticeCrop source={question.source}/>} {hints[cursor]&&<p className="practice-hint">Hint: {question.hint}</p>}<label>Your answer{question.answerFormat&&<small className="answer-format">Answer format: {question.answerFormat}</small>}<input value={answers[cursor]} placeholder={question.answerFormat||"Enter your answer"} onChange={event=>setAnswers(answers.map((value,index)=>index===cursor?event.target.value:value))} onKeyDown={event=>{if(event.key==="Enter"){event.preventDefault();cursor<session.questions.length-1?setCursor(cursor+1):submitPractice();}}} autoFocus/></label></main><footer><button onClick={()=>setHints(hints.map((value,index)=>index===cursor?true:value))}>{hints[cursor]?"Hint shown":"Show hint"}</button><div><button disabled={cursor===0} onClick={()=>setCursor(cursor-1)}>← Previous</button>{cursor<session.questions.length-1?<button className="primary" onClick={()=>setCursor(cursor+1)}>Next →</button>:<button className="primary" onClick={submitPractice}>Finish &amp; mark set →</button>}</div></footer>{message&&<p className="queue-message">{message}</p>}</section>;
  }

  return <><div className="portal-heading"><div><p>CAMBRIDGE LOWER SECONDARY · STAGE {homeStage} CLASS</p><h1>My mathematics mastery</h1><h2>Build current-stage mastery or revisit an earlier foundation whenever you need it.</h2></div><div className="stage89-switch">{enrolledStages.map(value=><button key={value} className={homeStage===value?"primary":""} onClick={()=>chooseHomeStage(value)}>Stage {value} class</button>)}<button onClick={back}>← Assigned papers</button></div></div>
    <section className="panel cross-stage-picker"><header><div><small>CHOOSE YOUR PRACTICE LEVEL</small><h3>Current learning and earlier-stage revision</h3><p>Mastery is always recorded against the original stage of each unit.</p></div></header><div className="stage89-switch">{accessibleStages.slice().reverse().map(value=><button key={value} className={sourceStage===value?"primary":""} onClick={()=>setSourceStage(value)}>{value===homeStage?`Stage ${value} current`:`Stage ${value} revision`}</button>)}</div></section>
    <section className="weekly-focus"><header><div><small>YOUR FOCUS THIS WEEK</small><h2>Stage {homeStage} class priorities</h2><p>Your teacher can include current units and prerequisite revision.</p></div><b>{focusUnits.length} units</b></header><div>{focusUnits.length?focusUnits.map(unit=>{const item=progress[unit.id];return <article key={`${unit.sourceStage}-${unit.id}`}><span>{unit.icon}</span><div><b>Stage {unit.sourceStage} · {unit.title}</b><p>{item?.mastered?"Mastered":`${item?.strong_sets||0} of 2 strong sets`}</p><i><em style={{width:`${Math.min(100,((item?.strong_sets||0)/2)*100)}%`}}/></i></div><button onClick={()=>startPractice(unit,unit.sourceStage)}>{item?.attempts?"Continue practice →":"Start practice →"}</button></article>}):<p className="dashboard-empty">Your teacher has not selected a weekly focus yet.</p>}</div></section>
    {recommendations.length>0&&<section className="panel foundation-recommendations"><header><div><small>RECOMMENDED FOR YOU</small><h3>Strengthen the foundation first</h3><p>Your recent results suggest that these earlier-stage units will help with your current work.</p></div><span>Adaptive revision</span></header><div>{recommendations.map(unit=><article key={`${unit.sourceStage}-${unit.id}`}><span>{unit.icon}</span><div><small>STAGE {unit.sourceStage} FOUNDATION</small><b>{unit.title}</b><p>{unit.summary}</p></div><button onClick={()=>startPractice(unit,unit.sourceStage)}>Practise foundation →</button></article>)}</div></section>}
    {message&&<p className="queue-message panel">{message}</p>}
    <div className="stage7-library-head"><div><small>{sourceStage===homeStage?`STAGE ${sourceStage} CURRICULUM`:`STAGE ${sourceStage} PREREQUISITE REVISION`}</small><h2>{sourceStage===homeStage?"Current curriculum library":"Earlier-stage foundations"}</h2><p>{sourceStage===7?"Stage 7 question coverage will grow as its library is completed.":`All ${sourceUnits.length} Stage ${sourceStage} units are open for revision.`}</p></div><span>{sourceUnits.filter(unit=>progress[unit.id]?.mastered).length} of {sourceUnits.length} mastered</span></div>
    <div className="stage7-chapter-grid student">{sourceUnits.map(unit=>{const item=progress[unit.id];const focused=focus.includes(unit.id);return <article key={`${sourceStage}-${unit.id}`} className={focused?"focus":""}><span>{unit.icon}</span><small>Stage {sourceStage} · {unit.strand}</small><h3>{unit.title}</h3><p>{unit.summary}</p><div><em>{item?.mastered?"Mastered":item?.attempts?"In progress":focused?"This week":"Not started"}</em><b>{item?.attempts?`${item.average}%`:"—"}</b></div><button onClick={()=>startPractice(unit,sourceStage)}>{focused?"Start weekly focus":"Practise unit"} →</button></article>})}</div>
  </>;
}

function Stage89StudentLegacy({ back }:{ back:()=>void }) {
  const [stage, setStage] = useState<8 | 9>(8);
  const [records, setRecords] = useState<Record<number,{chapters:string[];enrolled:boolean}>>({8:{chapters:[],enrolled:false},9:{chapters:[],enrolled:false}});
  const [loaded, setLoaded] = useState(false);
  const [progress,setProgress]=useState<Record<string,{attempts:number;average:number;strong_sets:number;mastered:boolean}>>({});
  const [practice,setPractice]=useState<LowerSecondaryUnit|null>(null);
  const [session,setSession]=useState<{id:string;difficulty:string;questions:Array<{templateId?:string;objective?:string;difficulty?:string;answerFormat?:string;prompt:string;hint:string;source?:PastPaperPracticeSource}>}|null>(null);
  const [answers,setAnswers]=useState<string[]>([]),[hints,setHints]=useState<boolean[]>([]),[cursor,setCursor]=useState(0),[result,setResult]=useState<any>(null),[message,setMessage]=useState("");
  useEffect(()=>{Promise.all([8,9].map(value=>fetch(`/api/lower-secondary/focus?stage=${value}`).then(response=>response.json()))).then(results=>{const next:any={};results.forEach(result=>next[result.stage]={chapters:Array.isArray(result.chapters)?result.chapters:[],enrolled:Boolean(result.enrolled)});setRecords(next);const first=([8,9] as const).find(value=>next[value]?.enrolled);if(first)setStage(first);setLoaded(true);}).catch(()=>setLoaded(true));},[]);
  useEffect(()=>{fetch(`/api/lower-secondary/practice?stage=${stage}`).then(response=>response.json()).then(data=>{const next:Record<string,any>={};(Array.isArray(data.units)?data.units:[]).forEach((item:any)=>next[item.chapter_id]=item);setProgress(next);});},[stage]);
  const enrolledStages = ([8,9] as const).filter(value=>records[value]?.enrolled);
  const units = stage===8?stage8Units:stage9Units;
  const focus = records[stage]?.chapters || [];
  const startPractice=async(unit:LowerSecondaryUnit)=>{setMessage("Preparing a fresh practice set…");const response=await fetch("/api/lower-secondary/practice",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"start",stage,chapter:unit.id})});const data=await response.json();if(!response.ok){setMessage(data.error||"Practice could not start.");return;}setPractice(unit);setSession(data);setAnswers(Array(data.questions.length).fill(""));setHints(Array(data.questions.length).fill(false));setCursor(0);setResult(null);setMessage("");};
  const submitPractice=async()=>{if(!session||!practice)return;setMessage("Marking and saving your set…");const response=await fetch("/api/lower-secondary/practice",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"submit",id:session.id,answers,hints})});const data=await response.json();if(!response.ok){setMessage(data.error||"The set could not be saved.");return;}setResult(data);setProgress(current=>({...current,[practice.id]:{attempts:(current[practice.id]?.attempts||0)+1,average:data.score,strong_sets:data.strong_sets,mastered:data.mastered}}));setMessage("");};
  const closePractice=()=>{setPractice(null);setSession(null);setResult(null);setMessage("");};
  if(loaded&&!enrolledStages.length)return <><div className="portal-heading"><div><p>CAMBRIDGE LOWER SECONDARY MATHEMATICS</p><h1>Stages 8 and 9 mastery</h1><h2>Your teacher has not added you to a Stage 8 or Stage 9 class yet.</h2></div><button onClick={back}>← Assigned papers</button></div><section className="panel dashboard-empty">Ask your teacher to add your account under Stages 8 &amp; 9.</section></>;
  if(practice&&session){const question=session.questions[cursor];if(result)return <section className="stage7-practice panel practice-summary"><header><button onClick={closePractice}>← Curriculum</button><div><small>STAGE {stage} · PRACTICE COMPLETE</small><h2>{practice.title}</h2></div><span>{result.mastered?"Mastered":"Keep practising"}</span></header><main><div className="mastery-score"><b>{result.score}%</b><span>{result.score>=80?"Strong set achieved":"Target: 80%"}</span></div><h2>{result.mastered?"Unit mastery achieved":"Your worked review"}</h2><p>{result.strong_sets} of 2 strong sets completed · {result.hints_used} hints used</p><div className="worked-review">{result.results.map((item:any,index:number)=><article className={item.correct?"correct":"retry"} key={index}><span>{item.correct?"✓":"!"}</span><div><b>Question {index+1}: {item.prompt}</b><p>Your answer: {item.answer||"No answer"}</p><strong>{item.solution}</strong></div></article>)}</div></main><footer><button onClick={closePractice}>Return to curriculum</button><button className="primary" onClick={()=>startPractice(practice)}>Start a fresh set →</button></footer></section>;
    return <section className="stage7-practice panel"><header><button onClick={closePractice}>← Curriculum</button><div><small>STAGE {stage} PRACTICE · {session.difficulty.toUpperCase()}</small><h2>{practice.title}</h2></div><span>Question {cursor+1} of {session.questions.length}</span></header><div className="practice-progress"><i style={{width:`${((cursor+1)/session.questions.length)*100}%`}}/></div><main><small>QUESTION {cursor+1}</small>{question.objective&&<p className="practice-objective">{question.objective}</p>}<h1>{question.prompt}</h1>{question.source&&<PastPaperPracticeCrop source={question.source}/>} {hints[cursor]&&<p className="practice-hint">Hint: {question.hint}</p>}<label>Your answer{question.answerFormat&&<small className="answer-format">Answer format: {question.answerFormat}</small>}<input value={answers[cursor]} placeholder={question.answerFormat||"Enter your answer"} onChange={event=>setAnswers(answers.map((value,index)=>index===cursor?event.target.value:value))} autoFocus/></label></main><footer><button onClick={()=>setHints(hints.map((value,index)=>index===cursor?true:value))}>{hints[cursor]?"Hint shown":"Show hint"}</button><div><button disabled={cursor===0} onClick={()=>setCursor(cursor-1)}>← Previous</button>{cursor<session.questions.length-1?<button className="primary" onClick={()=>setCursor(cursor+1)}>Next →</button>:<button className="primary" onClick={submitPractice}>Finish &amp; mark set →</button>}</div></footer>{message&&<p className="queue-message">{message}</p>}</section>;
  }
  return <><div className="portal-heading"><div><p>CAMBRIDGE LOWER SECONDARY · STAGE {stage}</p><h1>My mathematics mastery</h1><h2>This week’s focus is highlighted. Every unit stays open for revision.</h2></div><div className="stage89-switch">{enrolledStages.map(value=><button key={value} className={stage===value?"primary":""} onClick={()=>setStage(value)}>Stage {value}</button>)}<button onClick={back}>← Assigned papers</button></div></div>
    <section className="weekly-focus"><header><div><small>YOUR FOCUS THIS WEEK</small><h2>Stage {stage} priorities</h2><p>Work towards two strong practice sets at 80% or higher.</p></div><b>{focus.length} units</b></header><div>{focus.length?units.filter(unit=>focus.includes(unit.id)).map(unit=>{const item=progress[unit.id];return <article key={unit.id}><span>{unit.icon}</span><div><b>{unit.title}</b><p>{item?.mastered?"Mastered":`${item?.strong_sets||0} of 2 strong sets`}</p><i><em style={{width:`${Math.min(100,((item?.strong_sets||0)/2)*100)}%`}}/></i></div><button onClick={()=>startPractice(unit)}>{item?.attempts?"Continue practice →":"Start practice →"}</button></article>}):<p className="dashboard-empty">Your teacher has not selected a weekly focus yet.</p>}</div></section>
    {message&&<p className="queue-message panel">{message}</p>}
    <div className="stage7-library-head"><div><small>ALL STAGE {stage} UNITS</small><h2>Curriculum library</h2><p>All {units.length} units remain available for revision.</p></div><span>{Object.values(progress).filter(item=>item.mastered).length} of {units.length} mastered</span></div><div className="stage7-chapter-grid student">{units.map(unit=>{const item=progress[unit.id];return <article key={unit.id} className={focus.includes(unit.id)?"focus":""}><span>{unit.icon}</span><small>{unit.strand}</small><h3>{unit.title}</h3><p>{unit.summary}</p><div><em>{item?.mastered?"Mastered":item?.attempts?"In progress":focus.includes(unit.id)?"This week":"Not started"}</em><b>{item?.attempts?`${item.average}%`:"—"}</b></div><button onClick={()=>startPractice(unit)}>{focus.includes(unit.id)?"Start weekly focus":"Practise unit"} →</button></article>})}</div>
  </>;
}

function Stage7Teacher() {
  const [focus, setFocus] = useState<string[]>([]);
  const [saved, setSaved] = useState<"loading" | "idle" | "saving" | "saved" | "error">("loading");
  const [integerProgress, setIntegerProgress] = useState<any[]>([]);
  const [stage7Students, setStage7Students] = useState<Array<{id:string;name:string;username:string;enrolled:boolean}>>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentSave, setStudentSave] = useState("");
  useEffect(() => {
    fetch("/api/lower-secondary/focus")
      .then((response) => response.json())
      .then((result) => { setFocus(Array.isArray(result.chapters) ? result.chapters : []); setSaved("idle"); })
      .catch(() => setSaved("error"));
    fetch("/api/lower-secondary/practice").then(r=>r.json()).then(result=>setIntegerProgress(Array.isArray(result.students)?result.students:[]));
    fetch("/api/lower-secondary/students").then(r=>r.json()).then(result=>setStage7Students(Array.isArray(result)?result:[]));
  }, []);
  const toggle = (id: string) => {
    setSaved("idle");
    setFocus((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : current.length >= 6
          ? current
          : [...current, id],
    );
  };
  const saveFocus = async () => {
    setSaved("saving");
    const response = await fetch("/api/lower-secondary/focus", {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ chapters: focus }),
    });
    setSaved(response.ok ? "saved" : "error");
  };
  const saveStage7Students = async () => {
    setStudentSave("Saving class…");
    const response=await fetch("/api/lower-secondary/students",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({studentIds:stage7Students.filter(student=>student.enrolled).map(student=>student.id)})});
    const result=await response.json(); setStudentSave(response.ok?`${result.enrolled} student${result.enrolled===1?"":"s"} saved to Stage 7.`:result.error||"Class could not be saved.");
  };
  return (
    <>
      <div className="portal-heading stage7-heading">
        <div>
          <p>CAMBRIDGE LOWER SECONDARY · STAGE 7</p>
          <h1>Weekly mastery focus</h1>
          <h2>Highlight this week’s priorities while keeping every chapter open for revision.</h2>
        </div>
        <button className="primary" disabled={saved === "loading" || saved === "saving"} onClick={saveFocus}>
          {saved === "saved" ? "✓ Weekly focus saved" : saved === "saving" ? "Saving…" : saved === "loading" ? "Loading focus…" : `Save weekly focus (${focus.length})`}
        </button>
      </div>
      <section className="stage7-rule panel">
        <span>80%</span>
        <div><b>Mastery rule</b><p>Two practice sets at 80% or higher. Teachers can reset or override mastery at any time.</p></div>
        <div><b>All chapters stay open</b><p>The weekly focus is highlighted, not locked. Students can revise any earlier topic.</p></div>
      </section>
      <section className="panel stage7-class-manager"><header><div><h3>Stage 7 students</h3><p>Add existing student accounts to this mastery class.</p></div><b>{stage7Students.filter(student=>student.enrolled).length} enrolled</b></header><div className="stage7-class-tools"><input value={studentSearch} onChange={event=>setStudentSearch(event.target.value)} placeholder="Search students…"/><button className="primary" onClick={saveStage7Students}>Save Stage 7 class</button></div>{studentSave&&<p className="queue-message">{studentSave}</p>}<div className="stage7-student-picker">{stage7Students.filter(student=>`${student.name} ${student.username}`.toLowerCase().includes(studentSearch.toLowerCase())).map(student=><label key={student.id} className={student.enrolled?"selected":""}><input type="checkbox" checked={student.enrolled} onChange={()=>{setStudentSave("");setStage7Students(current=>current.map(item=>item.id===student.id?{...item,enrolled:!item.enrolled}:item));}}/><span>{student.name.split(" ").map(part=>part[0]).slice(0,2).join("")}</span><div><b>{student.name}</b><small>@{student.username}</small></div><em>{student.enrolled?"Added":"Add"}</em></label>)}</div></section>
      <section className="panel stage7-progress-panel"><header><div><h3>Integers and place value progress</h3><p>Cloud-saved practice activity for the first automatic chapter engine</p></div><span>{integerProgress.filter(student=>student.mastered).length} mastered</span></header>{integerProgress.length?integerProgress.map(student=><article key={student.student_id}><span>{student.student_name.split(" ").map((part:string)=>part[0]).slice(0,2).join("")}</span><div><b>{student.student_name}</b><small>{student.attempts} practice sets · Last average {student.average}%</small></div><em className={student.mastered?"mastered":"progress"}>{student.mastered?"Mastered":`${student.strong_sets}/2 strong sets`}</em></article>):<p className="dashboard-empty">Student attempts will appear here after the first practice set is completed.</p>}</section>
      {["Number", "Algebra", "Geometry and Measure", "Statistics and Probability"].map((strand) => (
        <section className="stage7-strand" key={strand}>
          <header><div><small>STAGE 7 STRAND</small><h2>{strand}</h2></div><span>{stage7Chapters.filter((chapter) => chapter.strand === strand).length} chapters</span></header>
          <div className="stage7-chapter-grid teacher">
            {stage7Chapters.filter((chapter) => chapter.strand === strand).map((chapter) => {
              const selected = focus.includes(chapter.id);
              return <button key={chapter.id} className={selected ? "selected" : ""} onClick={() => toggle(chapter.id)}>
                <span>{chapter.icon}</span><div><b>{chapter.title}</b><p>{chapter.summary}</p></div><em>{selected ? "✓ This week" : "+ Add focus"}</em>
              </button>;
            })}
          </div>
        </section>
      ))}
    </>
  );
}

function Stage7Student({ back }: { back: () => void }) {
  const [focus, setFocus] = useState<string[]>([]);
  const [practice, setPractice] = useState<(typeof stage7Chapters)[number] | null>(null);
  const [session, setSession] = useState<{id:string;difficulty:string;questions:Array<{prompt:string;hint:string}>}|null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [hints, setHints] = useState<boolean[]>([]);
  const [cursor, setCursor] = useState(0);
  const [result, setResult] = useState<any|null>(null);
  const [progress, setProgress] = useState<{attempts:number;average:number;strong_sets:number;mastered:boolean}>({attempts:0,average:0,strong_sets:0,mastered:false});
  const [practiceMessage, setPracticeMessage] = useState("");
  useEffect(() => {
    fetch("/api/lower-secondary/focus")
      .then((response) => response.json())
      .then((result) => setFocus(Array.isArray(result.chapters) ? result.chapters : []));
    fetch("/api/lower-secondary/practice").then(r=>r.json()).then(data=>setProgress(data));
  }, []);
  const startPractice = async (chapter:(typeof stage7Chapters)[number]) => {
    if(chapter.id!=="integers"){ setPracticeMessage("The automatic question engine is currently available for Integers and place value. The other chapter engines are next."); return; }
    setPracticeMessage("Preparing a fresh practice set…");
    const response=await fetch("/api/lower-secondary/practice",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"start",chapter:"integers"})});
    const data=await response.json(); if(!response.ok){setPracticeMessage(data.error||"Practice could not start.");return;}
    setPractice(chapter); setSession(data); setAnswers(Array(data.questions.length).fill("")); setHints(Array(data.questions.length).fill(false)); setCursor(0); setResult(null); setPracticeMessage("");
  };
  const submitPractice=async()=>{
    if(!session)return; setPracticeMessage("Marking and saving your set…");
    const response=await fetch("/api/lower-secondary/practice",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"submit",id:session.id,answers,hints})});
    const data=await response.json(); if(!response.ok){setPracticeMessage(data.error||"The set could not be saved.");return;} setResult(data); setProgress({attempts:progress.attempts+1,average:data.score,strong_sets:data.strong_sets,mastered:data.mastered}); setPracticeMessage("");
  };
  if (practice && session) {
    const question=session.questions[cursor];
    if(result) return <section className="stage7-practice panel practice-summary"><header><button onClick={()=>{setPractice(null);setSession(null);setResult(null);}}>← Curriculum</button><div><small>PRACTICE COMPLETE</small><h2>{practice.title}</h2></div><span>{result.mastered?"Mastered":"Keep practising"}</span></header><main><div className="mastery-score"><b>{result.score}%</b><span>{result.score>=80?"Strong set achieved":"Target: 80%"}</span></div><h2>{result.mastered?"Chapter mastery achieved":"Your worked review"}</h2><p>{result.strong_sets} of 2 strong sets completed · {result.hints_used} hints used</p><div className="worked-review">{result.results.map((item:any,index:number)=><article className={item.correct?"correct":"retry"} key={index}><span>{item.correct?"✓":"!"}</span><div><b>Question {index+1}: {item.prompt}</b><p>Your answer: {item.answer||"No answer"}</p><strong>{item.solution}</strong></div></article>)}</div></main><footer><button onClick={()=>{setPractice(null);setSession(null);setResult(null);}}>Return to curriculum</button><button className="primary" onClick={()=>startPractice(practice)}>Start a fresh set →</button></footer></section>;
    return <section className="stage7-practice panel"><header><button onClick={()=>{setPractice(null);setSession(null);}}>← Curriculum</button><div><small>STAGE 7 PRACTICE · {session.difficulty.toUpperCase()}</small><h2>{practice.title}</h2></div><span>Question {cursor+1} of {session.questions.length}</span></header><div className="practice-progress"><i style={{width:`${((cursor+1)/session.questions.length)*100}%`}} /></div><main><small>QUESTION {cursor+1}</small><h1>{question.prompt}</h1>{hints[cursor]&&<p className="practice-hint">Hint: {question.hint}</p>}<label>Your answer<input value={answers[cursor]} onChange={event=>setAnswers(answers.map((value,index)=>index===cursor?event.target.value:value))} onKeyDown={event=>{if(event.key==="Enter"){event.preventDefault();cursor<session.questions.length-1?setCursor(cursor+1):submitPractice();}}} inputMode="numeric" autoFocus /></label></main><footer><button onClick={()=>setHints(hints.map((value,index)=>index===cursor?true:value))}>{hints[cursor]?"Hint shown":"Show hint"}</button><div><button disabled={cursor===0} onClick={()=>setCursor(cursor-1)}>← Previous</button>{cursor<session.questions.length-1?<button className="primary" onClick={()=>setCursor(cursor+1)}>Next →</button>:<button className="primary" onClick={submitPractice}>Finish & mark set →</button>}</div></footer>{practiceMessage&&<p className="queue-message">{practiceMessage}</p>}</section>;
  }
  return <>
    <div className="portal-heading"><div><p>CAMBRIDGE LOWER SECONDARY · STAGE 7</p><h1>My mathematics mastery</h1><h2>Complete this week’s focus or revise any chapter whenever you choose.</h2></div><button onClick={back}>← Assigned papers</button></div>
    <section className="weekly-focus"><header><div><small>YOUR FOCUS THIS WEEK</small><h2>Build confidence with number</h2><p>Complete two practice sets at 80% or higher.</p></div><b>{progress.strong_sets} strong sets</b></header><div>{stage7Chapters.filter((chapter) => focus.includes(chapter.id)).map((chapter) => <article key={chapter.id}><span>{chapter.icon}</span><div><b>{chapter.title}</b><p>{chapter.id==="integers"?(progress.mastered?"Mastered":`${progress.attempts} attempts · ${progress.average}% recent average`):"Question engine coming next"}</p><i><em style={{ width: chapter.id==="integers"?`${Math.min(100,(progress.strong_sets/2)*100)}%`:"0%" }} /></i></div><button onClick={() => startPractice(chapter)}>{chapter.id==="integers"?(progress.attempts?"Continue practice →":"Start practice →"):"Preview"}</button></article>)}</div></section>
    {practiceMessage&&<p className="queue-message panel">{practiceMessage}</p>}
    <div className="stage7-library-head"><div><small>ALL STAGE 7 CHAPTERS</small><h2>Curriculum library</h2><p>Everything remains available for independent revision.</p></div><span>{progress.mastered?1:0} of {stage7Chapters.length} mastered</span></div>
    <div className="stage7-chapter-grid student">{stage7Chapters.map((chapter) => <article key={chapter.id} className={focus.includes(chapter.id) ? "focus" : ""}><span>{chapter.icon}</span><small>{chapter.strand}</small><h3>{chapter.title}</h3><p>{chapter.summary}</p><div><em>{chapter.id==="integers"?(progress.mastered?"Mastered":progress.attempts?"In progress":"Not started"):"Available soon"}</em><b>{chapter.id==="integers"?`${progress.average||0}%`:"—"}</b></div><button onClick={() => startPractice(chapter)}>{chapter.id==="integers"?(focus.includes(chapter.id)?"Start weekly focus":"Practise chapter"):"Question engine next"} →</button></article>)}</div>
  </>;
}
function Papers({ upload }: { upload: () => void }) {
  const [assignments, setAssignments] = useState<AssignmentSummary[]>([]);
  const [studentAccounts, setStudentAccounts] = useState<
    Array<{ id: string; name: string; username: string }>
  >([]);
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [assignmentStatus, setAssignmentStatus] = useState<
    Record<string, Record<string, string>>
  >({});
  const [managing, setManaging] = useState<(typeof assignments)[number] | null>(null);
  const [reviewingFiles, setReviewingFiles] = useState<AssignmentSummary | null>(null);
  const [studentSearch, setStudentSearch] = useState("");
  const [message, setMessage] = useState("");
  const [questionSetup, setQuestionSetup] = useState<{
    id: string;
    title: string;
    subject: string;
    syllabus: string;
    paper_mode: "structured" | "multiple_choice";
    lower_secondary_stage?: number | null;
    is_practice_library?: boolean;
    resource_kind?: "exam" | "homework";
    content_start_page?: number | null;
    content_end_page?: number | null;
  } | null>(null);
  useEffect(() => {
    fetch("/api/assignments")
      .then((r) => r.json())
      .then(async (rows) => {
        const list = Array.isArray(rows) ? rows : [];
        setAssignments(list);
        const details = await Promise.all(
          list.map(async (assignment: { id: string }) => {
            const response = await fetch(`/api/assignments/${assignment.id}/students`);
            return [assignment.id, response.ok ? await response.json() : []] as const;
          }),
        );
        setSelected(
          Object.fromEntries(
            details.map(([id, students]) => [
              id,
              Array.isArray(students)
                ? students.map((student) => String(student.student_id))
                : [],
            ]),
          ),
        );
        setAssignmentStatus(
          Object.fromEntries(
            details.map(([id, students]) => [
              id,
              Object.fromEntries(
                Array.isArray(students)
                  ? students.map((student) => [
                      String(student.student_id),
                      String(student.status),
                    ])
                  : [],
              ),
            ]),
          ),
        );
      });
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then(setStudentAccounts);
  }, []);
  async function openStudentManager(assignment: (typeof assignments)[number]) {
    setManaging(assignment);
    setStudentSearch("");
    const response = await fetch(`/api/assignments/${assignment.id}/students`);
    const rows = response.ok ? await response.json() : [];
    const ids = Array.isArray(rows) ? rows.map((row) => String(row.student_id)) : [];
    setSelected((current) => ({ ...current, [assignment.id]: ids }));
    setAssignmentStatus((current) => ({
      ...current,
      [assignment.id]: Object.fromEntries(
        Array.isArray(rows)
          ? rows.map((row) => [String(row.student_id), String(row.status)])
          : [],
      ),
    }));
  }
  async function saveStudents(id: string) {
    const studentIds = selected[id] || [];
    const response = await fetch(`/api/assignments/${id}/students`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ studentIds }),
    });
    const result = await response.json();
    setMessage(
      response.ok
        ? `Student list saved. ${result.assigned} student${result.assigned === 1 ? "" : "s"} assigned.`
        : result.error || "Assignment failed.",
    );
    if (response.ok) setManaging(null);
  }
  return (
    <>
      <div className="portal-heading">
        <div>
          <p>CONTENT LIBRARY</p>
          <h1>Papers & assignments</h1>
          <h2>Upload materials once, then assign them to any class.</h2>
        </div>
        <button className="primary" onClick={upload}>
          ＋ New assignment
        </button>
      </div>
      <section className="panel paper-table">
        <header>
          <div>
            <h3>Cambridge paper library</h3>
            <p>Saved papers and pilot assignments</p>
          </div>
          <input placeholder="Search papers…" />
        </header>
        {message && <p>{message}</p>}
        {assignments.filter(assignment=>!assignment.is_practice_library).map((assignment) => (
          <article key={assignment.id}>
            <span>PDF</span>
            <div>
              <b>{assignment.title}</b>
              <small>
                {assignment.subject} · {assignment.syllabus} · {" "}
                {assignment.due_date
                  ? `Due ${new Date(assignment.due_date).toLocaleDateString("en-ZA")}`
                  : "No due date"}
              </small>
              <em className={assignment.status === "assigned" ? "paper-ready" : "paper-paused"}>
                {assignment.status === "assigned" ? "Ready for students" : "Teacher review needed"}
              </em>
            </div>
            <p>{(selected[assignment.id] || []).length} assigned</p>
            <div className="paper-actions">
              <button onClick={() => setReviewingFiles(assignment)}>
                Review files
              </button>
              <button onClick={() => openStudentManager(assignment)}>
                Manage students
              </button>
              <button
                className="question-setup-button"
                onClick={() => setQuestionSetup(assignment)}
              >
                Set up questions
              </button>
            </div>
          </article>
        ))}
      </section>
      {reviewingFiles && (
        <FileReview
          assignment={reviewingFiles}
          close={() => setReviewingFiles(null)}
          openSetup={() => {
            setQuestionSetup(reviewingFiles);
            setReviewingFiles(null);
          }}
          replaced={(status, message) => {
            setAssignments((current) =>
              current.map((assignment) =>
                assignment.id === reviewingFiles.id
                  ? { ...assignment, status }
                  : assignment,
              ),
            );
            setReviewingFiles((current) =>
              current ? { ...current, status } : current,
            );
            setMessage(message);
          }}
        />
      )}
      {questionSetup && (
        <QuestionSetup
          assignment={questionSetup}
          close={() => setQuestionSetup(null)}
          saved={() => {
            setAssignments((current) =>
              current.map((assignment) =>
                assignment.id === questionSetup.id
                  ? { ...assignment, status: "assigned" }
                  : assignment,
              ),
            );
            setMessage("Question setup approved. The paper is ready for students.");
            setQuestionSetup(null);
          }}
        />
      )}
      {managing && (
        <div className="portal-modal" onMouseDown={() => setManaging(null)}>
          <form
            className="student-assignment-manager"
            onMouseDown={(event) => event.stopPropagation()}
            onSubmit={(event) => {
              event.preventDefault();
              saveStudents(managing.id);
            }}
          >
            <button type="button" className="x" onClick={() => setManaging(null)}>×</button>
            <small>MANAGE PAPER ACCESS</small>
            <h2>{managing.title}</h2>
            <p>Select every student who should receive this paper.</p>
            <input
              className="student-manager-search"
              value={studentSearch}
              onChange={(event) => setStudentSearch(event.target.value)}
              placeholder="Search by student name or username…"
            />
            <div className="student-manager-actions">
              <b>{(selected[managing.id] || []).length} of {studentAccounts.length} selected</b>
              <button
                type="button"
                onClick={() =>
                  setSelected((current) => ({
                    ...current,
                    [managing.id]: studentAccounts.map((student) => student.id),
                  }))
                }
              >Select all</button>
              <button
                type="button"
                onClick={() =>
                  setSelected((current) => ({ ...current, [managing.id]: [] }))
                }
              >Clear</button>
            </div>
            <div className="student-manager-list">
              {studentAccounts
                .filter((student) =>
                  `${student.name} ${student.username}`
                    .toLowerCase()
                    .includes(studentSearch.trim().toLowerCase()),
                )
                .map((student) => {
                  const checked = (selected[managing.id] || []).includes(student.id);
                  const status = assignmentStatus[managing.id]?.[student.id] || "not_started";
                  return (
                    <label key={student.id}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setSelected((current) => ({
                            ...current,
                            [managing.id]: checked
                              ? (current[managing.id] || []).filter((id) => id !== student.id)
                              : [...(current[managing.id] || []), student.id],
                          }))
                        }
                      />
                      <span><b>{student.name}</b><small>@{student.username}</small></span>
                      <em>{status.replaceAll("_", " ")}</em>
                    </label>
                  );
                })}
            </div>
            <button className="primary">Save student list</button>
          </form>
        </div>
      )}
    </>
  );
}

function FileReview({
  assignment,
  close,
  openSetup,
  replaced,
}: {
  assignment: AssignmentSummary;
  close: () => void;
  openSetup: () => void;
  replaced: (status: string, message: string) => void;
}) {
  const [activeFile, setActiveFile] = useState<"paper" | "scheme">("paper");
  const [replacement, setReplacement] = useState<File | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [message, setMessage] = useState("");
  const hasMarkScheme = assignment.resource_kind !== "homework";
  const endpoint = `/api/assignments/${assignment.id}/${activeFile}`;

  async function replaceFile() {
    if (!replacement) {
      setMessage("Choose a PDF first.");
      return;
    }
    if (activeFile === "paper" && !confirmReset) {
      setMessage("Confirm that the current question setup may be reset.");
      return;
    }
    setReplacing(true);
    setMessage("");
    try {
      let requestBody: BodyInit;
      let headers: HeadersInit | undefined;
      if (assignment.resource_kind === "homework" && activeFile === "paper") {
        if (replacement.size > 60_000_000) throw new Error("The homework PDF must be smaller than 60 MB.");
        const uploaded = await uploadBlob(
          `homework/${crypto.randomUUID()}/${replacement.name}`,
          replacement,
          { access: "private", handleUploadUrl: "/api/blob-upload", multipart: true },
        );
        requestBody = JSON.stringify({ paperUrl: uploaded.url });
        headers = { "content-type": "application/json" };
      } else {
        const form = new FormData();
        form.set(activeFile, replacement);
        requestBody = form;
      }
      const response = await fetch(endpoint, { method: "PUT", body: requestBody, headers });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(result.error || "The PDF could not be replaced.");
        return;
      }
      const nextStatus = activeFile === "paper" ? "needs_setup" : "needs_review";
      const successMessage =
        activeFile === "paper"
          ? "Question paper replaced. Run question setup again before students can open it."
          : "Mark scheme replaced. Re-extract and approve the answers before students can continue.";
      setMessage(successMessage);
      replaced(nextStatus, successMessage);
      setReplacement(null);
      setConfirmReset(false);
    } catch {
      setMessage("The PDF could not be replaced. Please try again.");
    } finally {
      setReplacing(false);
    }
  }

  function changeTab(next: "paper" | "scheme") {
    setActiveFile(next);
    setReplacement(null);
    setConfirmReset(false);
    setMessage("");
  }

  return (
    <div className="portal-modal file-review-modal" onMouseDown={close}>
      <section
        className="file-review-shell"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div>
            <small>REVIEW UPLOADED FILES</small>
            <h2>{assignment.title}</h2>
            <p>{assignment.subject} · {assignment.syllabus}</p>
          </div>
          <button className="x" onClick={close} aria-label="Close file review">×</button>
        </header>
        <nav className="file-review-tabs" aria-label="Uploaded files">
          <button
            className={activeFile === "paper" ? "active" : ""}
            onClick={() => changeTab("paper")}
          >
            Question paper
          </button>
          {hasMarkScheme && <button
            className={activeFile === "scheme" ? "active" : ""}
            onClick={() => changeTab("scheme")}
          >
            Mark scheme
          </button>}
        </nav>
        <div className="file-review-body">
          <div className="file-preview-frame">
            <iframe
              key={endpoint}
              src={endpoint}
              title={activeFile === "paper" ? "Question paper preview" : "Mark scheme preview"}
            />
          </div>
          <aside>
            <span className="file-status">{hasMarkScheme ? "PDF uploaded" : "Homework source uploaded"}</span>
            <h3>{activeFile === "paper" ? "Question paper" : "Mark scheme"}</h3>
            <p>
              {activeFile === "paper"
                ? hasMarkScheme
                  ? "Review the pages and question layout. Replacing this file resets the saved question crops so they cannot point to the wrong paper."
                  : "Review the homework pages. Replacing this file resets the saved worksheet crops so they cannot point to the wrong page."
                : "Review the answer table and marking notes. Replacing this file pauses student access until the answers are extracted and approved again."}
            </p>
            <a href={endpoint} target="_blank" rel="noreferrer">
              Open full PDF ↗
            </a>
            <label className="file-replacement-picker">
              <span>Choose replacement PDF</span>
              <input
                type="file"
                accept="application/pdf,.pdf"
                disabled={replacing}
                onChange={(event) => {
                  setReplacement(event.target.files?.[0] || null);
                  setMessage("");
                }}
              />
              <b>{replacement?.name || "No replacement selected"}</b>
            </label>
            {activeFile === "paper" && replacement && (
              <label className="file-reset-confirmation">
                <input
                  type="checkbox"
                  checked={confirmReset}
                  onChange={(event) => setConfirmReset(event.target.checked)}
                />
                <span>I understand that question setup must be run again.</span>
              </label>
            )}
            <button
              className="primary replace-uploaded-file"
              disabled={!replacement || replacing || (activeFile === "paper" && !confirmReset)}
              onClick={replaceFile}
            >
              {replacing
                ? "Replacing PDF…"
                : `Replace ${activeFile === "paper" ? "question paper" : "mark scheme"}`}
            </button>
            {message && <p className="file-review-message">{message}</p>}
            {assignment.status !== "assigned" && (
              <button className="continue-file-setup" onClick={openSetup}>
                Continue to question setup →
              </button>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
}

type PaperQuestion = {
  id?: string;
  position?: number;
  label: string;
  marks: number | null;
  page_number: number;
  crop_x: number;
  crop_y: number;
  crop_width: number;
  crop_height: number;
  response_type?: "typed" | "drawing" | "multiple_choice";
  answer_slots?: number;
  response_layout?: "answer" | "working" | "formula";
  expected_answer?: string | null;
  mark_scheme_notes?: string | null;
  topic?: string | null;
  draft_answer?: string | null;
  draft_accepted_answer?: string | null;
  draft_confidence?: "high" | "medium" | "review" | null;
  extracted_question_text?: string | null;
};

const QUESTION_CROP_TOP_PADDING = 0.02;
function displayCrop(question: PaperQuestion) {
  const extraTop = Math.min(QUESTION_CROP_TOP_PADDING, question.crop_y);
  const y = Math.max(0, question.crop_y - extraTop);
  return {
    x: question.crop_x,
    y,
    width: question.crop_width,
    height: Math.min(1 - y, question.crop_height + extraTop),
  };
}

type HomeworkDraft = {
  answer: string;
  acceptedAnswer: string | null;
  confidence: "high" | "medium" | "review";
};

function calculateExpression(source: string) {
  const normalized = source
    .replace(/[×xX]/g, "*")
    .replace(/[÷:]/g, "/")
    .replace(/[−–—]/g, "-")
    .replace(/\^/g, "^")
    .replace(/\s+/g, "");
  if (!normalized || !/^[\d.+\-*/^()]+$/.test(normalized)) return null;
  const tokens = normalized.match(/\d+(?:\.\d+)?|[()+\-*/^]/g) || [];
  if (tokens.join("") !== normalized) return null;
  let cursor = 0;
  const primary = (): number => {
    const token = tokens[cursor++];
    if (token === "+") return primary();
    if (token === "-") return -primary();
    if (token === "(") {
      const value = expression();
      if (tokens[cursor++] !== ")") throw new Error("parenthesis");
      return value;
    }
    const value = Number(token);
    if (!Number.isFinite(value)) throw new Error("number");
    return value;
  };
  const power = (): number => {
    let value = primary();
    while (tokens[cursor] === "^") {
      cursor += 1;
      value **= power();
    }
    return value;
  };
  const term = (): number => {
    let value = power();
    while (tokens[cursor] === "*" || tokens[cursor] === "/") {
      const operator = tokens[cursor++];
      const right = power();
      value = operator === "*" ? value * right : value / right;
    }
    return value;
  };
  const expression = (): number => {
    let value = term();
    while (tokens[cursor] === "+" || tokens[cursor] === "-") {
      const operator = tokens[cursor++];
      const right = term();
      value = operator === "+" ? value + right : value - right;
    }
    return value;
  };
  try {
    const value = expression();
    if (cursor !== tokens.length || !Number.isFinite(value) || Math.abs(value) > 1e12) return null;
    return Math.abs(value - Math.round(value)) < 1e-10
      ? String(Math.round(value))
      : String(Number(value.toFixed(8)));
  } catch {
    return null;
  }
}

function homeworkNumber(value: number) {
  if (!Number.isFinite(value)) return null;
  return Math.abs(value - Math.round(value)) < 1e-10
    ? String(Math.round(value))
    : String(Number(value.toFixed(8)));
}

function homeworkGcd(left: number, right: number) {
  let a = Math.abs(Math.round(left));
  let b = Math.abs(Math.round(right));
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

function simplifyHomeworkRatio(left: number, right: number) {
  if (!Number.isInteger(left) || !Number.isInteger(right) || !left || !right) return null;
  const divisor = homeworkGcd(left, right);
  return `${left / divisor}:${right / divisor}`;
}

function simplifyLinearTerms(source: string) {
  const normalized = source.replace(/\s+/g, "").replace(/[−–—]/g, "-").replace(/X/g, "x");
  if (!/x/i.test(normalized) || !/^[+\-\d.x]+$/i.test(normalized)) return null;
  const terms = normalized.match(/[+\-]?(?:\d+(?:\.\d+)?)?x|[+\-]?\d+(?:\.\d+)?/gi) || [];
  if (!terms.length || terms.join("") !== normalized) return null;
  let coefficient = 0;
  let constant = 0;
  for (const term of terms) {
    if (/x/i.test(term)) {
      const raw = term.replace(/x/i, "");
      coefficient += raw === "" || raw === "+" ? 1 : raw === "-" ? -1 : Number(raw);
    } else constant += Number(term);
  }
  if (!Number.isFinite(coefficient) || !Number.isFinite(constant)) return null;
  const parts: string[] = [];
  if (coefficient) parts.push(`${coefficient === 1 ? "" : coefficient === -1 ? "-" : homeworkNumber(coefficient)}x`);
  if (constant) parts.push(`${parts.length && constant > 0 ? "+" : ""}${homeworkNumber(constant)}`);
  return parts.join("") || "0";
}

function homeworkExerciseBlocks(lines: string[]) {
  const starts = lines
    .map((line, index) => {
      const match = line.match(/^\s*[\[(]?\s*(\d{1,2})\s*[\]).]?\s+(?=(?:[a-z][.)]?\s+)?(?:work|write|find|calculate|complete|copy|solve|simplify|round|draw|construct|shade|plot|show|estimate|measure|state|give|which|what|how|use|express|convert|the\b))/i);
      return match ? { index, label: match[1] } : null;
    })
    .filter((entry): entry is { index: number; label: string } => !!entry)
    .filter((entry, index, all) => index === 0 || entry.label !== all[index - 1].label);
  if (starts.length < 2) return [];
  return starts.map((start, index) => ({
    label: start.label,
    text: lines.slice(start.index, starts[index + 1]?.index ?? lines.length).join("\n"),
  }));
}

function generateHomeworkDraftFromText(rawText: string, splitExercises = true): HomeworkDraft {
  const text = rawText
    .replace(/[|]/g, "I")
    .replace(/[−–—]/g, "-")
    .replace(/[⁰]/g, "0").replace(/[¹]/g, "1").replace(/[²]/g, "^2").replace(/[³]/g, "^3")
    .replace(/\r/g, "")
    .trim();
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  if (splitExercises) {
    const blocks = homeworkExerciseBlocks(lines);
    if (blocks.length >= 2) {
      const drafts = blocks.map((block) => ({
        label: block.label,
        draft: generateHomeworkDraftFromText(block.text, false),
      }));
      const answer = drafts.map(({ label, draft }) => {
        const review = draft.confidence === "review" ? "Teacher review required" : "Automatic draft";
        return `Question ${label} · ${review}\n${draft.answer}`;
      }).join("\n\n");
      const reviewCount = drafts.filter(({ draft }) => draft.confidence === "review").length;
      return {
        answer: `${answer}\n\nCoverage check: ${drafts.length} numbered exercises were detected and all are listed above.${reviewCount ? ` ${reviewCount} need teacher input before this page is used for automatic practice.` : " Check each result before approval."}`,
        acceptedAnswer: null,
        confidence: reviewCount ? "review" : "medium",
      };
    }
  }
  const firstExercise = lines.findIndex((line) => /^1(?:\s|[.)])/i.test(line));
  const exerciseLines = (firstExercise >= 0 ? lines.slice(firstExercise) : lines).slice(0, 120);
  const working: Array<{ method: string; answer: string }> = [];
  const seen = new Set<string>();
  const add = (method: string, answer: string) => {
    const key = `${method.replace(/\s+/g, "")}=${answer}`;
    if (!seen.has(key)) {
      seen.add(key);
      working.push({ method: method.trim(), answer });
    }
  };
  exerciseLines.forEach((line) => {
    for (const match of line.matchAll(/(-?\d+(?:\.\d+)?(?:\s*[+\-×xX÷/^]\s*-?\d+(?:\.\d+)?)+)/g)) {
      const value = calculateExpression(match[1]);
      if (value !== null) add(match[1], value);
    }
    for (const match of line.matchAll(/(\d+(?:\.\d+)?)\s*%\s+of\s+(\d+(?:\.\d+)?)/gi)) {
      const value = Number(match[1]) * Number(match[2]) / 100;
      add(match[0], String(Number(value.toFixed(8))));
    }
    const equation = line.match(/(-?\d+(?:\.\d+)?)?\s*[xX]\s*([+\-]\s*\d+(?:\.\d+)?)?\s*=\s*(-?\d+(?:\.\d+)?)/);
    if (equation) {
      const coefficient = equation[1] ? Number(equation[1]) : 1;
      const constant = equation[2] ? Number(equation[2].replace(/\s/g, "")) : 0;
      const right = Number(equation[3]);
      if (coefficient) add(equation[0], String(Number(((right - constant) / coefficient).toFixed(8))));
    }
    for (const match of line.matchAll(/((?:[+\-]?\s*(?:\d+(?:\.\d+)?)?\s*[xX])(?:\s*[+\-]\s*(?:\d+(?:\.\d+)?)?\s*[xX])+(?:\s*[+\-]\s*\d+(?:\.\d+)?)?)/g)) {
      const value = simplifyLinearTerms(match[1]);
      if (value !== null) add(`Simplify ${match[1]}`, value);
    }
    if (/ratio|simplest form|simplify/i.test(line)) {
      for (const match of line.matchAll(/\b(\d+)\s*:\s*(\d+)\b/g)) {
        const value = simplifyHomeworkRatio(Number(match[1]), Number(match[2]));
        if (value && value !== `${match[1]}:${match[2]}`) add(`Simplify ${match[0]}`, value);
      }
    }
  });
  const joinedExercises = exerciseLines.join(" ");
  for (const match of joinedExercises.matchAll(/(\d+(?:\.\d+)?)\s*%\s+of\s+(\d+(?:\.\d+)?)/gi)) {
    const value = homeworkNumber(Number(match[1]) * Number(match[2]) / 100);
    if (value !== null) add(match[0], value);
  }
  for (const match of joinedExercises.matchAll(/(?:position-to-term rule|term(?:-to-term)? rule)[^.]{0,100}?multiply by\s*(\d+(?:\.\d+)?)[^.]{0,60}?(?:then\s*)?(add|subtract)\s*(\d+(?:\.\d+)?)/gi)) {
    const multiplier = Number(match[1]);
    const adjustment = Number(match[3]) * (match[2].toLowerCase() === "subtract" ? -1 : 1);
    const terms = [1, 2, 3, 4, 5].map((position) => homeworkNumber(position * multiplier + adjustment)).filter(Boolean);
    if (terms.length === 5) add("First five terms", terms.join(", "));
  }
  for (const match of joinedExercises.matchAll(/(?:round|write)\s+(\d+(?:\.\d+)?)\s+(?:to|correct to)\s+the nearest\s+(ten|hundred|thousand)/gi)) {
    const place = match[2].toLowerCase() === "ten" ? 10 : match[2].toLowerCase() === "hundred" ? 100 : 1000;
    add(match[0], String(Math.round(Number(match[1]) / place) * place));
  }
  for (const match of joinedExercises.matchAll(/(?:mean|average)\s+of\s+((?:-?\d+(?:\.\d+)?(?:\s*,\s*|\s+and\s+))+?-?\d+(?:\.\d+)?)/gi)) {
    const values = match[1].match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
    const value = values.length ? homeworkNumber(values.reduce((sum, item) => sum + item, 0) / values.length) : null;
    if (value !== null) add(match[0], value);
  }
  const visualQuestion = /draw|construct|shade|plot|graph|diagram|measure|matrix|matrices|vector|translation|reflection|rotation/i.test(joinedExercises);
  if (!working.length) {
    const recognisedSummary = exerciseLines
      .filter((line) => !/^example\b/i.test(line))
      .slice(0, 14)
      .join("\n")
      .slice(0, 1400);
    return {
      answer: visualQuestion
        ? `Visual or construction task detected. Keep this question for teacher marking.\n\nRecognised task:\n${recognisedSummary || "The page image needs teacher review."}`
        : `The question was recognised, but a reliable automatic solution was not produced. This usually means it is a written-reasoning or multi-step task rather than a direct calculation.\n\nRecognised task:\n${recognisedSummary || "Review the page crop and enter the marking answer manually."}`,
      acceptedAnswer: null,
      confidence: "review",
    };
  }
  const answer = working
    .slice(0, 60)
    .map((item, index) => `${index + 1}. ${item.method} = ${item.answer}`)
    .join("\n");
  return {
    answer,
    acceptedAnswer: working.length === 1 && !visualQuestion ? working[0].answer : null,
    confidence: working.length === 1 && !visualQuestion ? "high" : visualQuestion ? "review" : "medium",
  };
}

function QuestionCropPreview({
  pdf,
  question,
}: {
  pdf: any;
  question: PaperQuestion;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!pdf || !ref.current) return;
    let cancelled = false;
    let renderTask: any;
    pdf.getPage(question.page_number).then((pdfPage: any) => {
      if (cancelled || !ref.current) return;
      const visibleCrop = displayCrop(question);
      const viewport = pdfPage.getViewport({ scale: 1.5 });
      const canvas = ref.current;
      canvas.width = Math.max(1, Math.round(viewport.width * visibleCrop.width));
      canvas.height = Math.max(
        1,
        Math.round(viewport.height * visibleCrop.height),
      );
      renderTask = pdfPage.render({
        canvas,
        canvasContext: canvas.getContext("2d")!,
        viewport,
        transform: [
          1,
          0,
          0,
          1,
          -viewport.width * visibleCrop.x,
          -viewport.height * visibleCrop.y,
        ],
      });
      return renderTask.promise;
    });
    return () => {
      cancelled = true;
      renderTask?.cancel?.();
    };
  }, [pdf, question]);
  return <canvas ref={ref} aria-label={`Question ${question.label} crop`} />;
}

function QuestionSetup({
  assignment,
  close,
  saved,
}: {
  assignment: { id: string; title: string; subject: string; syllabus: string; paper_mode: "structured" | "multiple_choice"; lower_secondary_stage?: number | null; is_practice_library?: boolean; resource_kind?: "exam" | "homework"; content_start_page?: number | null; content_end_page?: number | null };
  close: () => void;
  saved: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const homeworkOcrWorkerRef = useRef<any>(null);
  const [pdf, setPdf] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [label, setLabel] = useState("1");
  const [marks, setMarks] = useState("");
  const [responseType, setResponseType] = useState<
    "typed" | "drawing" | "multiple_choice"
  >(assignment.paper_mode === "multiple_choice" ? "multiple_choice" : "typed");
  const [expectedAnswer, setExpectedAnswer] = useState("");
  const [markSchemeNotes, setMarkSchemeNotes] = useState("");
  const [crop, setCrop] = useState({
    x: 0.04,
    y: 0.08,
    width: 0.92,
    height: 0.3,
  });
  const [items, setItems] = useState<PaperQuestion[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [extractingScheme, setExtractingScheme] = useState(false);
  const [replacingScheme, setReplacingScheme] = useState(false);
  const [generatingDraft, setGeneratingDraft] = useState<number | null>(null);
  const [splittingHomeworkPage, setSplittingHomeworkPage] = useState<number | null>(null);
  const [reviewingScheme, setReviewingScheme] = useState(false);
  const [reviewedQuestions, setReviewedQuestions] = useState<
    Record<number, boolean>
  >({});
  const [reviewFilter, setReviewFilter] = useState<
    "all" | "needs-review" | "missing" | "drawing" | "approved"
  >("all");
  const [reviewCursor, setReviewCursor] = useState(0);
  const [message, setMessage] = useState("Loading paper…");
  const detectorLabel = assignment.is_practice_library
    ? "Lower Secondary table-guided detector v6"
    : assignment.resource_kind === "homework"
      ? "Homework chapter detector v2"
    : "Cambridge table-guided detector v5";
  useEffect(() => {
    Promise.all([
      import("pdfjs-dist").then(async (pdfjs) => {
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const data = await fetch(
          `/api/assignments/${assignment.id}/paper`,
        ).then((response) => response.arrayBuffer());
        return pdfjs.getDocument({ data }).promise;
      }),
      fetch(`/api/assignments/${assignment.id}/questions`).then((response) =>
        response.json(),
      ),
    ])
      .then(([document, saved]) => {
        setPdf(document);
        setItems(Array.isArray(saved) ? saved : []);
        setLabel(String((Array.isArray(saved) ? saved.length : 0) + 1));
        setMessage("");
      })
      .catch(() => setMessage("The paper could not be loaded."));
  }, [assignment.id]);
  useEffect(() => () => {
    void homeworkOcrWorkerRef.current?.terminate?.();
    homeworkOcrWorkerRef.current = null;
  }, []);
  useEffect(() => {
    if (!pdf) return;
    pdf.getPage(page).then(async (pdfPage: any) => {
      const viewport = pdfPage.getViewport({ scale: 1.15 });
      const canvas = canvasRef.current!;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await pdfPage.render({
        canvas,
        canvasContext: canvas.getContext("2d")!,
        viewport,
      }).promise;
    });
  }, [pdf, page]);
  const pointer = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)),
    };
  };
  const startCrop = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = pointer(event);
    dragStart.current = point;
    setCrop({ ...point, width: 0, height: 0 });
  };
  const moveCrop = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragStart.current) return;
    const point = pointer(event);
    const start = dragStart.current;
    setCrop({
      x: Math.min(start.x, point.x),
      y: Math.min(start.y, point.y),
      width: Math.abs(point.x - start.x),
      height: Math.abs(point.y - start.y),
    });
  };
  const finishCrop = () => {
    dragStart.current = null;
  };
  const topicFor = (text: string) => {
    if (assignment.is_practice_library && assignment.lower_secondary_stage) {
      const stage = assignment.lower_secondary_stage;
      const rules = stage === 8
        ? [
            ["s8-u13", /probability|chance|outcome|spinner|die|dice/i], ["s8-u6", /questionnaire|sample|survey|collect(?:ing)? data/i], ["s8-u16", /mean|median|mode|range|frequency|stem(?:-and-| and )leaf|data|chart|table/i], ["s8-u14", /translation|reflection|rotation|enlargement|transformation|symmetr|coordinate/i], ["s8-u15", /perimeter|area|volume|surface area|length|distance|capacity|cm|mm|metre/i], ["s8-u5", /angle|parallel|perpendicular|construct|bearing/i], ["s8-u8", /polygon|triangle|quadrilateral|shape|congruent/i], ["s8-u11", /graph|gradient|axis|axes|plot/i], ["s8-u9", /sequence|term|function|mapping|rule/i], ["s8-u2", /equation|inequalit|expression|formula|factoris|expand|simplif|substitut|algebra|\bx\b|\by\b/i], ["s8-u10", /percent/i], ["s8-u12", /ratio|proportion|rate|scale/i], ["s8-u7", /fraction|mixed number|numerator|denominator/i], ["s8-u4", /decimal/i], ["s8-u3", /round|place value|estimate|significant figure/i], ["s8-u1", /integer|prime|factor|multiple|square|cube|root|power|index|negative|positive/i],
          ] as const
        : [
            ["s9-u12", /probability|chance|outcome|spinner|die|dice/i], ["s9-u6", /questionnaire|sample|survey|collect(?:ing)? data/i], ["s9-u15", /mean|median|mode|range|frequency|stem(?:-and-| and )leaf|data|chart|table/i], ["s9-u13", /translation|reflection|rotation|enlargement|transformation|vector|coordinate/i], ["s9-u14", /volume|surface area|symmetr/i], ["s9-u7", /perimeter|area|length|distance|shape|polygon|triangle|quadrilateral|construct/i], ["s9-u5", /angle|parallel|perpendicular|bearing/i], ["s9-u10", /graph|gradient|axis|axes|plot/i], ["s9-u9", /sequence|term|function|mapping|rule/i], ["s9-u4", /equation|inequalit|solve/i], ["s9-u2", /expression|formula|factoris|expand|simplif|substitut|algebra|\bx\b|\by\b/i], ["s9-u3", /decimal|percent|round|estimate|significant figure/i], ["s9-u11", /ratio|proportion|rate|scale/i], ["s9-u8", /fraction|mixed number|numerator|denominator/i], ["s9-u1", /integer|prime|factor|multiple|square|cube|root|power|index|number/i],
          ] as const;
      return rules.find(([, pattern]) => pattern.test(text))?.[0] || (stage === 8 ? "s8-u1" : "s9-u1");
    }
    const rules = assignment.subject === "Physics"
      ? [
          ["Forces and motion", /speed|velocity|acceleration|force|momentum|distance|time|motion/i],
          ["Energy, work and power", /energy|work|power|efficiency/i],
          ["Thermal physics", /temperature|thermal|heat|evaporation|gas|pressure/i],
          ["Waves, light and sound", /wave|light|lens|reflection|refraction|sound|frequency|wavelength/i],
          ["Electricity and magnetism", /current|voltage|resistance|circuit|charge|magnet|transformer/i],
          ["Atomic and nuclear physics", /atom|nuclear|radioactive|radiation|half-life|isotope/i],
        ] as const
      : [
          ["Number", /number|fraction|decimal|percentage|ratio|standard form/i],
          ["Algebra", /equation|expression|factor|expand|sequence|function|algebra/i],
          ["Geometry and measure", /angle|shape|polygon|circle|length|area|volume|bearing/i],
          ["Graphs and coordinate geometry", /graph|coordinate|gradient|line|curve/i],
          ["Statistics and probability", /mean|median|mode|probability|frequency|histogram|data/i],
        ] as const;
    return rules.find(([, pattern]) => pattern.test(text))?.[0] || "General skills";
  };
  const addQuestion = () => {
    if (!label.trim() || crop.width < 0.03 || crop.height < 0.03) {
      setMessage("Enter a question number and draw a box around the question.");
      return;
    }
    const question = {
      label: label.trim(),
      marks: Number(marks) || null,
      page_number: page,
      crop_x: crop.x,
      crop_y: crop.y,
      crop_width: crop.width,
      crop_height: crop.height,
      response_type: responseType,
      expected_answer: expectedAnswer.trim() || null,
      mark_scheme_notes: markSchemeNotes.trim() || null,
    };
    if (editingIndex === null) setItems([...items, question]);
    else
      setItems(
        items.map((item, index) => (index === editingIndex ? question : item)),
      );
    setEditingIndex(null);
    setLabel(
      String(editingIndex === null ? items.length + 2 : items.length + 1),
    );
    setMarks("");
    setResponseType(
      assignment.paper_mode === "multiple_choice" ? "multiple_choice" : "typed",
    );
    setExpectedAnswer("");
    setMarkSchemeNotes("");
    setMessage(
      editingIndex === null
        ? "Question added. Select the next question on the paper."
        : "Question crop updated.",
    );
  };
  const reviewQuestion = (item: PaperQuestion, index: number) => {
    setEditingIndex(index);
    setPage(item.page_number);
    setLabel(item.label);
    setMarks(item.marks ? String(item.marks) : "");
    setResponseType(item.response_type || "typed");
    setExpectedAnswer(item.expected_answer || "");
    setMarkSchemeNotes(item.mark_scheme_notes || "");
    setCrop({
      x: item.crop_x,
      y: item.crop_y,
      width: item.crop_width,
      height: item.crop_height,
    });
    setMessage(`Reviewing question ${item.label}. Redraw the box if needed.`);
  };
  const autoDetect = async () => {
    setDetecting(true);
    setMessage(
      `${detectorLabel}: reading the official question and answer tables…`,
    );
    try {
      const response = await fetch(`/api/assignments/${assignment.id}/analyze`, {
        method: "POST",
      });
      const responseText = await response.text();
      let result: {
        error?: string;
        questions?: PaperQuestion[];
        matched?: number;
        total?: number;
        missing_labels?: string[];
        sections?: Array<{ number: number; title: string; unitId: string; firstPage: number; lastPage: number }>;
      } = {};
      if (responseText) {
        try {
          result = JSON.parse(responseText);
        } catch {
          throw new Error(
            `Paper analysis returned an unreadable response (${response.status}).`,
          );
        }
      }
      if (!response.ok) {
        throw new Error(
          result.error || `Paper analysis could not finish (${response.status}).`,
        );
      }
      if (!Array.isArray(result.questions) || !result.questions.length) {
        throw new Error("No securely matched questions were returned.");
      }
      if (
        assignment.is_practice_library &&
        (result.questions.length <= 1 || Number(result.total || 0) <= 1)
      ) {
        throw new Error(
          "Only an instructional example was found, so the flexible scanner will be used.",
        );
      }
      const detected = result.questions;
      setItems(detected);
      setReviewedQuestions({});
      setReviewingScheme(true);
      setReviewCursor(0);
      reviewQuestion(detected[0], 0);
      const missing = Array.isArray(result.missing_labels)
        ? result.missing_labels
        : [];
      setMessage(
        assignment.resource_kind === "homework"
          ? `${result.matched} worksheet pages were organised into ${result.sections?.length || 0} book chapters and matched to Stage ${assignment.lower_secondary_stage || 8} units. Review the chapter allocation and draft answers; only pages with a teacher-approved accepted answer will enter automatic practice.`
          : missing.length
          ? `${result.matched} of ${result.total} official question rows were matched. ${missing.length} unmatched label${missing.length === 1 ? "" : "s"} need teacher review: ${missing.join(", ")}.`
          : `${result.matched} of ${result.total} official question rows were matched with marks and expected answers. Review the proposals, then approve them for students.`,
      );
    } catch (error) {
      if (assignment.is_practice_library) {
        setMessage("The mark scheme does not use the Cambridge exam-table layout. Switching to the flexible Stage 8–9 question scanner…");
        await autoDetectLegacy();
        return;
      }
      setMessage(
        error instanceof Error
          ? error.message
          : "Paper analysis could not finish. No questions were changed.",
      );
    } finally {
      setDetecting(false);
    }
  };
  const autoDetectLegacy = async () => {
    if (!pdf) return;
    const detectorVersion = detectorLabel;
    setDetecting(true);
    setMessage(`${detectorVersion}: scanning for questions and subquestions…`);
    type Marker = {
      kind: "main" | "letter" | "roman";
      label: string;
      main: string;
      letter: string;
      page: number;
      top: number;
      cropTop: number;
    };
    const markers: Marker[] = [];
    const pageText = new Map<number, Array<{ text: string; top: number }>>();
    let currentMain = "";
    let currentLetter = "";
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const pdfPage = await pdf.getPage(pageNumber);
      const viewport = pdfPage.getViewport({ scale: 1 });
      const content = await pdfPage.getTextContent();
      const tokens = (content.items as any[])
        .map((item) => ({
          text: String(item.str || "")
            .trim()
            .toLowerCase(),
          x: Number(item.transform?.[4] || 0),
          y: Number(item.transform?.[5] || 0),
          horizontal:
            Math.abs(Number(item.transform?.[1] || 0)) < 0.01 &&
            Math.abs(Number(item.transform?.[2] || 0)) < 0.01,
        }))
        .filter(
          (item) =>
            !!item.text &&
            item.y > viewport.height * 0.06 && item.y < viewport.height * 0.94,
        )
        .sort((a, b) => (Math.abs(b.y - a.y) > 4 ? b.y - a.y : a.x - b.x))
        .filter(
          (item, index, all) =>
            !all
              .slice(0, index)
              .some(
                (previous) =>
                  previous.text === item.text &&
                  Math.abs(previous.y - item.y) < 5 &&
                  Math.abs(previous.x - item.x) < 8,
              ),
        );
      pageText.set(
        pageNumber,
        tokens.map((token) => ({
          text: token.text,
          top: (viewport.height - token.y) / viewport.height,
        })),
      );
      let mainTopOnPage: number | null = null;
      let letterTopOnPage: number | null = null;
      let mainHasChild = false;
      let letterHasChild = false;
      const addMain = (main: string, top: number) => {
        currentMain = main;
        currentLetter = "";
        mainTopOnPage = top;
        letterTopOnPage = null;
        mainHasChild = false;
        letterHasChild = false;
        markers.push({
          kind: "main",
          label: currentMain,
          main: currentMain,
          letter: "",
          page: pageNumber,
          top,
          cropTop: top,
        });
      };
      const addLetter = (letter: string, top: number) => {
        const firstLetter = !mainHasChild;
        mainHasChild = true;
        letterHasChild = false;
        currentLetter = letter;
        letterTopOnPage = top;
        markers.push({
          kind: "letter",
          label: `${currentMain}(${letter})`,
          main: currentMain,
          letter,
          page: pageNumber,
          top,
          cropTop:
            firstLetter && mainTopOnPage !== null ? mainTopOnPage : top,
        });
      };
      const addRoman = (roman: string, top: number) => {
        const firstRoman = !letterHasChild;
        letterHasChild = true;
        markers.push({
          kind: "roman",
          label: `${currentMain}(${currentLetter})(${roman})`,
          main: currentMain,
          letter: currentLetter,
          page: pageNumber,
          top,
          cropTop:
            firstRoman && letterTopOnPage !== null ? letterTopOnPage : top,
        });
      };
      const textRows: Array<{ y: number; tokens: typeof tokens }> = [];
      tokens.forEach((token) => {
        const row = textRows.find((candidate) =>
          Math.abs(candidate.y - token.y) <= 4,
        );
        if (row) row.tokens.push(token);
        else textRows.push({ y: token.y, tokens: [token] });
      });
      textRows
        .sort((a, b) => b.y - a.y)
        .forEach((row) => {
        const ordered = row.tokens.sort((a, b) => a.x - b.x);
        const labelBand = ordered.filter(
          (token) =>
            token.x >= viewport.width * 0.025 &&
            token.x < viewport.width * 0.31,
        );
        // Physics nested parts such as (i) and (ii) are indented to about
        // 16% of the page. Mathematics uses a tighter boundary so table and
        // stem-and-leaf values beginning near 19% remain excluded.
        const labelColumnLimit =
          assignment.subject === "Physics" ? 0.18 : 0.14;
        if (
          !labelBand.length ||
          labelBand[0].x > viewport.width * labelColumnLimit
        )
          return;
        const top = Math.max(
          0.02,
          (viewport.height - row.y - 20) / viewport.height,
        );
        const leftText = labelBand
          .map((token) => token.text)
          .join("")
          .replace(/\s+/g, "");
        const firstLabelText = labelBand[0].text.replace(/\s+/g, "");
        // Main question numbers sit in the outer margin. Requiring that
        // narrow column prevents values in tables, graphs and stems from
        // advancing the question sequence, while still allowing indented
        // part labels to use the wider label band above.
        const mainPrefix =
          labelBand[0].x < viewport.width * 0.11
            ? firstLabelText.match(/^(\d{1,2})(?![.\d])/)?.[1] || ""
            : "";
        const mainNumber = mainPrefix ? Number(mainPrefix) : null;
        const previousMainNumber = Number(currentMain || 0);
        const isExpectedMain =
          mainNumber !== null &&
          mainNumber >= 1 &&
          mainNumber <= 50 &&
          ((!previousMainNumber && mainNumber === 1) ||
            mainNumber === previousMainNumber + 1);
        if (isExpectedMain) addMain(mainPrefix, top);
        const labelPrefix = isExpectedMain
          ? leftText.slice(mainPrefix.length)
          : leftText;
        const partPrefix =
          labelPrefix.match(
            /^((?:\((?:[a-z]|i{1,3}|iv|v|vi{0,3}|ix|x)\)){1,2})/,
          )?.[1] || "";
        const detectedParts = Array.from(
          partPrefix.matchAll(/\(([a-z]|i{1,3}|iv|v|vi{0,3}|ix|x)\)/g),
          (match) => match[1].toLowerCase(),
        );
        if (!currentMain || !detectedParts.length) return;
        if (detectedParts.length >= 2) {
          addLetter(detectedParts[0], top);
          addRoman(detectedParts[1], top);
          return;
        }
        const part = detectedParts[0];
        const isRoman = /^(i|ii|iii|iv|v|vi|vii|viii|ix|x)$/.test(part);
        if (isRoman && currentLetter && !isExpectedMain) addRoman(part, top);
        else addLetter(part, top);
      });
    }
    const reliableMarkers = markers.filter(
      (marker, index, all) =>
        !all.slice(0, index).some(
          (previous) =>
            previous.label === marker.label &&
            previous.page === marker.page &&
            Math.abs(previous.top - marker.top) < 0.018,
        ),
    );
    // A final structural barrier protects the question list even if a table,
    // graph or footer is ever mistaken for a label by the PDF text reader.
    // Main question numbers may stay the same for subparts or advance by one;
    // they can never be zero, move backwards or jump ahead.
    const validatedMarkers: Marker[] = [];
    let validatedMain = 0;
    reliableMarkers.forEach((marker) => {
      const main = Number(marker.main);
      if (!Number.isInteger(main) || main < 1 || main > 50) return;
      if (!validatedMain) {
        if (main !== 1 || marker.kind !== "main") return;
        validatedMain = main;
      } else if (main === validatedMain + 1 && marker.kind === "main") {
        validatedMain = main;
      } else if (main !== validatedMain) {
        return;
      }
      validatedMarkers.push(marker);
    });
    const rejectedMarkerCount = reliableMarkers.length - validatedMarkers.length;
    // Some AS Physics PDFs position roman subparts just outside the normal
    // label column. Recover them from the text inside an apparent lettered
    // parent so the parent stem is not presented as an answerable question.
    const structuredMarkers: Marker[] = [];
    if (assignment.subject !== "Physics") {
      structuredMarkers.push(...validatedMarkers);
    } else validatedMarkers.forEach((marker, markerIndex) => {
      structuredMarkers.push(marker);
      if (marker.kind !== "letter") return;
      const nextBoundary = validatedMarkers
        .slice(markerIndex + 1)
        .find(
          (candidate) =>
            candidate.page !== marker.page ||
            candidate.kind === "main" ||
            candidate.kind === "letter",
        );
      const alreadyHasRoman = validatedMarkers
        .slice(markerIndex + 1)
        .some(
          (candidate) =>
            candidate.page === marker.page &&
            candidate.main === marker.main &&
            candidate.letter === marker.letter &&
            candidate.kind === "roman" &&
            (!nextBoundary || candidate.top < nextBoundary.top),
        );
      if (alreadyHasRoman) return;
      const bottom =
        nextBoundary?.page === marker.page ? nextBoundary.top : 0.96;
      const recovered = (pageText.get(marker.page) || [])
        .filter((word) => word.top > marker.top + 0.015 && word.top < bottom)
        .map((word) => ({
          roman: word.text.match(/^\((i{1,3}|iv|v|vi{0,3}|ix|x)\)/i)?.[1],
          top: word.top,
        }))
        .filter(
          (value): value is { roman: string; top: number } => !!value.roman,
        )
        .filter(
          (value, index, all) =>
            !all.slice(0, index).some((previous) => previous.roman === value.roman),
        );
      recovered.forEach(({ roman, top }, index) =>
        structuredMarkers.push({
          kind: "roman",
          label: `${marker.main}(${marker.letter})(${roman.toLowerCase()})`,
          main: marker.main,
          letter: marker.letter,
          page: marker.page,
          top,
          cropTop: index === 0 ? marker.cropTop : top,
        }),
      );
    });
    structuredMarkers.sort((a, b) =>
      a.page === b.page ? a.top - b.top : a.page - b.page,
    );
    const uniqueStructuredMarkers = structuredMarkers.filter(
      (marker, index, all) =>
        !all
          .slice(0, index)
          .some(
            (previous) =>
              previous.label.toLowerCase().replace(/\s+/g, "") ===
              marker.label.toLowerCase().replace(/\s+/g, ""),
          ),
    );
    const leaves = uniqueStructuredMarkers.filter((marker, index) => {
      if (marker.kind === "roman") return true;
      const following = uniqueStructuredMarkers.slice(index + 1);
      if (marker.kind === "main") {
        const boundary = following.findIndex((item) => item.kind === "main");
        const beforeNextMain = following.slice(
          0,
          boundary < 0 ? following.length : boundary,
        );
        return !beforeNextMain.some(
          (item) => item.main === marker.main && item.kind !== "main",
        );
      }
      const boundary = following.findIndex(
        (item) => item.kind === "main" || item.kind === "letter",
      );
      const beforeNextPart = following.slice(
        0,
        boundary < 0 ? following.length : boundary,
      );
      return !beforeNextPart.some(
        (item) =>
          item.kind === "roman" &&
          item.main === marker.main &&
          item.letter === marker.letter,
      );
    });
    const detectedMainCount = uniqueStructuredMarkers.filter(
      (marker) => marker.kind === "main",
    ).length;
    const detectedLetterCount = uniqueStructuredMarkers.filter(
      (marker) => marker.kind === "letter",
    ).length;
    const detectedRomanCount = uniqueStructuredMarkers.filter(
      (marker) => marker.kind === "roman",
    ).length;
    const detected: PaperQuestion[] = leaves.map((marker, index) => {
      const nextOnPage = leaves
        .slice(index + 1)
        .find((item) => item.page === marker.page);
      const bottom = nextOnPage ? nextOnPage.cropTop - 0.008 : 0.97;
      const instruction = (pageText.get(marker.page) || [])
        .filter(
          (word) =>
            word.top >= marker.cropTop &&
            word.top <= Math.max(bottom, marker.top),
        )
        .map((word) => word.text)
        .join(" ");
      const responseRows: Array<{ top: number; text: string[] }> = [];
      (pageText.get(marker.page) || [])
        .filter(
          (word) =>
            word.top >= marker.cropTop &&
            word.top <= Math.max(bottom, marker.top),
        )
        .forEach((word) => {
          const row = responseRows.find(
            (candidate) => Math.abs(candidate.top - word.top) < 0.006,
          );
          if (row) row.text.push(word.text);
          else responseRows.push({ top: word.top, text: [word.text] });
        });
      const inlineAnswerSpaces = responseRows.filter((row) => {
        const text = row.text.join(" ");
        return /[a-z]/i.test(text) && /\.{5,}/.test(text);
      }).length;
      const drawingInstruction =
        /\b(draw|shade|sketch|plot|construct|complete (?:the )?(?:[a-z-]+ )*(?:graph|diagram|table)|mark (?:on|the)|show on the (?:grid|diagram)|join)\b/i.test(
          instruction,
        );
      const normalizedLabel = marker.label.replace(
        /^(\d{1,2})\(([a-hj-uwyz])\)\(\2\)$/i,
        "$1($2)",
      );
      return {
        label: normalizedLabel,
        marks: assignment.paper_mode === "multiple_choice" ? 1 : null,
        page_number: marker.page,
        crop_x: 0.025,
        crop_y: marker.cropTop,
        crop_width: 0.95,
        crop_height: Math.max(
          0.08,
          Math.min(0.95 - marker.cropTop, bottom - marker.cropTop),
        ),
        response_type:
          assignment.paper_mode === "multiple_choice"
            ? "multiple_choice"
            : drawingInstruction
              ? "drawing"
              : "typed",
        answer_slots: Math.max(1, Math.min(4, inlineAnswerSpaces)),
        response_layout:
          assignment.subject === "Physics" && /\bcalculate\b/i.test(instruction)
            ? "formula"
            : "answer",
        expected_answer: null,
        topic: topicFor(instruction),
      };
    });
    setDetecting(false);
    if (!detected.length) {
      setMessage(
        "No reliable question numbers were found. This PDF may be image-only, so manual selection is still available.",
      );
      return;
    }
    setItems(detected);
    setReviewedQuestions({});
    reviewQuestion(detected[0], 0);
    setMessage(
      `${detectorVersion}: scanned all ${pdf.numPages} pages and proposed ${detected.length} answer spaces. Matching the uploaded mark scheme now…`,
    );
    await extractMarkScheme(undefined, detected);
  };
  const extractMarkScheme = async (
    targetIndex?: number,
    detectedItems?: PaperQuestion[],
  ) => {
    const workingItems = detectedItems || items;
    if (!workingItems.length) {
      setMessage(
        "Detect or add the paper questions before scanning the mark scheme.",
      );
      return;
    }
    setExtractingScheme(true);
    setMessage("Reading the mark scheme and matching question rows…");
    let extractionStage = "opening the uploaded mark scheme";
    try {
      if (
        assignment.subject === "Mathematics" ||
        assignment.subject === "Physics"
      ) {
        extractionStage = "matching the mark-scheme table securely";
        const response = await fetch(
          `/api/assignments/${assignment.id}/extract-scheme`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ questions: workingItems }),
          },
        );
        const responseText = await response.text();
        let result: {
          error?: string;
          matched?: number;
          total?: number;
          questions?: PaperQuestion[];
        } = {};
        if (responseText) {
          try {
            result = JSON.parse(responseText);
          } catch {
            if (!response.ok) {
              throw new Error(
                `Secure extraction failed (${response.status}). Please try again.`,
              );
            }
            throw new Error("Secure extraction returned an unreadable response");
          }
        }
        if (!response.ok && !assignment.is_practice_library)
          throw new Error(result.error || `Secure extraction failed (${response.status}). Please try again.`);
        if (
          response.ok &&
          Number(result.matched) > 0 &&
          Array.isArray(result.questions) &&
          result.questions.length === workingItems.length
        ) {
          const extractedItems = result.questions as PaperQuestion[];
          const nextItems =
            typeof targetIndex === "number"
              ? workingItems.map((item, index) =>
                  index === targetIndex ? extractedItems[index] : item,
                )
              : extractedItems;
          setItems(nextItems);
          setReviewedQuestions((current) =>
            typeof targetIndex === "number"
              ? { ...current, [targetIndex]: false }
              : {},
          );
          setReviewingScheme(true);
          if (detectedItems?.length) reviewQuestion(nextItems[0], 0);
          else if (editingIndex !== null)
            reviewQuestion(nextItems[editingIndex], editingIndex);
          setMessage(
            typeof targetIndex === "number"
              ? `Question ${nextItems[targetIndex].label} was re-extracted. Check the proposed answer before approval.`
              : `${result.matched} of ${result.total} questions were matched from the uploaded mark-scheme table. Review the proposed answers before approval.`,
          );
          return;
        }
      }
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const data = await fetch(`/api/assignments/${assignment.id}/scheme`).then(
        (response) => {
          if (!response.ok) throw new Error("Mark scheme unavailable");
          return response.arrayBuffer();
        },
      );
      const scheme = await pdfjs.getDocument({ data }).promise;
      const compact = (value: string) =>
        value.toLowerCase().replace(/\s+/g, "");
      const canonicalLabel = (value: string) =>
        compact(value).replace(
          /^(\d{1,2})\(([a-hj-uwyz])\)\(\2\)$/i,
          "$1($2)",
        );
      const labelAtStart = (line: string, label: string) => {
        const value = compact(line);
        const target = compact(label);
        if (!value.startsWith(target)) return false;
        const remainder = value.slice(target.length);
        if (remainder.startsWith("(")) return false;
        return (
          !/^\d+$/.test(target) ||
          !/^\d/.test(remainder.slice(0, 1))
        );
      };
      const schemeRowLabel = (line: string) => {
        const match = line.match(
          /^\s*(\d{1,2})(?:\s*(\([a-z]\)))?(?:\s*(\((?:i{1,3}|iv|v|vi{0,3}|ix|x)\)))?(?=\s|$)/i,
        );
        return match
          ? compact(`${match[1]}${match[2] || ""}${match[3] || ""}`)
          : null;
      };
      type SchemeTableCell = {
        question: string;
        answer: string;
        marks: string;
        guidance: string;
      };
      type PositionedWord = { text: string; x: number; top: number };
      const tableCells: SchemeTableCell[] = [];
      const addTablePage = (
        words: PositionedWord[],
        pageWidth: number,
        pageHeight: number,
      ) => {
        if (!words.length || !pageWidth) return;
        const rows: Array<{ top: number; words: PositionedWord[] }> = [];
        words
          .filter((word) => word.text.trim())
          .sort((a, b) =>
            Math.abs(a.top - b.top) > 5 ? a.top - b.top : a.x - b.x,
          )
          .forEach((word) => {
            const row = rows.find((candidate) =>
              Math.abs(candidate.top - word.top) <= 5,
            );
            if (row) row.words.push(word);
            else rows.push({ top: word.top, words: [word] });
          });
        const header = rows.find((row) => {
          const text = row.words
            .map((word) => word.text.toLowerCase())
            .join(" ");
          return text.includes("question") && text.includes("answer");
        });
        // Cambridge mark schemes begin with numbered general instructions.
        // Never treat those numbers as question rows: only parse pages where
        // the actual Question / Answer table header has been identified.
        if (!header) return;
        const headerWords = header?.words || [];
        const questionHeader = headerWords.find((word) =>
          /^question$/i.test(word.text),
        );
        const answerHeader = headerWords.find((word) =>
          /^answer$/i.test(word.text),
        );
        const marksHeader = headerWords.find((word) =>
          /^marks?$/i.test(word.text),
        );
        const guidanceHeader = headerWords.find((word) =>
          /partial|guidance|marking/i.test(word.text),
        );
        // Cambridge centres the headings inside columns, so heading midpoints
        // are not the table boundaries. These proportions follow the actual
        // vertical rules used by the 0580 mark-scheme template.
        const answerStart = pageWidth * 0.185;
        const marksStart = pageWidth * 0.515;
        const guidanceStart = pageWidth * 0.59;
        rows.forEach((row) => {
          if (row === header) return;
          // Only rows inside the Question/Answer table belong to the scheme.
          // This excludes running headers and footers such as the copyright
          // year 2025 and "Page 3 of 10", which can resemble Question 20.
          if (row.top <= header.top || row.top >= pageHeight * 0.94) return;
          const ordered = row.words.sort((a, b) => a.x - b.x);
          const rowText = ordered.map((word) => word.text.toLowerCase()).join(" ");
          if (rowText.includes("question") && rowText.includes("answer")) return;
          const join = (selected: PositionedWord[]) =>
            selected.map((word) => word.text).join(" ").trim();
          const physicsProfile = assignment.subject === "Physics";
          const mathematicsProfile = assignment.subject === "Mathematics";
          const physicsLandscape = physicsProfile && pageWidth > pageHeight;
          const profileAnswerStart = physicsLandscape
            ? pageWidth * 0.14
            : mathematicsProfile && questionHeader
              ? questionHeader.x + pageWidth * 0.085
            : pageWidth * 0.185;
          const profileMarksStart = physicsProfile
            ? pageWidth * 0.84
            : mathematicsProfile && marksHeader
              ? marksHeader.x - pageWidth * 0.02
            : marksStart;
          const profileGuidanceStart = physicsProfile
            ? pageWidth * 0.96
            : mathematicsProfile && marksHeader
              ? marksHeader.x + pageWidth * 0.065
            : guidanceStart;
          const cell = {
            question: join(ordered.filter((word) => word.x < profileAnswerStart)),
            answer: join(
              ordered.filter(
                (word) => word.x >= profileAnswerStart && word.x < profileMarksStart,
              ),
            ),
            marks: join(
              ordered.filter(
                (word) => word.x >= profileMarksStart && word.x < profileGuidanceStart,
              ),
            ),
            guidance: join(
              ordered.filter((word) => word.x >= profileGuidanceStart),
            ),
          };
          if (Object.values(cell).some(Boolean)) tableCells.push(cell);
        });
      };
      const lines: string[] = [];
      for (let pageNumber = 1; pageNumber <= scheme.numPages; pageNumber += 1) {
        const schemePage = await scheme.getPage(pageNumber);
        const content = await schemePage.getTextContent();
        const tokens = (content.items as any[])
          .map((item) => ({
            text: String(item.str || "").trim(),
            x: Number(item.transform?.[4] || 0),
            y: Number(item.transform?.[5] || 0),
          }))
          .filter((item) => item.text)
          .sort((a, b) => (Math.abs(b.y - a.y) > 3 ? b.y - a.y : a.x - b.x));
        addTablePage(
          tokens.map((token) => ({
            text: token.text,
            x: token.x,
            top: schemePage.getViewport({ scale: 1 }).height - token.y,
          })),
          schemePage.getViewport({ scale: 1 }).width,
          schemePage.getViewport({ scale: 1 }).height,
        );
        const grouped: Array<{ y: number; tokens: typeof tokens }> = [];
        tokens.forEach((token) => {
          const line = grouped.find(
            (group) => Math.abs(group.y - token.y) <= 3,
          );
          if (line) line.tokens.push(token);
          else grouped.push({ y: token.y, tokens: [token] });
        });
        grouped
          .sort((a, b) => b.y - a.y)
          .forEach((line) =>
            lines.push(
              line.tokens
                .sort((a, b) => a.x - b.x)
                .map((token) => token.text)
                .join(" "),
            ),
          );
      }
      const embeddedMatches = workingItems.filter((item) =>
        lines.some((line) => labelAtStart(line, item.label)),
      ).length;
      const needsOcr =
        lines.join(" ").length < 200 ||
        embeddedMatches < Math.max(1, Math.ceil(workingItems.length * 0.25));
      let usedOcr = false;
      if (needsOcr) {
        usedOcr = true;
        lines.length = 0;
        tableCells.length = 0;
        setMessage("Image-based mark scheme detected. Preparing OCR…");
        extractionStage = "starting the OCR engine";
        const { createWorker } = await import("tesseract.js");
        const ocrBase = window.location.origin;
        const worker = await createWorker(
          "eng",
          1,
          {
            workerPath: `${ocrBase}/ocr/worker-v5.1.1.min.js`,
            workerBlobURL: false,
            corePath: `${ocrBase}/ocr/core/tesseract-core-lstm-v5.1.1.wasm.js`,
            langPath: `${ocrBase}/ocr/lang`,
            gzip: true,
            cacheMethod: "none",
            logger: (progress: any) => {
              if (progress.status === "recognizing text")
                setMessage(
                  `Reading mark-scheme image… ${Math.round((progress.progress || 0) * 100)}%`,
                );
            },
          },
          {},
        );
        try {
          for (
            let pageNumber = 1;
            pageNumber <= scheme.numPages;
            pageNumber += 1
          ) {
            extractionStage = `rendering OCR page ${pageNumber}`;
            setMessage(`OCR reading page ${pageNumber} of ${scheme.numPages}…`);
            const schemePage = await scheme.getPage(pageNumber);
            const viewport = schemePage.getViewport({ scale: 2 });
            const canvas = document.createElement("canvas");
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await schemePage.render({
              canvas,
              canvasContext: canvas.getContext("2d")!,
              viewport,
            }).promise;
            extractionStage = `recognising OCR page ${pageNumber}`;
            const result = await worker.recognize(
              canvas,
              {},
              {
                text: true,
                blocks: false,
                hocr: false,
                tsv: true,
              },
            );
            const tsvWords: PositionedWord[] = String(result.data.tsv || "")
              .split(/\r?\n/)
              .slice(1)
              .map((row) => row.split("\t"))
              .filter((columns) => columns.length >= 12 && columns[11]?.trim())
              .map((columns) => ({
                text: columns[11].trim(),
                x: Number(columns[6] || 0),
                top: Number(columns[7] || 0),
              }));
            addTablePage(tsvWords, canvas.width, canvas.height);
            lines.push(
              ...result.data.text
                .split(/\r?\n/)
                .map((line) => line.trim())
                .filter(Boolean),
            );
          }
        } finally {
          await worker.terminate();
        }
      }
      extractionStage = "matching recognised answers to questions";
      type ResolvedSchemeRow = SchemeTableCell & {
        label: string;
        primaryAnswer: string;
      };
      const resolvedRows: ResolvedSchemeRow[] = [];
      let carriedMain = "";
      let carriedLetter = "";
      let activeRow: ResolvedSchemeRow | null = null;
      const romanPart = /^(?:i{1,3}|iv|v|vi{0,3}|ix|x)$/i;
      tableCells.forEach((cell) => {
        const compactQuestion = cell.question.toLowerCase().replace(/\s+/g, "");
        // A question-column cell must consist only of a Cambridge label.
        // Do not manufacture labels by stripping text from copyright/footer
        // rows or other prose in the question column.
        const validQuestionCell =
          /^(?:\d{1,2})?(?:\([a-z]+\)){0,2}$/i.test(compactQuestion) &&
          /[\d(]/.test(compactQuestion);
        if (!validQuestionCell) {
          if (activeRow) {
            activeRow.answer = [activeRow.answer, cell.answer]
              .filter(Boolean)
              .join(" ")
              .slice(0, 500);
            activeRow.marks = [activeRow.marks, cell.marks]
              .filter(Boolean)
              .join(" ");
            activeRow.guidance = [activeRow.guidance, cell.guidance]
              .filter(Boolean)
              .join(" ")
              .slice(0, 2000);
          }
          return;
        }
        const mainMatch = compactQuestion.match(/^\d{1,2}/)?.[0] || "";
        const parts = Array.from(
          compactQuestion.matchAll(/\(([a-z]+)\)/gi),
          (match) => match[1].toLowerCase(),
        );
        if (mainMatch) {
          if (mainMatch !== carriedMain) carriedLetter = "";
          carriedMain = mainMatch;
        }
        let letter = "";
        let roman = "";
        if (parts.length >= 2) {
          [letter, roman] = parts;
        } else if (parts.length === 1) {
          if (!mainMatch && carriedLetter && romanPart.test(parts[0]))
            roman = parts[0];
          else letter = parts[0];
        }
        if (letter) carriedLetter = letter;
        const hasQuestionLabel = !!(mainMatch || parts.length);
        if (hasQuestionLabel && carriedMain) {
          const label = `${carriedMain}${letter || carriedLetter ? `(${letter || carriedLetter})` : ""}${roman ? `(${roman})` : ""}`;
          activeRow = {
            ...cell,
            label,
            primaryAnswer: cell.answer,
            question: cell.question,
          };
          resolvedRows.push(activeRow);
        } else if (activeRow) {
          activeRow.answer = [activeRow.answer, cell.answer]
            .filter(Boolean)
            .join(" ")
            .slice(0, 500);
          activeRow.marks = [activeRow.marks, cell.marks]
            .filter(Boolean)
            .join(" ");
          activeRow.guidance = [activeRow.guidance, cell.guidance]
            .filter(Boolean)
            .join(" ")
            .slice(0, 2000);
        }
      });
      const sourceItems =
        typeof targetIndex === "number" || assignment.subject !== "Physics"
          ? workingItems
          : workingItems.flatMap((item) => {
              const parent = canonicalLabel(item.label);
              const exact = resolvedRows.some(
                (row) => canonicalLabel(row.label) === parent,
              );
              if (exact) return [item];
              const descendants = resolvedRows.filter((row) => {
                const candidate = canonicalLabel(row.label);
                return candidate.startsWith(`${parent}(`) && candidate !== parent;
              });
              const uniqueDescendants = descendants.filter(
                (row, index, all) =>
                  !all
                    .slice(0, index)
                    .some(
                      (previous) =>
                        canonicalLabel(previous.label) ===
                        canonicalLabel(row.label),
                    ),
              );
              return uniqueDescendants.length
                ? uniqueDescendants.map((row) => ({
                    ...item,
                    label: canonicalLabel(row.label),
                  }))
                : [item];
            });
      const tableMatches = sourceItems.filter((item) =>
        resolvedRows.some(
          (row) =>
            canonicalLabel(row.label) === canonicalLabel(item.label) &&
            !![row.answer, row.marks, row.guidance].some((value) =>
              value.trim(),
            ),
        ),
      ).length;
      const useStructuredTable = resolvedRows.length > 0;
      // Continuous-text matching is deliberately disabled once table parsing
      // is available. A blank proposal is safer than an invented answer from
      // numbered introductory guidance.
      const starts: Array<{ itemIndex: number; lineIndex: number }> = [];
      const matchingLines: string[] = [];
      let matched = 0;
      const enriched = sourceItems.map((item, itemIndex) => {
        const structuredRow = resolvedRows.find(
          (candidate) =>
            canonicalLabel(candidate.label) === canonicalLabel(item.label) &&
            !![
              candidate.answer,
              candidate.marks,
              candidate.guidance,
            ].some((value) => value.trim()),
        );
        if (structuredRow) {
          const row = structuredRow;
          const physicsProfile = assignment.subject === "Physics";
          const physicsAnswer =
            physicsProfile && /^A\d\b/i.test(row.marks.trim())
              ? row.primaryAnswer
              : row.answer;
          const answer = physicsAnswer
            .replace(/\b(?:M|A|B|C|P|SC|FT)\d\b.*$/i, "")
            .replace(/\b(?:cao|oe|isw)\b.*$/i, "")
            .trim();
          const combinedGuidance = [
            physicsProfile && row.answer !== row.primaryAnswer
              ? `Full Physics marking points: ${row.answer}`
              : "",
            row.guidance,
            /[A-Za-z]/.test(row.marks) ? row.marks : "",
          ]
            .filter(Boolean)
            .join("\n")
            .slice(0, 2000);
          const markCodes = combinedGuidance.match(
            /\b(?:M|A|B|C|P|SC)\d\b/gi,
          );
          const numericMarks = row.marks.match(/\b([1-9])\b/)?.[1];
          matched += 1;
          return {
            ...item,
            label: canonicalLabel(item.label),
            response_layout: item.response_layout || "answer",
            marks:
              markCodes?.length || Number(numericMarks) || item.marks,
            expected_answer:
              answer && answer.length <= 500 ? answer : null,
            mark_scheme_notes: combinedGuidance || null,
          };
        }
        const position = starts.findIndex(
          (match) => match.itemIndex === itemIndex,
        );
        if (position < 0)
          return {
            ...item,
            expected_answer: null,
            mark_scheme_notes: null,
          };
        const start = starts[position].lineIndex;
        const currentLabel = compact(item.label);
        const nextDetectedRow = matchingLines.findIndex(
          (line, lineIndex) =>
            lineIndex > start &&
            !!schemeRowLabel(line) &&
            schemeRowLabel(line) !== currentLabel,
        );
        const nextMatchedStart = starts[position + 1]?.lineIndex;
        const nextStart =
          nextDetectedRow > start
            ? nextDetectedRow
            : nextMatchedStart;
        const end =
          typeof nextStart === "number" && nextStart > start
            ? nextStart
            : Math.min(matchingLines.length, start + 5);
        const block = matchingLines.slice(start, Math.min(end, start + 5));
        const firstLine = block[0] || "";
        const notes = block.join("\n").slice(0, 2000);
        const flexibleLabel = new RegExp(
          "^\\s*" +
            item.label
              .split("")
              .map(
                (character) =>
                  character.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*",
              )
              .join(""),
          "i",
        );
        let answer = firstLine
          .replace(flexibleLabel, "")
          .replace(/\b(?:M|A|B|C|P|SC|FT)\d\b.*$/i, "")
          .replace(/\s+[1-9]\s*$/, "")
          .replace(/\b(?:cao|oe|isw)\b.*$/i, "")
          .trim();
        if (!answer && block[1])
          answer = block[1]
            .replace(/\b(?:M|A|B|C|P|SC|FT)\d\b.*$/i, "")
            .replace(/\s+[1-9]\s*$/, "")
            .trim();
        const markCodes = notes.match(/\b(?:M|A|B|C|P|SC)\d\b/gi) || [];
        const trailingMark = firstLine.match(/\s([1-9])\s*$/)?.[1];
        const proposedMarks =
          markCodes.length || Number(trailingMark) || item.marks;
        matched += 1;
        return {
          ...item,
          marks: proposedMarks || item.marks,
          expected_answer:
            answer && answer.length <= 160 ? answer : item.expected_answer,
          mark_scheme_notes: notes,
        };
      });
      const nextItems =
        typeof targetIndex === "number"
          ? workingItems.map((item, index) =>
              index === targetIndex ? enriched[index] : item,
            )
          : enriched;
      setItems(nextItems);
      setReviewedQuestions((current) =>
        typeof targetIndex === "number"
          ? { ...current, [targetIndex]: false }
          : {},
      );
      setReviewingScheme(true);
      if (detectedItems?.length) reviewQuestion(nextItems[0], 0);
      else if (editingIndex !== null)
        reviewQuestion(nextItems[editingIndex], editingIndex);
      setMessage(
        typeof targetIndex === "number"
          ? `Question ${nextItems[targetIndex].label} was re-extracted. Check the proposed answer before approval.`
          : `${matched} of ${sourceItems.length} questions were matched ${useStructuredTable ? "from the mark-scheme table" : usedOcr ? "using OCR text" : "to mark-scheme rows"}. ${usedOcr ? "OCR can misread mathematical notation, so check every proposal. " : ""}Review the answers and guidance before approval.`,
      );
    } catch (error) {
      setMessage(
        `OCR could not finish while ${extractionStage}: ${error instanceof Error ? error.message : "unknown recognition error"}. Manual accepted answers remain available.`,
      );
    } finally {
      setExtractingScheme(false);
    }
  };
  const save = async () => {
    setMessage("Saving question setup…");
    const response = await fetch(
      `/api/assignments/${assignment.id}/questions`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ questions: items }),
      },
    );
    const result = await response.json();
    if (response.ok) {
      setMessage(`${result.saved} questions saved for students.`);
      saved();
    } else setMessage(result.error || "Questions could not be saved.");
  };
  const replaceMarkScheme = async (file: File | null) => {
    if (!file) return;
    setReplacingScheme(true);
    setMessage("Replacing the mark scheme…");
    try {
      const form = new FormData();
      form.set("scheme", file);
      const response = await fetch(
        `/api/assignments/${assignment.id}/scheme`,
        { method: "PUT", body: form },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "The mark scheme could not be replaced");
      setMessage(
        "Mark scheme replaced. Select Extract answers from mark scheme to fill the marks and accepted answers.",
      );
      setReviewingScheme(false);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "The mark scheme could not be replaced.",
      );
    } finally {
      setReplacingScheme(false);
    }
  };
  const updateReviewItem = (index: number, patch: Partial<PaperQuestion>) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
    setReviewedQuestions((current) => ({ ...current, [index]: false }));
  };
  const generateHomeworkDraft = async (index: number) => {
    const item = items[index];
    if (!pdf || !item || assignment.resource_kind !== "homework") return;
    setGeneratingDraft(index);
    setMessage(`Reading worksheet ${item.page_number} and preparing a private draft answer…`);
    try {
      const pageDocument = await pdf.getPage(item.page_number);
      const individualQuestion = /^p\d+\s*·/i.test(item.label);
      // Page-level worksheets need completeness OCR; split questions need a
      // tighter, higher-resolution pass so small leading minus signs survive.
      const visibleCrop = individualQuestion
        ? displayCrop(item)
        : { x: 0, y: 0, width: 1, height: 1 };
      const viewport = pageDocument.getViewport({ scale: individualQuestion ? 4 : 2.6 });
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(viewport.width * visibleCrop.width));
      canvas.height = Math.max(1, Math.round(viewport.height * visibleCrop.height));
      await pageDocument.render({
        canvas,
        canvasContext: canvas.getContext("2d")!,
        viewport,
        transform: [1, 0, 0, 1, -viewport.width * visibleCrop.x, -viewport.height * visibleCrop.y],
      }).promise;
      if (!homeworkOcrWorkerRef.current) {
        const { createWorker } = await import("tesseract.js");
        const ocrBase = window.location.origin;
        homeworkOcrWorkerRef.current = await createWorker("eng", 1, {
          workerPath: `${ocrBase}/ocr/worker-v5.1.1.min.js`,
          workerBlobURL: false,
          corePath: `${ocrBase}/ocr/core/tesseract-core-lstm-v5.1.1.wasm.js`,
          langPath: `${ocrBase}/ocr/lang`,
          gzip: true,
          cacheMethod: "none",
          logger: (progress: any) => {
            if (progress.status === "recognizing text")
              setMessage(`Reading worksheet ${item.page_number}… ${Math.round((progress.progress || 0) * 100)}%`);
          },
        }, {});
        await homeworkOcrWorkerRef.current.setParameters({
          preserve_interword_spaces: "1",
        });
      }
      await homeworkOcrWorkerRef.current.setParameters({
        preserve_interword_spaces: "1",
        tessedit_pageseg_mode: individualQuestion && item.crop_height < 0.09 ? "7" : "6",
      });
      const recognition = await homeworkOcrWorkerRef.current.recognize(canvas);
      const recognisedText = String(recognition?.data?.text || "").trim();
      const draft = generateHomeworkDraftFromText(recognisedText);
      const recognitionConfidence = Number(recognition?.data?.confidence || 0);
      const signSensitive = item.topic === "s8-u1";
      const suspiciousSignReading = /[°º?]|(?:^|[+*/])\s*7\d/.test(recognisedText.replace(/\s+/g, ""));
      const holdForSignReview = individualQuestion && signSensitive &&
        (recognitionConfidence < 80 || suspiciousSignReading || !/[+\-×÷*/]/.test(recognisedText));
      const reviewedDraft: HomeworkDraft = holdForSignReview
        ? {
            answer: `Sign verification required (${Math.round(recognitionConfidence)}% OCR confidence). Check every leading + or - in the recognised expression below before calculating.\n\nRecognised expression:\n${recognisedText || "No reliable expression was recognised."}`,
            acceptedAnswer: null,
            confidence: "review",
          }
        : draft;
      updateReviewItem(index, {
        extracted_question_text: recognisedText || null,
        draft_answer: reviewedDraft.answer,
        draft_accepted_answer: reviewedDraft.acceptedAnswer,
        draft_confidence: reviewedDraft.confidence,
      });
      setMessage(
        holdForSignReview
          ? "The expression was read, but its signs need confirmation. Correct the recognised text and recalculate it before approval."
          : draft.confidence === "high"
          ? "A high-confidence draft was prepared. Check it before using it as an accepted answer."
          : draft.confidence === "medium"
            ? "A multi-part draft guide was prepared. Check every line before approval."
            : "The page needs teacher review; no answer was accepted automatically.",
      );
    } catch (error) {
      setMessage(`The draft answer could not be prepared: ${error instanceof Error ? error.message : "OCR failed"}. You can still enter the answer manually.`);
    } finally {
      setGeneratingDraft(null);
    }
  };
  const recalculateCorrectedHomeworkText = (index: number) => {
    const item = items[index];
    const corrected = String(item?.extracted_question_text || "").trim();
    if (!corrected) {
      setMessage("Enter the corrected expression first.");
      return;
    }
    const draft = generateHomeworkDraftFromText(corrected);
    updateReviewItem(index, {
      draft_answer: draft.answer,
      draft_accepted_answer: draft.acceptedAnswer,
      draft_confidence: draft.confidence,
    });
    setMessage(
      draft.acceptedAnswer
        ? "The teacher-corrected expression was recalculated. Check the answer, then use it for marking."
        : "The corrected text still needs a manual accepted answer.",
    );
  };
  const splitHomeworkPageIntoQuestions = async (index: number) => {
    const item = items[index];
    if (!pdf || !item || assignment.resource_kind !== "homework") return;
    setSplittingHomeworkPage(index);
    setMessage(`Detecting individual questions on page ${item.page_number}…`);
    try {
      const pageDocument = await pdf.getPage(item.page_number);
      const viewport = pageDocument.getViewport({ scale: 2.6 });
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(viewport.width));
      canvas.height = Math.max(1, Math.round(viewport.height));
      await pageDocument.render({
        canvas,
        canvasContext: canvas.getContext("2d")!,
        viewport,
      }).promise;
      if (!homeworkOcrWorkerRef.current) {
        const { createWorker } = await import("tesseract.js");
        const ocrBase = window.location.origin;
        homeworkOcrWorkerRef.current = await createWorker("eng", 1, {
          workerPath: `${ocrBase}/ocr/worker-v5.1.1.min.js`,
          workerBlobURL: false,
          corePath: `${ocrBase}/ocr/core/tesseract-core-lstm-v5.1.1.wasm.js`,
          langPath: `${ocrBase}/ocr/lang`,
          gzip: true,
          cacheMethod: "none",
          logger: (progress: any) => {
            if (progress.status === "recognizing text")
              setMessage(`Detecting page ${item.page_number}… ${Math.round((progress.progress || 0) * 100)}%`);
          },
        }, {});
        await homeworkOcrWorkerRef.current.setParameters({
          preserve_interword_spaces: "1",
          tessedit_pageseg_mode: "6",
        });
      }
      await homeworkOcrWorkerRef.current.setParameters({
        preserve_interword_spaces: "1",
        tessedit_pageseg_mode: "6",
      });
      const recognition = await homeworkOcrWorkerRef.current.recognize(
        canvas,
        {},
        { text: true, blocks: true },
      );
      const pageWidth = canvas.width;
      const pageHeight = canvas.height;
      const rawLines = Array.isArray(recognition?.data?.lines) ? recognition.data.lines : [];
      const rawWords = Array.isArray(recognition?.data?.words) ? recognition.data.words : [];
      const markerPattern = /^\s*[\[(]?\s*(\d{1,2})\s*[\]).]?\s+(?=(?:[a-z][.)]?\s+)?(?:work|write|find|calculate|complete|copy|solve|simplify|round|draw|construct|shade|plot|show|estimate|measure|state|give|which|what|how|use|express|convert|make|the\b))/i;
      const markers: Array<{ label: string; top: number; text: string }> = rawLines
        .map((line: any) => {
          const text = String(line?.text || "").trim();
          const match = text.match(markerPattern);
          const top = Number(line?.bbox?.y0 || 0) / pageHeight;
          return match && top >= 0.12 && top <= 0.9
            ? { label: match[1], top, text }
            : null;
        })
        .filter((entry: any): entry is { label: string; top: number; text: string } => !!entry)
        .filter((entry: any, markerIndex: number, all: any[]) =>
          markerIndex === 0 || entry.label !== all[markerIndex - 1].label || Math.abs(entry.top - all[markerIndex - 1].top) > 0.03,
        );
      if (!markers.length)
        throw new Error("No numbered exercise boundary was found on this page. Keep the page crop and add its questions manually.");
      const nextItems: PaperQuestion[] = [];
      markers.forEach((marker: { label: string; top: number; text: string }, markerIndex: number) => {
        // Every worksheet page in this book restarts at question 1. OCR can
        // confuse boxed digits (notably 5 and 8), so geometry determines the
        // boundary while the consecutive order determines the safe label.
        const safeMainLabel = String(markerIndex + 1);
        const nextTop = markers[markerIndex + 1]?.top ?? 0.94;
        const cropTop = Math.max(0, marker.top - 0.018);
        const cropBottom = Math.min(0.96, Math.max(cropTop + 0.08, nextTop - 0.008));
        const candidateLetters = rawWords
          .map((word: any) => ({
            raw: String(word?.text || "").trim().replace(/[().]/g, ""),
            x: Number(word?.bbox?.x0 || 0) / pageWidth,
            y: Number(word?.bbox?.y0 || 0) / pageHeight,
          }))
          .filter((word: { raw: string; x: number; y: number }) =>
            /^[a-p]$/.test(word.raw) && word.y >= marker.top + 0.01 && word.y < nextTop,
          );
        // Keep the last occurrence of a printed label. This avoids treating an
        // earlier article ("a bag...") as the position of subpart (a).
        const byLetter = new Map<string, { raw: string; x: number; y: number }>();
        candidateLetters.forEach((word: { raw: string; x: number; y: number }) => byLetter.set(word.raw, word));
        const detectedLabels = [...byLetter.keys()].sort();
        const hasLetteredParts = detectedLabels.includes("a") && detectedLabels.includes("b");
        const labelPoints = hasLetteredParts
          ? detectedLabels.map((letter) => byLetter.get(letter)!).sort((left, right) => left.y - right.y || left.x - right.x)
          : [];
        const rows: Array<{ y: number; points: typeof labelPoints }> = [];
        labelPoints.forEach((point) => {
          const row = rows.find((entry) => Math.abs(entry.y - point.y) <= 0.009);
          if (row) {
            row.points.push(point);
            row.y = row.points.reduce((sum, item) => sum + item.y, 0) / row.points.length;
          } else rows.push({ y: point.y, points: [point] });
        });
        rows.sort((left, right) => left.y - right.y);
        const columnCount = rows.length ? Math.max(...rows.map((row) => row.points.length)) : 0;
        const columns = Array.from({ length: columnCount }, (_, columnIndex) => {
          const values = rows
            .map((row) => [...row.points].sort((left, right) => left.x - right.x)[columnIndex]?.x)
            .filter((value): value is number => Number.isFinite(value));
          return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0.04;
        }).sort((left, right) => left - right);
        const highestDetected = hasLetteredParts
          ? Math.max(...detectedLabels.map((letter) => letter.charCodeAt(0) - 96))
          : 0;
        const inferredGridCount = columnCount >= 2 ? rows.length * columnCount : highestDetected;
        const subpartCount = hasLetteredParts ? Math.min(16, Math.max(highestDetected, inferredGridCount)) : 0;
        const subparts = subpartCount
          ? Array.from({ length: subpartCount }, (_, partIndex) => String.fromCharCode(97 + partIndex))
          : [""];
        const typicalColumnGap = columns.length >= 2
          ? columns.slice(1).reduce((sum, value, columnIndex) => sum + value - columns[columnIndex], 0) / (columns.length - 1)
          : 0;
        subparts.forEach((letter, partIndex) => {
          let partX = 0.035;
          let partY = cropTop;
          let partWidth = 0.93;
          let partHeight = cropBottom - cropTop;
          if (letter && columnCount && rows.length) {
            const rowIndex = Math.min(rows.length - 1, Math.floor(partIndex / columnCount));
            const columnIndex = partIndex % columnCount;
            const columnX = columns[columnIndex] ?? 0.04;
            const nextColumnX = columns[columnIndex + 1];
            const rowY = rows[rowIndex]?.y ?? marker.top;
            const nextRowY = rows[rowIndex + 1]?.y;
            partX = Math.max(0.02, columnX - 0.012);
            const right = nextColumnX != null
              ? nextColumnX - 0.012
              : columnCount > 1
                ? Math.min(0.97, columnX + typicalColumnGap * 0.92)
                : 0.97;
            partWidth = Math.max(0.08, right - partX);
            partY = Math.max(cropTop, rowY - 0.01);
            const bottom = nextRowY != null ? nextRowY - 0.004 : cropBottom;
            partHeight = Math.max(0.035, bottom - partY);
          }
          nextItems.push({
          label: `p${item.page_number} · ${safeMainLabel}${letter ? `(${letter})` : ""}`,
          marks: 1,
          page_number: item.page_number,
          crop_x: partX,
          crop_y: partY,
          crop_width: partWidth,
          crop_height: partHeight,
          response_type: /draw|construct|shade|plot|graph|diagram|reflect|rotate|translate/i.test(marker.text) ? "drawing" : "typed",
          answer_slots: 1,
          response_layout: "answer",
          expected_answer: null,
          mark_scheme_notes: item.mark_scheme_notes || "No memo was supplied. Check the private draft answer before publishing this question.",
          topic: item.topic,
          draft_answer: null,
          draft_accepted_answer: null,
          draft_confidence: null,
          extracted_question_text: `${marker.text}${letter ? ` Subpart (${letter}).` : ""}`,
        });
        });
      });
      setItems((current) => [
        ...current.slice(0, index),
        ...nextItems,
        ...current.slice(index + 1),
      ]);
      setReviewedQuestions({});
      setReviewCursor(index);
      setMessage(
        `Page ${item.page_number}: ${markers.length} main question${markers.length === 1 ? "" : "s"} and ${nextItems.length} answerable item${nextItems.length === 1 ? "" : "s"} detected. Review every label and crop before approval.`,
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The page could not be split into individual questions.");
    } finally {
      setSplittingHomeworkPage(null);
    }
  };
  const reviewedCount = items.filter((_, index) => reviewedQuestions[index])
    .length;
  const reviewComplete = !!items.length && reviewedCount === items.length;
  const duplicateLabels = new Set(
    items
      .map((item) => item.label.toLowerCase().replace(/\s+/g, ""))
      .filter((label, index, all) => all.indexOf(label) !== index),
  );
  const reviewIssues = (item: PaperQuestion) => {
    const issues: string[] = [];
    if (!item.marks) issues.push("Missing marks");
    if (item.response_type !== "drawing" && !item.expected_answer)
      issues.push("Missing accepted answer");
    if ((assignment.is_practice_library || assignment.resource_kind === "homework") && !(assignment.lower_secondary_stage===8?stage8Units:stage9Units).some(unit=>unit.id===item.topic))
      issues.push("Choose a curriculum unit");
    if (assignment.resource_kind === "homework") {
      const answerIndex = issues.indexOf("Missing accepted answer");
      if (answerIndex >= 0) issues.splice(answerIndex, 1);
    }
    if (duplicateLabels.has(item.label.toLowerCase().replace(/\s+/g, "")))
      issues.push("Duplicate label");
    return issues;
  };
  const readyIndexes = items
    .map((item, index) => ({ index, issues: reviewIssues(item) }))
    .filter((entry) => !entry.issues.length)
    .map((entry) => entry.index);
  const filteredReviewIndexes = items
    .map((item, index) => ({ item, index, issues: reviewIssues(item) }))
    .filter(({ item, index, issues }) => {
      if (reviewFilter === "needs-review") return !reviewedQuestions[index];
      if (reviewFilter === "missing") return issues.length > 0;
      if (reviewFilter === "drawing") return item.response_type === "drawing";
      if (reviewFilter === "approved") return !!reviewedQuestions[index];
      return true;
    })
    .map(({ index }) => index);
  const safeReviewCursor = Math.min(
    reviewCursor,
    Math.max(0, filteredReviewIndexes.length - 1),
  );
  const validationIssueCount = items.reduce(
    (total, item) => total + reviewIssues(item).length,
    0,
  );
  const issueCounts = items.flatMap(reviewIssues).reduce<Record<string,number>>((counts,issue)=>({...counts,[issue]:(counts[issue]||0)+1}),{});
  const issueSummary = Object.entries(issueCounts).map(([issue,count])=>`${count} ${issue.toLowerCase()}`).join(" · ");
  const toggleApprovalAndAdvance = (index: number) => {
    const wasApproved = !!reviewedQuestions[index];
    setReviewedQuestions((current) => ({
      ...current,
      [index]: !current[index],
    }));
    if (
      !wasApproved &&
      reviewFilter !== "needs-review" &&
      safeReviewCursor < filteredReviewIndexes.length - 1
    ) {
      setReviewCursor(safeReviewCursor + 1);
    }
  };
  return (
    <div className="question-setup-modal">
      <div className="question-setup-shell">
        <header>
          <div>
            <small>QUESTION SETUP</small>
            <h2>{assignment.title}</h2>
            <span className="subject-profile-badge">
              {assignment.subject} · {assignment.syllabus}
            </span>
            <p>
              {reviewingScheme
                ? assignment.resource_kind === "homework"
                  ? "Review each worksheet crop and its private draft answer before students receive it."
                  : "Check each extracted answer against its question crop."
                : "Drag a box around one complete question, then add it."}
            </p>
          </div>
          <button onClick={close}>×</button>
        </header>
        {reviewingScheme ? (
          <section className="scheme-review-screen">
            <div className="scheme-review-toolbar">
              <button onClick={() => setReviewingScheme(false)}>
                ← Back to question setup
              </button>
              <div>
                <small>TEACHER REVIEW</small>
                <b>
                  {reviewedCount} of {items.length} questions approved
                </b>
                <span>
                  {assignment.resource_kind === "homework"
                    ? "Homework pages remain private until the teacher approves the crops and marking setup."
                    : "OCR suggestions remain private until every question is checked and saved."}
                </span>
              </div>
              <button
                className="approve-ready"
                disabled={!readyIndexes.some((index) => !reviewedQuestions[index])}
                onClick={() =>
                  setReviewedQuestions((current) => ({
                    ...current,
                    ...Object.fromEntries(readyIndexes.map((index) => [index, true])),
                  }))
                }
              >
                ✓ Approve all ready
              </button>
              {assignment.resource_kind !== "homework" && <label className="replace-scheme-button">
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  disabled={replacingScheme}
                  onChange={(event) => {
                    void replaceMarkScheme(event.target.files?.[0] || null);
                    event.currentTarget.value = "";
                  }}
                />
                {replacingScheme ? "Replacing…" : "Replace mark scheme"}
              </label>}
              <button
                className="save-questions"
                disabled={!reviewComplete}
                onClick={save}
              >
                Approve & save for students →
              </button>
            </div>
            <div className="review-summary">
              <div className={validationIssueCount ? "warning" : "ready"}>
                <b>{validationIssueCount || "No"} setup issue{validationIssueCount === 1 ? "" : "s"}</b>
                <span>
                  {validationIssueCount
                    ? issueSummary
                    : "Every question has the information required for teacher approval."}
                </span>
                {!!validationIssueCount&&<button className="review-issue-jump" onClick={()=>{setReviewFilter("missing");setReviewCursor(0);}}>Show unresolved question →</button>}
              </div>
              <label>
                Show
                <select
                  value={reviewFilter}
                  onChange={(event) => {
                    setReviewFilter(event.target.value as typeof reviewFilter);
                    setReviewCursor(0);
                  }}
                >
                  <option value="all">All questions ({items.length})</option>
                  <option value="needs-review">Needs review ({items.length - reviewedCount})</option>
                  <option value="missing">Has setup issues</option>
                  <option value="drawing">Drawing questions</option>
                  <option value="approved">Approved ({reviewedCount})</option>
                </select>
              </label>
              <div className="review-pager">
                <button
                  disabled={safeReviewCursor === 0}
                  onClick={() => setReviewCursor(Math.max(0, safeReviewCursor - 1))}
                >
                  ← Previous
                </button>
                <b>
                  {filteredReviewIndexes.length
                    ? `${safeReviewCursor + 1} of ${filteredReviewIndexes.length}`
                    : "No matches"}
                </b>
                <button
                  disabled={safeReviewCursor >= filteredReviewIndexes.length - 1}
                  onClick={() => setReviewCursor(safeReviewCursor + 1)}
                >
                  Next →
                </button>
              </div>
            </div>
            <div className="scheme-review-list">
              {filteredReviewIndexes.length ? filteredReviewIndexes
                .slice(safeReviewCursor, safeReviewCursor + 1)
                .map((index) => {
                const item = items[index];
                const issues = reviewIssues(item);
                const confidence = issues.length
                  ? issues.length > 1
                    ? "Needs attention"
                    : "Check details"
                  : "Ready to approve";
                return (
                <article
                  className={reviewedQuestions[index] ? "approved" : ""}
                  key={`${item.label}-${index}`}
                >
                  <div className="scheme-question-head">
                    <span>Question {item.label}</span>
                    <small>
                      Page {item.page_number} · {item.response_type || "typed"}
                    </small>
                    <em>
                      {reviewedQuestions[index] ? "✓ Approved" : confidence}
                    </em>
                  </div>
                  {!!issues.length && (
                    <div className="question-issues">
                      {issues.map((issue) => <span key={issue}>! {issue}</span>)}
                    </div>
                  )}
                  <div className="scheme-review-card">
                    <section className="scheme-crop-preview">
                      <QuestionCropPreview pdf={pdf} question={item} />
                    </section>
                    <section className="scheme-review-fields">
                      <label>
                        Marks
                        <input
                          type="number"
                          min="1"
                          value={item.marks || ""}
                          onChange={(event) =>
                            updateReviewItem(index, {
                              marks: Number(event.target.value) || null,
                            })
                          }
                        />
                      </label>
                      <label>
                        Topic
                        {(assignment.is_practice_library || assignment.resource_kind === "homework") && assignment.lower_secondary_stage ? <select value={item.topic || ""} onChange={(event)=>updateReviewItem(index,{topic:event.target.value})}><option value="">Choose the matching unit</option>{(assignment.lower_secondary_stage===8?stage8Units:stage9Units).map(unit=><option key={unit.id} value={unit.id}>{unit.title}</option>)}</select> : <input value={item.topic || "General skills"} onChange={(event) => updateReviewItem(index, { topic: event.target.value })}/>} 
                      </label>
                      {assignment.subject === "Physics" && (
                        <label>
                          Answer layout
                          <select
                            value={item.response_layout || "answer"}
                            onChange={(event) =>
                              updateReviewItem(index, {
                                response_layout: event.target.value as
                                  | "answer"
                                  | "working"
                                  | "formula",
                              })
                            }
                          >
                            <option value="answer">Final answer only</option>
                            <option value="working">Working + answer</option>
                            <option value="formula">Formula + working + answer</option>
                          </select>
                        </label>
                      )}
                      <label>
                        Answer spaces
                        <select
                          value={item.answer_slots || 1}
                          onChange={(event) =>
                            updateReviewItem(index, {
                              answer_slots: Number(event.target.value),
                            })
                          }
                        >
                          {[1, 2, 3, 4].map((count) => (
                            <option key={count} value={count}>{count}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        {assignment.resource_kind === "homework" ? "Accepted answer(s) · optional" : "Accepted answer(s)"}
                        <textarea
                          className="accepted-answer-field"
                          value={item.expected_answer || ""}
                          placeholder={assignment.resource_kind === "homework" ? "Leave blank for teacher marking" : "Enter the accepted answer"}
                          onChange={(event) =>
                            updateReviewItem(index, {
                              expected_answer: event.target.value || null,
                            })
                          }
                        />
                        <small>Separate equivalent answers with |</small>
                      </label>
                      {assignment.resource_kind === "homework" && (
                        <section className="homework-draft-answer">
                          <header>
                            <div>
                              <b>Private draft answer</b>
                              <small>Generated from the worksheet crop; never published without teacher approval.</small>
                            </div>
                            <span className={`draft-confidence ${item.draft_confidence || "pending"}`}>
                              {item.draft_confidence === "high" ? "High confidence" : item.draft_confidence === "medium" ? "Check each step" : item.draft_confidence === "review" ? "Teacher review" : "Not generated"}
                            </span>
                          </header>
                          {/^(?:Ch\s+\d+|Worksheet)\b/i.test(item.label) && (
                            <button
                              className="split-homework-page"
                              disabled={splittingHomeworkPage !== null || generatingDraft !== null}
                              onClick={() => void splitHomeworkPageIntoQuestions(index)}
                            >
                              {splittingHomeworkPage === index ? "Detecting individual questions…" : "✂ Detect individual questions on this page"}
                            </button>
                          )}
                          <button
                            className="generate-draft-answer"
                            disabled={generatingDraft !== null}
                            onClick={() => void generateHomeworkDraft(index)}
                          >
                            {generatingDraft === index ? "Reading and solving…" : item.draft_answer ? "↻ Generate again" : "✦ Generate draft answer"}
                          </button>
                          {item.draft_answer && <textarea value={item.draft_answer} onChange={(event)=>updateReviewItem(index,{draft_answer:event.target.value || null})}/>} 
                          {item.draft_accepted_answer && (
                            <button className="use-draft-answer" onClick={()=>updateReviewItem(index,{expected_answer:item.draft_accepted_answer})}>
                              Use proposed answer “{item.draft_accepted_answer}” for marking
                            </button>
                          )}
                          {item.extracted_question_text && <details><summary>Review or correct recognised question text</summary><textarea className="recognised-homework-text" value={item.extracted_question_text} onChange={(event)=>updateReviewItem(index,{extracted_question_text:event.target.value || null})}/><button className="recalculate-homework-text" onClick={()=>recalculateCorrectedHomeworkText(index)}>Recalculate corrected text</button></details>}
                        </section>
                      )}
                      <label className="scheme-guidance">
                        Extracted marking guidance
                        <textarea
                          value={item.mark_scheme_notes || ""}
                          placeholder="Add method marks, units or alternative-answer guidance"
                          onChange={(event) =>
                            updateReviewItem(index, {
                              mark_scheme_notes: event.target.value || null,
                            })
                          }
                        />
                      </label>
                      {assignment.resource_kind !== "homework" && <button
                        className="reextract-question"
                        disabled={extractingScheme}
                        onClick={() => extractMarkScheme(index)}
                      >
                        {extractingScheme ? "Extracting…" : "↻ Re-extract this question"}
                      </button>}
                      <button
                        className="approve-question"
                        onClick={() => toggleApprovalAndAdvance(index)}
                      >
                        {reviewedQuestions[index]
                          ? "Undo approval"
                          : "✓ Approve this question"}
                      </button>
                    </section>
                  </div>
                </article>
              );}) : (
                <div className="empty-review-filter">
                  No questions match this filter.
                </div>
              )}
            </div>
            {message && <p className="setup-message">{message}</p>}
          </section>
        ) : (
        <div className="question-setup-grid">
          <section className="crop-paper">
            <div className="crop-toolbar">
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                ← Previous page
              </button>
              <b>
                Page {page} of {pdf?.numPages || "…"}
              </b>
              <button
                disabled={!pdf || page === pdf.numPages}
                onClick={() => setPage(page + 1)}
              >
                Next page →
              </button>
            </div>
            <div className="crop-canvas-wrap">
              <canvas
                ref={canvasRef}
                onPointerDown={startCrop}
                onPointerMove={moveCrop}
                onPointerUp={finishCrop}
                onPointerCancel={finishCrop}
              />
              <i
                style={{
                  left: `${crop.x * 100}%`,
                  top: `${crop.y * 100}%`,
                  width: `${crop.width * 100}%`,
                  height: `${crop.height * 100}%`,
                }}
              />
            </div>
          </section>
          <aside className="question-builder">
            <button
              className="auto-detect"
              disabled={!pdf || detecting}
              onClick={autoDetect}
            >
              {detecting
                ? `${detectorLabel} · scanning paper…`
                : `✦ Auto-detect questions · ${detectorLabel}`}
            </button>
            <small className="auto-detect-help">
              {assignment.resource_kind === "homework"
                ? "Creates one reviewable worksheet crop per exercise page and assigns the known Book 2 chapters to Stage 8 units."
                : "Finds main questions and parts such as (a), (b), (i) and (ii), then creates a separate answer space for each final part."}
              {assignment.subject === "Physics" &&
                " Physics answers remain subject to teacher review for units, significant figures, diagrams and method marks."}
            </small>
            {assignment.resource_kind !== "homework" && <button
              className="extract-scheme"
              disabled={!items.length || extractingScheme}
              onClick={() => extractMarkScheme()}
            >
              {extractingScheme
                ? "Reading mark scheme…"
                : "⌁ Extract answers from mark scheme"}
            </button>}
            {assignment.resource_kind !== "homework" && <label className="replace-scheme-button setup-replace-scheme">
              <input
                type="file"
                accept="application/pdf,.pdf"
                disabled={replacingScheme}
                onChange={(event) => {
                  void replaceMarkScheme(event.target.files?.[0] || null);
                  event.currentTarget.value = "";
                }}
              />
              {replacingScheme ? "Replacing mark scheme…" : "Replace mark scheme PDF"}
            </label>}
            {assignment.resource_kind !== "homework" && <small className="auto-detect-help">
              Matches answers and marking guidance to the detected question
              labels.
            </small>}
            <label>
              Question number
              <input value={label} onChange={(e) => setLabel(e.target.value)} />
            </label>
            <label>
              Marks (optional)
              <input
                type="number"
                min="1"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
              />
            </label>
            <label>
              Student response
              <select
                value={responseType}
                onChange={(e) =>
                  setResponseType(
                    e.target.value as "typed" | "drawing" | "multiple_choice",
                  )
                }
              >
                <option value="typed">Typed answer and working</option>
                <option value="drawing">Draw directly on a copy</option>
                <option value="multiple_choice">Multiple choice · A–D</option>
              </select>
            </label>
            <label>
              Accepted answer(s)
              <input
                value={expectedAnswer}
                onChange={(e) => setExpectedAnswer(e.target.value)}
                placeholder="e.g. 12.5 or 12.5 | 25/2"
              />
              <small>Separate equivalent accepted answers with |</small>
            </label>
            {markSchemeNotes && (
              <label>
                Extracted marking guidance
                <textarea
                  value={markSchemeNotes}
                  onChange={(e) => setMarkSchemeNotes(e.target.value)}
                />
              </label>
            )}
            <button className="primary" onClick={addQuestion}>
              {editingIndex === null
                ? "＋ Add selected question"
                : "✓ Update this question"}
            </button>
            <div className="configured-questions">
              <b>
                {items.length} configured question
                {items.length === 1 ? "" : "s"}
              </b>
              {items.map((item, index) => (
                <article key={index}>
                  <span>{index + 1}</span>
                  <div>
                    <b>Question {item.label}</b>
                    <small>
                      Page {item.page_number}
                      {item.marks ? ` · ${item.marks} marks` : ""}
                      {item.response_type === "drawing" ? " · Drawing" : ""}
                      {item.expected_answer ? " · Answer extracted" : ""}
                    </small>
                  </div>
                  <button
                    className="review-crop"
                    onClick={() => reviewQuestion(item, index)}
                  >
                    Review
                  </button>
                  <button
                    aria-label={`Remove question ${item.label}`}
                    onClick={() => {
                      setItems(items.filter((_, i) => i !== index));
                      if (editingIndex === index) setEditingIndex(null);
                    }}
                  >
                    ×
                  </button>
                </article>
              ))}
            </div>
            {message && <p className="setup-message">{message}</p>}
            <button
              className="save-questions"
              disabled={!items.length}
              onClick={() =>
                assignment.resource_kind === "homework" || items.some(
                  (item) => item.expected_answer || item.mark_scheme_notes,
                )
                  ? setReviewingScheme(true)
                  : save()
              }
            >
              {assignment.resource_kind === "homework" || items.some(
                (item) => item.expected_answer || item.mark_scheme_notes,
              )
                ? assignment.resource_kind === "homework" ? "Review homework pages →" : "Review extracted answers →"
                : "Approve & save for students →"}
            </button>
          </aside>
        </div>
        )}
      </div>
    </div>
  );
}
function Students() {
  const [open, setOpen] = useState(false),
    [message, setMessage] = useState(""),
    [accounts, setAccounts] = useState<
      Array<{ id: string; name: string; username: string }>
    >([]);
  const loadAccounts = () =>
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then(setAccounts);
  useEffect(() => {
    loadAccounts();
  }, []);
  async function addStudent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("Creating account…");
    const data = new FormData(e.currentTarget);
    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(data)),
    });
    const result = await response.json();
    if (response.ok) {
      setMessage(`Account created for ${result.username}.`);
      e.currentTarget.reset();
      loadAccounts();
    } else setMessage(result.error || "The account could not be created.");
  }
  return (
    <>
      <div className="portal-heading">
        <div>
          <p>CLASS ROSTER</p>
          <h1>IGCSE Mathematics 2026</h1>
          <h2>Create and manage secure student accounts.</h2>
        </div>
        <button className="primary" onClick={() => setOpen(true)}>
          ＋ Add student
        </button>
      </div>
      <section className="panel student-table">
        <header>
          <div>
            <h3>
              {accounts.length} student{accounts.length === 1 ? "" : "s"}
            </h3>
            <p>Teacher-created usernames and temporary passwords.</p>
          </div>
        </header>
        {accounts.map((student) => (
          <article key={student.id}>
            <span>
              {student.name
                .split(" ")
                .map((x: string) => x[0])
                .join("")}
            </span>
            <div>
              <b>{student.name}</b>
              <small>Username: {student.username}</small>
            </div>
            <em>Active</em>
          </article>
        ))}
      </section>
      {open && (
        <div className="portal-modal" onMouseDown={() => setOpen(false)}>
          <form onMouseDown={(e) => e.stopPropagation()} onSubmit={addStudent}>
            <button type="button" className="x" onClick={() => setOpen(false)}>
              ×
            </button>
            <small>NEW STUDENT ACCOUNT</small>
            <h2>Create login details</h2>
            <div className="form-row">
              <label>
                First name
                <input name="firstName" required />
              </label>
              <label>
                Last name
                <input name="lastName" required />
              </label>
            </div>
            <label>
              Username
              <input
                name="username"
                minLength={4}
                required
                placeholder="e.g. naledim"
              />
            </label>
            <label>
              Temporary password
              <input name="password" type="password" minLength={8} required />
            </label>
            {message && <p>{message}</p>}
            <button className="primary">Create student account</button>
          </form>
        </div>
      )}
    </>
  );
}
function Submissions() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [active, setActive] = useState<any | null>(null);
  const [review, setReview] = useState<
    Record<string, { finalMark: string; feedback: string }>
  >({});
  const [overallFeedback, setOverallFeedback] = useState("");
  const [confirmedMarks, setConfirmedMarks] = useState<Record<string, boolean>>({});
  const [markFilter, setMarkFilter] = useState<"all" | "attention" | "confirmed">("attention");
  const [queueFilter, setQueueFilter] = useState<
    "attention" | "ready" | "published" | "all"
  >("attention");
  const [markCursor, setMarkCursor] = useState(0);
  const [handwrittenPage, setHandwrittenPage] = useState(0);
  const [queueAction, setQueueAction] = useState("");
  const [message, setMessage] = useState("Loading submissions…");
  const load = () =>
    fetch("/api/submissions")
      .then((response) => response.json())
      .then((data) => {
        setSubmissions(Array.isArray(data) ? data : []);
        setMessage(
          Array.isArray(data) && !data.length ? "No submissions yet." : "",
        );
      })
      .catch(() => setMessage("Submissions could not be loaded."));
  useEffect(() => {
    load();
  }, []);
  const openReview = (submission: any) => {
    setActive(submission);
    setOverallFeedback(submission.teacher_feedback || "");
    setReview(
      Object.fromEntries(
        submission.marks.map((mark: any) => [
          String(mark.question_id),
          {
            finalMark: String(mark.final_mark ?? mark.proposed_mark ?? 0),
            feedback: mark.teacher_feedback || "",
          },
        ]),
      ),
    );
    setConfirmedMarks(
      Object.fromEntries(
        submission.marks.map((mark: any) => [
          String(mark.question_id),
          (mark.final_mark !== null && mark.final_mark !== undefined) ||
            (mark.confidence !== "review" &&
              mark.proposed_mark !== null &&
              Number(mark.proposed_mark) === Number(mark.maximum)),
        ]),
      ),
    );
    setMarkFilter("attention");
    setMarkCursor(0);
    setHandwrittenPage(0);
  };
  const saveReview = async (publish: boolean) => {
    if (!active) return;
    setMessage(publish ? "Publishing result…" : "Saving review…");
    const response = await fetch(`/api/submissions/${active.id}/review`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        publish,
        feedback: overallFeedback,
        marks: active.marks.map((mark: any) => ({
          questionId: mark.question_id,
          finalMark: review[String(mark.question_id)]?.finalMark || "0",
          feedback: review[String(mark.question_id)]?.feedback || "",
          reviewed: !!confirmedMarks[String(mark.question_id)],
        })),
      }),
    });
    const result = await response.json();
    if (response.ok) {
      setMessage(
        publish
          ? `Result published with ${result.total} marks.`
          : result.ready
            ? "All marks are approved. This result is now ready to publish."
            : `Review saved. ${result.outstanding} question${result.outstanding === 1 ? "" : "s"} still need approval.`,
      );
      if (publish) {
        setActive(null);
        load();
      }
    } else setMessage(result.error || "The review could not be saved.");
  };
  const publishReady = async (submission: any) => {
    if (submission.status !== "reviewed") return;
    setQueueAction(String(submission.id));
    setMessage(`Publishing ${submission.student_name}'s result…`);
    const response = await fetch(`/api/submissions/${submission.id}/review`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        publish: true,
        feedback: submission.teacher_feedback || "",
        marks: [],
      }),
    });
    const result = await response.json();
    setQueueAction("");
    if (!response.ok) {
      setMessage(result.error || "The result could not be published.");
      return;
    }
    setMessage(`${submission.student_name}'s result has been published.`);
    load();
  };
  const publishAllReady = async () => {
    const ready = submissions.filter((submission) => submission.status === "reviewed");
    if (!ready.length) return;
    if (!window.confirm(`Publish ${ready.length} teacher-approved result${ready.length === 1 ? "" : "s"} to students now?`)) return;
    setQueueAction("all-ready");
    setMessage(`Publishing ${ready.length} approved result${ready.length === 1 ? "" : "s"}…`);
    const results = await Promise.all(
      ready.map(async (submission) => {
        const response = await fetch(`/api/submissions/${submission.id}/review`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            publish: true,
            feedback: submission.teacher_feedback || "",
            marks: [],
          }),
        });
        return response.ok;
      }),
    );
    setQueueAction("");
    const published = results.filter(Boolean).length;
    setMessage(`${published} result${published === 1 ? "" : "s"} published${published !== ready.length ? `; ${ready.length - published} still need attention` : ""}.`);
    load();
  };
  if (active) {
    const answerFor = (label: string) =>
      active.answers.find(
        (answer: any) =>
          String(answer.question).replace(/\s/g, "").toLowerCase() ===
          String(label).replace(/\s/g, "").toLowerCase(),
      );
    const confirmedCount = active.marks.filter(
      (mark: any) => confirmedMarks[String(mark.question_id)],
    ).length;
    const filteredMarks = active.marks.filter((mark: any) => {
      const confirmed = !!confirmedMarks[String(mark.question_id)];
      if (markFilter === "attention") return !confirmed;
      if (markFilter === "confirmed") return confirmed;
      return true;
    });
    const safeMarkCursor = Math.min(
      markCursor,
      Math.max(0, filteredMarks.length - 1),
    );
    const moderatedTotal = active.marks.reduce(
      (total: number, mark: any) =>
        total + Number(review[String(mark.question_id)]?.finalMark || 0),
      0,
    );
    const maximumTotal = active.marks.reduce(
      (total: number, mark: any) => total + Number(mark.maximum || 0),
      0,
    );
    const highConfidenceRemaining = active.marks.filter(
      (mark: any) =>
        mark.confidence === "high" &&
        mark.proposed_mark !== null &&
        mark.proposed_mark !== undefined &&
        !confirmedMarks[String(mark.question_id)],
    );
    const approveHighConfidence = () => {
      const nextReview = { ...review };
      const nextConfirmed = { ...confirmedMarks };
      highConfidenceRemaining.forEach((mark: any) => {
        const key = String(mark.question_id);
        nextReview[key] = {
          finalMark: String(mark.proposed_mark),
          feedback: nextReview[key]?.feedback || "",
        };
        nextConfirmed[key] = true;
      });
      setReview(nextReview);
      setConfirmedMarks(nextConfirmed);
      setMarkFilter("attention");
      setMarkCursor(0);
      setMessage(`${highConfidenceRemaining.length} reliable automatic suggestion${highConfidenceRemaining.length === 1 ? "" : "s"} approved. Check the remaining flagged questions.`);
    };
    const awardFullMarksForPaper = () => {
      if (!window.confirm(`Award ${maximumTotal} out of ${maximumTotal} and confirm every question for ${active.student_name}?`)) return;
      setReview(
        Object.fromEntries(
          active.marks.map((mark: any) => [
            String(mark.question_id),
            {
              finalMark: String(mark.maximum || 0),
              feedback: review[String(mark.question_id)]?.feedback || "Correct response. Full marks awarded.",
            },
          ]),
        ),
      );
      setConfirmedMarks(
        Object.fromEntries(active.marks.map((mark: any) => [String(mark.question_id), true])),
      );
      setMarkFilter("confirmed");
      setMarkCursor(0);
      setMessage(`All answers marked correct. ${maximumTotal} out of ${maximumTotal} is ready to publish.`);
    };
    const awardFullMarksForQuestion = (mark: any) => {
      const key = String(mark.question_id);
      setReview({
        ...review,
        [key]: {
          finalMark: String(mark.maximum || 0),
          feedback: review[key]?.feedback || "Correct response. Full marks awarded.",
        },
      });
      setConfirmedMarks({ ...confirmedMarks, [key]: true });
      if (safeMarkCursor < filteredMarks.length - 1) setMarkCursor(safeMarkCursor + 1);
    };
    return (
      <>
        <div className="portal-heading marking-heading">
          <div>
            <p>TEACHER REVIEW · NOT VISIBLE TO STUDENT</p>
            <h1>{active.student_name}</h1>
            <h2>{active.title}</h2>
          </div>
          <button onClick={() => setActive(null)}>← Marking queue</button>
        </div>
        <section className="moderation-toolbar panel">
          <div>
            <small>MODERATION PROGRESS</small>
            <b>{confirmedCount} of {active.marks.length} questions confirmed</b>
            <span>Provisional {active.total_proposed ?? 0} · Moderated {moderatedTotal} / {maximumTotal}</span>
          </div>
          <label>
            Show
            <select value={markFilter} onChange={(event) => { setMarkFilter(event.target.value as typeof markFilter); setMarkCursor(0); }}>
              <option value="attention">Needs attention</option>
              <option value="all">All questions</option>
              <option value="confirmed">Confirmed</option>
            </select>
          </label>
          <div className="review-pager">
            <button disabled={safeMarkCursor === 0} onClick={() => setMarkCursor(Math.max(0, safeMarkCursor - 1))}>← Previous</button>
            <b>{filteredMarks.length ? `${safeMarkCursor + 1} of ${filteredMarks.length}` : "No matches"}</b>
            <button disabled={safeMarkCursor >= filteredMarks.length - 1} onClick={() => setMarkCursor(safeMarkCursor + 1)}>Next →</button>
          </div>
          <button
            className="approve-reliable"
            disabled={!highConfidenceRemaining.length}
            onClick={approveHighConfidence}
          >
            ✓ Approve {highConfidenceRemaining.length} reliable suggestion{highConfidenceRemaining.length === 1 ? "" : "s"}
          </button>
          <button className="award-all-marks" onClick={awardFullMarksForPaper}>
            ✓ All correct — award full marks
          </button>
        </section>
        <section className="teacher-marking-dock">
          <span>
            <b>{confirmedCount} of {active.marks.length}</b> marks confirmed
          </span>
          <button onClick={() => saveReview(false)}>Save review</button>
          <button className="award-all-marks" onClick={awardFullMarksForPaper}>All correct · full marks</button>
          <button
            className="primary"
            disabled={confirmedCount !== active.marks.length}
            onClick={() => saveReview(true)}
          >
            Approve &amp; publish result →
          </button>
        </section>
        {message && <p className="queue-message panel">{message}</p>}
        {!!active.handwritten_count && (
          <section className="panel handwritten-page-review">
            <header>
              <div>
                <small>HANDWRITTEN SUBMISSION</small>
                <h3>Review the student’s complete page</h3>
                <p>Use the full page alongside the question-by-question marking controls below.</p>
              </div>
              <div className="review-pager">
                <button disabled={handwrittenPage === 0} onClick={() => setHandwrittenPage(Math.max(0, handwrittenPage - 1))}>← Previous</button>
                <b>{handwrittenPage + 1} of {active.handwritten_count}</b>
                <button disabled={handwrittenPage >= active.handwritten_count - 1} onClick={() => setHandwrittenPage(Math.min(active.handwritten_count - 1, handwrittenPage + 1))}>Next →</button>
              </div>
            </header>
            <iframe
              title={`Handwritten page ${handwrittenPage + 1}`}
              src={`/api/submissions/${active.id}/handwritten?page=${handwrittenPage}`}
            />
          </section>
        )}
        <div className="marking-review">
          {filteredMarks.length ? filteredMarks.slice(safeMarkCursor, safeMarkCursor + 1).map((mark: any) => {
            const answer = answerFor(mark.label) || {};
            const answerIndex = active.answers.indexOf(answer);
            const current = review[String(mark.question_id)] || {
              finalMark: "0",
              feedback: "",
            };
            return (
              <article className="panel mark-card" key={mark.question_id}>
                <header>
                  <div>
                    <small>QUESTION {mark.label}</small>
                    <h3>{mark.maximum || 0} marks available</h3>
                  </div>
                  <span className={`confidence ${mark.confidence}`}>
                    {mark.confidence === "high"
                      ? "High confidence"
                      : "Review required"}
                  </span>
                </header>
                <div className="mark-answer-grid">
                  <section>
                    <b>Student response</b>
                    {answer.formula && (
                      <p className="student-formula">
                        <b>Formula</b>
                        {answer.formula}
                      </p>
                    )}
                    {answer.working && (
                      <p className="student-working">
                        <b>Working out</b>
                        {answer.working}
                      </p>
                    )}
                    {answer.answers?.length > 1 ? (
                      <div className="student-final-answer">
                        <b>Submitted answers</b>
                        {answer.answers.map((value: string, index: number) => (
                          <strong key={index}>Answer {index + 1}: {value || "No answer"}</strong>
                        ))}
                      </div>
                    ) : answer.answer ? (
                      <div className="student-final-answer">
                        <b>Final answer</b>
                        <strong>{answer.answer}</strong>
                      </div>
                    ) : null}
                    {answer.handwrittenPageAssigned && (
                      <div className="question-handwritten-page">
                        <b>Detected handwritten response</b>
                        <small>
                          {answer.handwrittenUploadMode === "question_specific"
                            ? `Uploaded specifically for question ${mark.label}`
                            : `Linked automatically from the complete paper to question ${mark.label}`}
                          {answer.handwrittenPdfPage ? ` · paper page ${answer.handwrittenPdfPage}` : ""}
                        </small>
                        <iframe
                          title={`Handwritten response for question ${mark.label}`}
                          src={`/api/submissions/${active.id}/handwritten?page=${Number(answer.handwrittenFileIndex || 0)}${answer.handwrittenPdfPage ? `#page=${answer.handwrittenPdfPage}` : ""}`}
                        />
                      </div>
                    )}
                    {answer.drawingUrl && (
                      <img
                        src={`/api/submissions/${active.id}/drawing?index=${answerIndex}`}
                        alt={`Student drawing for question ${mark.label}`}
                      />
                    )}
                    {!answer.formula &&
                      !answer.working &&
                      !answer.answer &&
                      !answer.answers?.some((value: string) => value?.trim()) &&
                      !answer.drawingUrl &&
                      !answer.handwrittenPageAssigned && <p>No response submitted.</p>}
                  </section>
                  <section>
                    <b>Automatic proposal</b>
                    <strong>
                      {mark.proposed_mark ?? "—"} / {mark.maximum || 0}
                    </strong>
                    <p>{mark.rationale}</p>
                    {(mark.expected_answer || mark.mark_scheme_notes) && (
                      <div className="mark-scheme-reference">
                        <b>Mark-scheme reference</b>
                        {mark.expected_answer && <strong>{mark.expected_answer}</strong>}
                        {mark.mark_scheme_notes && <p>{mark.mark_scheme_notes}</p>}
                      </div>
                    )}
                    {mark.draft_answer && (
                      <div className="mark-scheme-reference homework-marking-guide">
                        <b>Generated homework guide · {mark.draft_confidence === "high" ? "high confidence" : mark.draft_confidence === "medium" ? "check each step" : "teacher review"}</b>
                        <pre>{mark.draft_answer}</pre>
                      </div>
                    )}
                  </section>
                  <section className="teacher-decision">
                    <label>
                      Confirmed mark
                      <input
                        type="number"
                        min="0"
                        max={mark.maximum || 0}
                        value={current.finalMark}
                        onChange={(e) =>
                          {
                            setReview({
                              ...review,
                              [String(mark.question_id)]: {
                                ...current,
                                finalMark: e.target.value,
                              },
                            });
                            setConfirmedMarks({ ...confirmedMarks, [String(mark.question_id)]: false });
                          }
                        }
                      />
                    </label>
                    <label>
                      Question feedback
                      <textarea
                        value={current.feedback}
                        onChange={(e) =>
                          setReview({
                            ...review,
                            [String(mark.question_id)]: {
                              ...current,
                              feedback: e.target.value,
                            },
                          })
                        }
                      />
                    </label>
                    <button
                      className="confirm-mark"
                      onClick={() => {
                        setConfirmedMarks({ ...confirmedMarks, [String(mark.question_id)]: true });
                        if (markFilter !== "attention" && safeMarkCursor < filteredMarks.length - 1)
                          setMarkCursor(safeMarkCursor + 1);
                      }}
                    >
                      ✓ Confirm mark & continue
                    </button>
                    <button
                      className="award-question-full"
                      onClick={() => awardFullMarksForQuestion(mark)}
                    >
                      ✓ Correct — award {mark.maximum || 0}/{mark.maximum || 0} &amp; continue
                    </button>
                  </section>
                </div>
              </article>
            );
          }) : <div className="empty-review-filter">No questions match this filter.</div>}
          <section className="panel publish-review">
            <label>
              Overall feedback
              <textarea
                value={overallFeedback}
                onChange={(e) => setOverallFeedback(e.target.value)}
                placeholder="Feedback the student will see after publication…"
              />
            </label>
            <div>
              <button onClick={() => saveReview(false)}>Save review</button>
              <button className="primary" disabled={confirmedCount !== active.marks.length} onClick={() => saveReview(true)}>
                Approve & publish result →
              </button>
            </div>
          </section>
        </div>
      </>
    );
  }
  const queueCounts = {
    attention: submissions.filter((submission) => submission.status === "awaiting_review").length,
    ready: submissions.filter((submission) => submission.status === "reviewed").length,
    published: submissions.filter((submission) => submission.status === "published").length,
  };
  const visibleSubmissions = submissions.filter((submission) => {
    if (queueFilter === "attention") return submission.status === "awaiting_review";
    if (queueFilter === "ready") return submission.status === "reviewed";
    if (queueFilter === "published") return submission.status === "published";
    return true;
  });
  return (
    <>
      <div className="portal-heading">
        <div>
          <p>MARKING QUEUE</p>
          <h1>Student submissions</h1>
          <h2>
            Review proposed marks, handwriting flags and student corrections.
          </h2>
        </div>
        {queueCounts.ready > 0 && (
          <button
            className="primary"
            disabled={queueAction === "all-ready"}
            onClick={publishAllReady}
          >
            {queueAction === "all-ready" ? "Publishing…" : `Publish all ready (${queueCounts.ready})`}
          </button>
        )}
      </div>
      <div className="marking-queue-stats">
        <button className={queueFilter === "attention" ? "active" : ""} onClick={() => setQueueFilter("attention")}>
          <small>NEEDS REVIEW</small><b>{queueCounts.attention}</b><span>Teacher check required</span>
        </button>
        <button className={queueFilter === "ready" ? "active ready" : ""} onClick={() => setQueueFilter("ready")}>
          <small>READY TO PUBLISH</small><b>{queueCounts.ready}</b><span>All marks confirmed</span>
        </button>
        <button className={queueFilter === "published" ? "active published" : ""} onClick={() => setQueueFilter("published")}>
          <small>PUBLISHED</small><b>{queueCounts.published}</b><span>Visible to students</span>
        </button>
      </div>
      <section className="panel student-table marking-queue-table">
        <header>
          <div>
            <h3>
              {visibleSubmissions.length} paper
              {visibleSubmissions.length === 1 ? "" : "s"} in this view
            </h3>
            <p>Automatic proposals remain private until teacher approval.</p>
          </div>
          <select value={queueFilter} onChange={(event) => setQueueFilter(event.target.value as typeof queueFilter)}>
            <option value="attention">Needs review</option>
            <option value="ready">Ready to publish</option>
            <option value="published">Published</option>
            <option value="all">All submissions</option>
          </select>
        </header>
        {message && <p className="queue-message">{message}</p>}
        {!message && !visibleSubmissions.length && (
          <p className="queue-message">There are no submissions in this stage.</p>
        )}
        {visibleSubmissions.map((submission) => (
          <article key={submission.id}>
            <span>
              {submission.student_name
                .split(" ")
                .map((x: string) => x[0])
                .join("")}
            </span>
            <div>
              <b>{submission.student_name}</b>
              <small>{submission.title}</small>
            </div>
            <em className={submission.status === "published" ? "" : "warn"}>
              {submission.status === "published"
                ? "Published"
                : submission.status === "reviewed"
                  ? "Ready to publish"
                  : "Awaiting review"}
            </em>
            <p>Proposed: {submission.total_proposed ?? "—"}</p>
            {submission.status === "published" ? (
              <a className="report-download" href={`/api/submissions/${submission.id}/report`}>
                Download progress report
              </a>
            ) : submission.status === "reviewed" ? (
              <button
                className="review-button publish-ready-button"
                disabled={queueAction === String(submission.id)}
                onClick={() => publishReady(submission)}
              >
                {queueAction === String(submission.id) ? "Publishing…" : "Publish result →"}
              </button>
            ) : (
              <button
                className="review-button"
                onClick={() => openReview(submission)}
              >
                {submission.status === "published" ? "Review record →" : "Review marks →"}
              </button>
            )}
          </article>
        ))}
      </section>
    </>
  );
}

type AnswerRow = {
  question: string;
  formula?: string;
  working?: string;
  answer: string;
  answers?: string[];
  workMode?: "answer" | "working" | "formula";
  drawing?: string;
  showDrawing?: boolean;
};

type AnswerDraft = {
  rows: AnswerRow[];
  activeIndex: number;
  mode: "typed" | "handwritten" | "both" | "paper";
  paperPages?: Record<number, string>;
  paperPageNumber?: number;
  savedAt: string;
};

const openDraftStore = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("studytrack-student-drafts", 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains("drafts"))
        request.result.createObjectStore("drafts");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

async function readAnswerDraft(key: string) {
  const database = await openDraftStore();
  return new Promise<AnswerDraft | null>((resolve, reject) => {
    const request = database.transaction("drafts").objectStore("drafts").get(key);
    request.onsuccess = () => resolve((request.result as AnswerDraft) || null);
    request.onerror = () => reject(request.error);
  }).finally(() => database.close());
}

async function writeAnswerDraft(key: string, draft: AnswerDraft) {
  const database = await openDraftStore();
  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction("drafts", "readwrite");
    transaction.objectStore("drafts").put(draft, key);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  }).finally(() => database.close());
}

async function removeAnswerDraft(key: string) {
  const database = await openDraftStore();
  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction("drafts", "readwrite");
    transaction.objectStore("drafts").delete(key);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  }).finally(() => database.close());
}

async function readCloudAnswerDraft(assignmentId: string) {
  const response = await fetch(`/api/assignments/${assignmentId}/draft`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Cloud draft unavailable");
  const result = await response.json();
  return (result.draft as AnswerDraft | null) || null;
}

async function writeCloudAnswerDraft(
  assignmentId: string,
  draft: AnswerDraft,
) {
  const response = await fetch(`/api/assignments/${assignmentId}/draft`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ draft }),
  });
  if (!response.ok) throw new Error("Cloud draft unavailable");
}

async function removeCloudAnswerDraft(assignmentId: string) {
  const response = await fetch(`/api/assignments/${assignmentId}/draft`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Cloud draft could not be removed");
}

function PdfAnnotator({
  assignment,
  pages,
  setPages,
  pageNumber,
  setPageNumber,
  onSubmitted,
}: {
  assignment: { id: string; title: string };
  pages: Record<number, string>;
  setPages: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  pageNumber: number;
  setPageNumber: React.Dispatch<React.SetStateAction<number>>;
  onSubmitted: (status: string) => Promise<void>;
}) {
  const paperCanvas = useRef<HTMLCanvasElement>(null);
  const inkCanvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [pdf, setPdf] = useState<any>(null);
  const [tool, setTool] = useState<"pen" | "shade" | "eraser">("pen");
  const [message, setMessage] = useState("Loading paper…");
  const [reviewing, setReviewing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    (async () => {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const data = await fetch(`/api/assignments/${assignment.id}/paper`).then(
        (r) => r.arrayBuffer(),
      );
      const document = await pdfjs.getDocument({ data }).promise;
      setPdf(document);
      setMessage("");
    })().catch(() => setMessage("The paper could not be loaded."));
  }, [assignment.id]);
  useEffect(() => {
    if (!pdf) return;
    (async () => {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.45 });
      const base = paperCanvas.current!;
      const ink = inkCanvas.current!;
      base.width = ink.width = viewport.width;
      base.height = ink.height = viewport.height;
      await page.render({
        canvas: base,
        canvasContext: base.getContext("2d")!,
        viewport,
      }).promise;
      ink.getContext("2d")!.clearRect(0, 0, ink.width, ink.height);
      const saved = pages[pageNumber];
      if (saved) {
        const image = new Image();
        image.onload = () => ink.getContext("2d")!.drawImage(image, 0, 0);
        image.src = saved;
      }
    })();
  }, [pdf, pageNumber, pages]);
  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = inkCanvas.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) * canvas.width) / rect.width,
      y: ((e.clientY - rect.top) * canvas.height) / rect.height,
    };
  };
  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = inkCanvas.current!;
    canvas.setPointerCapture(e.pointerId);
    const ctx = canvas.getContext("2d")!;
    const p = point(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalCompositeOperation =
      tool === "eraser" ? "destination-out" : "source-over";
    ctx.strokeStyle = tool === "shade" ? "rgba(255,193,7,.35)" : "#342f4d";
    ctx.lineWidth = tool === "shade" ? 28 : tool === "eraser" ? 24 : 3;
    drawing.current = true;
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = inkCanvas.current!.getContext("2d")!;
    const p = point(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };
  const stop = () => {
    if (!drawing.current) return;
    drawing.current = false;
    setPages({
      ...pages,
      [pageNumber]: inkCanvas.current!.toDataURL("image/png"),
    });
  };
  const clearPage = () => {
    const canvas = inkCanvas.current!;
    canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
    const next = { ...pages };
    delete next[pageNumber];
    setPages(next);
  };
  async function submitPaper() {
    if (!confirmed || submitting) return;
    setSubmitting(true);
    setMessage("Submitting annotated paper…");
    const form = new FormData();
    form.set(
      "answers",
      JSON.stringify(
        Object.entries(pages).map(([page, drawing]) => ({
          question: `Page ${page}`,
          drawing,
        })),
      ),
    );
    const response = await fetch(`/api/assignments/${assignment.id}/submit`, {
      method: "POST",
      body: form,
    });
    const result = await response.json();
    if (response.ok) await onSubmitted(String(result.status || "awaiting_review"));
    setMessage(
      response.ok
        ? "Your annotated paper was submitted to your teacher."
        : result.error || "Submission failed.",
    );
    if (response.ok) setReviewing(false);
    setSubmitting(false);
  }
  return (
    <section className="paper-annotator">
      <div className="annotator-toolbar">
        <div>
          <button
            className={tool === "pen" ? "active" : ""}
            onClick={() => setTool("pen")}
          >
            ✎ Pen
          </button>
          <button
            className={tool === "shade" ? "active" : ""}
            onClick={() => setTool("shade")}
          >
            ▨ Shade
          </button>
          <button
            className={tool === "eraser" ? "active" : ""}
            onClick={() => setTool("eraser")}
          >
            ⌫ Eraser
          </button>
          <button onClick={clearPage}>Clear page</button>
        </div>
        <div>
          <button
            disabled={pageNumber === 1}
            onClick={() => setPageNumber(pageNumber - 1)}
          >
            ←
          </button>
          <b>
            Page {pageNumber} of {pdf?.numPages || "…"}
          </b>
          <button
            disabled={!pdf || pageNumber === pdf.numPages}
            onClick={() => setPageNumber(pageNumber + 1)}
          >
            →
          </button>
        </div>
        <button
          className="primary annotator-submit"
          disabled={!Object.keys(pages).length}
          onClick={() => {
            setConfirmed(false);
            setReviewing(true);
          }}
        >
          Review &amp; submit →
        </button>
      </div>
      <div className="annotated-page">
        <canvas ref={paperCanvas} />
        <canvas
          ref={inkCanvas}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={stop}
          onPointerCancel={stop}
        />
      </div>
      <footer>
        <p>
          {message ||
            `${Object.keys(pages).length} page${Object.keys(pages).length === 1 ? "" : "s"} annotated`}
        </p>
        <button
          className="primary"
          disabled={!Object.keys(pages).length}
          onClick={() => {
            setConfirmed(false);
            setReviewing(true);
          }}
        >
          Review & submit →
        </button>
      </footer>
      {reviewing && (
        <div
          className="portal-modal submission-review-modal"
          onMouseDown={() => !submitting && setReviewing(false)}
        >
          <section
            className="submission-review-shell paper-submission-review"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <small>FINAL CHECK</small>
                <h2>Review annotated pages</h2>
                <p>{assignment.title}</p>
              </div>
              <button className="x" onClick={() => setReviewing(false)}>×</button>
            </header>
            <div className="submission-review-summary">
              <article className="complete">
                <small>ANNOTATED PAGES</small>
                <b>{Object.keys(pages).length}</b>
              </article>
              <article>
                <small>TOTAL PAGES</small>
                <b>{pdf?.numPages || "—"}</b>
              </article>
            </div>
            <div className="unanswered-warning">
              <b>Check every required page</b>
              <p>
                Only pages containing pen, shading or eraser changes will be
                submitted to your teacher.
              </p>
            </div>
            <div className="submission-question-checklist paper-pages-checklist">
              {Array.from({ length: pdf?.numPages || 0 }, (_, index) => {
                const page = index + 1;
                const annotated = Boolean(pages[page]);
                return (
                  <button
                    type="button"
                    key={page}
                    className={annotated ? "answered" : "unanswered"}
                    onClick={() => {
                      setPageNumber(page);
                      setReviewing(false);
                    }}
                  >
                    <span>{annotated ? "✓" : "—"}</span>
                    <b>Page {page}</b>
                    <small>{annotated ? "Annotated" : "No changes"}</small>
                  </button>
                );
              })}
            </div>
            <footer>
              <label>
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(event) => setConfirmed(event.target.checked)}
                />
                <span>I have checked the pages I want to submit.</span>
              </label>
              <div>
                <button type="button" onClick={() => setReviewing(false)}>
                  Continue working
                </button>
                <button
                  type="button"
                  className="primary"
                  disabled={!confirmed || submitting}
                  onClick={submitPaper}
                >
                  {submitting ? "Submitting…" : "Confirm & submit →"}
                </button>
              </div>
            </footer>
          </section>
        </div>
      )}
    </section>
  );
}

function DrawingPad({
  onChange,
  background,
}: {
  onChange: (image: string) => void;
  background?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const restoreBackground = () => {
    const canvas = canvasRef.current!;
    const context = canvas.getContext("2d")!;
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (!background) return;
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(
        canvas.width / image.width,
        canvas.height / image.height,
      );
      const width = image.width * scale;
      const height = image.height * scale;
      context.drawImage(
        image,
        (canvas.width - width) / 2,
        (canvas.height - height) / 2,
        width,
        height,
      );
    };
    image.src = background;
  };
  useEffect(restoreBackground, [background]);
  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) * canvas.width) / rect.width,
      y: ((e.clientY - rect.top) * canvas.height) / rect.height,
    };
  };
  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    canvas.setPointerCapture(e.pointerId);
    const ctx = canvas.getContext("2d")!;
    const p = point(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.strokeStyle = "#29263c";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    drawing.current = true;
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const p = point(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };
  const stop = () => {
    if (!drawing.current) return;
    drawing.current = false;
    onChange(canvasRef.current!.toDataURL("image/png"));
  };
  const clear = () => {
    restoreBackground();
    onChange(background || "");
  };
  return (
    <div className="drawing-pad">
      <div>
        <b>
          {background ? "Draw your answer on the question" : "Freehand drawing"}
        </b>
        <small>Mouse, touchscreen or stylus</small>
        <button type="button" onClick={clear}>
          Clear
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={900}
        height={360}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={stop}
        onPointerCancel={stop}
      />
    </div>
  );
}

const renderedQuestionCache = new Map<string, string>();

function QuestionImage({
  assignmentId,
  pdf,
  question,
  onRendered,
}: {
  assignmentId: string;
  pdf: any;
  question: PaperQuestion;
  onRendered?: (image: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [message, setMessage] = useState("Loading question…");
  useEffect(() => {
    if (!pdf) return;
    setMessage("Loading question…");
    const visibleCanvas = canvasRef.current;
    if (visibleCanvas) {
      visibleCanvas
        .getContext("2d")
        ?.clearRect(0, 0, visibleCanvas.width, visibleCanvas.height);
    }
    let cancelled = false;
    (async () => {
      const cacheKey = `top-pad-v1:${assignmentId}:${question.id || question.position}:${question.page_number}:${question.crop_x}:${question.crop_y}:${question.crop_width}:${question.crop_height}`;
      const cached = renderedQuestionCache.get(cacheKey);
      if (cached) {
        const image = new Image();
        await new Promise<void>((resolve, reject) => {
          image.onload = () => resolve();
          image.onerror = () => reject();
          image.src = cached;
        });
        if (cancelled) return;
        const target = canvasRef.current!;
        target.width = image.width;
        target.height = image.height;
        target.getContext("2d")!.drawImage(image, 0, 0);
        onRendered?.(cached);
        setMessage("");
        return;
      }
      const page = await pdf.getPage(question.page_number);
      const viewport = page.getViewport({ scale: 1.7 });
      const source = document.createElement("canvas");
      source.width = viewport.width;
      source.height = viewport.height;
      await page.render({
        canvas: source,
        canvasContext: source.getContext("2d")!,
        viewport,
      }).promise;
      if (cancelled) return;
      const visibleCrop = displayCrop(question);
      const sx = Math.round(visibleCrop.x * source.width);
      const sy = Math.round(visibleCrop.y * source.height);
      const sw = Math.max(1, Math.round(visibleCrop.width * source.width));
      const sh = Math.max(1, Math.round(visibleCrop.height * source.height));
      const target = canvasRef.current!;
      target.width = sw;
      target.height = sh;
      target.getContext("2d")!.drawImage(source, sx, sy, sw, sh, 0, 0, sw, sh);
      const rendered = target.toDataURL("image/webp", 0.92);
      renderedQuestionCache.set(cacheKey, rendered);
      onRendered?.(rendered);
      setMessage("");
    })().catch(() => setMessage("This question could not be displayed."));
    return () => {
      cancelled = true;
    };
  }, [assignmentId, pdf, question]);
  return (
    <div className="question-image">
      {message && <p>{message}</p>}
      <canvas ref={canvasRef} />
    </div>
  );
}

function AnswerWorkspace({
  assignment,
  back,
  submitted,
}: {
  assignment: {
    id: string;
    title: string;
    subject?: string;
    syllabus?: string;
    paper_mode?: "structured" | "multiple_choice";
  };
  back: () => void;
  submitted: (status: string) => void;
}) {
  const { user } = useUser();
  const formRef = useRef<HTMLFormElement>(null);
  const [rows, setRows] = useState<AnswerRow[]>([
    { question: "1", working: "", answer: "" },
  ]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [message, setMessage] = useState("");
  const [paperQuestions, setPaperQuestions] = useState<PaperQuestion[]>([]);
  const [questionPdf, setQuestionPdf] = useState<any>(null);
  const [questionBackgrounds, setQuestionBackgrounds] = useState<
    Record<number, string>
  >({});
  const [showFullPaper, setShowFullPaper] = useState(false);
  const [reviewingSubmission, setReviewingSubmission] = useState(false);
  const [confirmSubmission, setConfirmSubmission] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [handwrittenAttached, setHandwrittenAttached] = useState("");
  const [handwrittenUploadMode, setHandwrittenUploadMode] = useState<"whole_paper" | "question_specific">("whole_paper");
  const [wholePaperFiles, setWholePaperFiles] = useState<File[]>([]);
  const [questionSpecificFiles, setQuestionSpecificFiles] = useState<Record<number, File>>({});
  const [questionUploadTarget, setQuestionUploadTarget] = useState(0);
  const [mode, setMode] = useState<"typed" | "handwritten" | "both" | "paper">(
    "typed",
  );
  const [paperPages, setPaperPages] = useState<Record<number, string>>({});
  const [paperPageNumber, setPaperPageNumber] = useState(1);
  const [draftReady, setDraftReady] = useState(false);
  const [saveState, setSaveState] = useState<
    "loading" | "saving" | "cloud" | "device" | "error"
  >("loading");
  const pendingDraftWrite = useRef<Promise<void>>(Promise.resolve());
  const draftKey = user?.id ? `${user.id}:${assignment.id}` : "";
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/assignments/${assignment.id}/questions`)
      .then((response) => response.json())
      .then(async (questions) => {
        if (!Array.isArray(questions) || !questions.length) return;
        setPaperQuestions(questions);
        const blankRows = questions.map((question: PaperQuestion) => ({
          question: question.label,
          formula: "",
          working: "",
          answer: "",
          answers: Array.from(
            { length: Math.max(1, Number(question.answer_slots) || 1) },
            () => "",
          ),
          workMode: question.response_layout || "answer",
        }));
        let cloudDraft: AnswerDraft | null = null;
        let deviceDraft: AnswerDraft | null = null;
        if (draftKey) {
          const [cloudResult, deviceResult] = await Promise.allSettled([
            readCloudAnswerDraft(assignment.id),
            readAnswerDraft(draftKey),
          ]);
          if (cloudResult.status === "fulfilled") cloudDraft = cloudResult.value;
          if (deviceResult.status === "fulfilled") deviceDraft = deviceResult.value;
        }
        const restored = cloudDraft || deviceDraft;
        const validDraft =
          restored &&
          restored.rows.length === blankRows.length &&
          restored.rows.every(
            (row, index) => row.question === blankRows[index].question,
          );
        setRows(
          validDraft
            ? restored!.rows.map((row, index) => ({
                ...row,
                workMode: blankRows[index].workMode,
                answers: Array.from(
                  { length: blankRows[index].answers.length },
                  (_, answerIndex) =>
                    row.answers?.[answerIndex] ||
                    (answerIndex === 0 ? row.answer : "") ||
                    "",
                ),
              }))
            : blankRows,
        );
        setActiveIndex(
          validDraft
            ? Math.min(restored!.activeIndex, blankRows.length - 1)
            : 0,
        );
        if (validDraft)
          setMode(
            assignment.paper_mode === "multiple_choice" ? "typed" : restored!.mode,
          );
        if (validDraft) {
          setPaperPages(restored!.paperPages || {});
          setPaperPageNumber(restored!.paperPageNumber || 1);
          setMessage(
            cloudDraft
              ? "Your cloud draft was restored."
              : "Your saved device draft was restored and will be copied to your account.",
          );
        }
        setDraftReady(true);
        setSaveState(
          validDraft ? (cloudDraft ? "cloud" : "device") : "saving",
        );
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const data = await fetch(
          `/api/assignments/${assignment.id}/paper`,
        ).then((response) => response.arrayBuffer());
        const document = await pdfjs.getDocument({ data }).promise;
        if (cancelled) return;
        setQuestionPdf(document);
      });
    return () => {
      cancelled = true;
    };
  }, [assignment.id, draftKey]);
  useEffect(() => {
    if (!draftReady || !draftKey) return;
    setSaveState("saving");
    const timer = window.setTimeout(() => {
      const draft: AnswerDraft = {
        rows,
        activeIndex,
        mode,
        paperPages,
        paperPageNumber,
        savedAt: new Date().toISOString(),
      };
      const write = (async () => {
        const [cloudResult, deviceResult] = await Promise.allSettled([
          writeCloudAnswerDraft(assignment.id, draft),
          writeAnswerDraft(draftKey, draft),
        ]);
        if (cloudResult.status === "fulfilled") {
          setSaveState("cloud");
          return;
        }
        if (deviceResult.status === "fulfilled") {
          setSaveState("device");
          return;
        }
        throw new Error("Draft could not be saved");
      })();
      pendingDraftWrite.current = write;
      write.catch(() => setSaveState("error"));
    }, 900);
    return () => window.clearTimeout(timer);
  }, [
    rows,
    activeIndex,
    mode,
    paperPages,
    paperPageNumber,
    draftReady,
    draftKey,
    assignment.id,
  ]);
  async function clearSavedDraft() {
    setDraftReady(false);
    await pendingDraftWrite.current.catch(() => undefined);
    await Promise.allSettled([
      removeCloudAnswerDraft(assignment.id),
      draftKey ? removeAnswerDraft(draftKey) : Promise.resolve(),
    ]);
    setSaveState("cloud");
  }
  const questionAnswered = (row: AnswerRow, index: number) => {
    const expectedSlots = Math.max(
      1,
      Number(paperQuestions[index]?.answer_slots) || 1,
    );
    const answers = row.answers || [row.answer];
    if (paperQuestions[index]?.response_type === "drawing")
      return Boolean(row.drawing);
    return (
      answers.slice(0, expectedSlots).every((answer) => answer.trim()) ||
      Boolean(row.drawing)
    );
  };
  const answeredIndexes = rows
    .map((row, index) => (questionAnswered(row, index) ? index : -1))
    .filter((index) => index >= 0);
  const unansweredIndexes = rows
    .map((row, index) => (!questionAnswered(row, index) ? index : -1))
    .filter((index) => index >= 0);
  const completion = rows.length
    ? Math.round((answeredIndexes.length / rows.length) * 100)
    : 0;
  const supportingWorkCount = rows.filter(
    (row) => row.formula?.trim() || row.working?.trim() || row.drawing,
  ).length;
  function openSubmissionReview(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setConfirmSubmission(false);
    setReviewingSubmission(true);
  }
  async function submitFinal() {
    if (!formRef.current || !confirmSubmission || submitting) return;
    setSubmitting(true);
    setMessage("Submitting…");
    const form = new FormData(formRef.current);
    form.delete("handwritten");
    if (handwrittenUploadMode === "whole_paper") {
      wholePaperFiles.forEach((file) => form.append("handwritten", file));
      form.set("handwrittenMode", "whole_paper");
    } else {
      const assignments: Array<{ question: string; fileIndex: number }> = [];
      Object.entries(questionSpecificFiles)
        .sort(([left], [right]) => Number(left) - Number(right))
        .forEach(([indexValue, file], fileIndex) => {
          const index = Number(indexValue);
          form.append("handwritten", file);
          assignments.push({ question: rows[index]?.question || String(index + 1), fileIndex });
        });
      form.set("handwrittenMode", "question_specific");
      form.set("handwrittenAssignments", JSON.stringify(assignments));
    }
    form.set(
      "answers",
      JSON.stringify(
        rows.filter(
          (row) =>
            row.question.trim() ||
            row.answer.trim() ||
            row.working?.trim() ||
            row.drawing,
        ),
      ),
    );
    const response = await fetch(`/api/assignments/${assignment.id}/submit`, {
      method: "POST",
      body: form,
    });
    const result = await response.json();
    if (response.ok) {
      await clearSavedDraft();
      submitted(String(result.status || "awaiting_review"));
      setReviewingSubmission(false);
    }
    setMessage(
      response.ok
        ? result.status === "published"
          ? `Marked automatically: ${result.total} out of ${result.maximum}. Your final result is published.`
          : "Your answers were submitted to your teacher."
        : result.error || "Submission failed.",
    );
    setSubmitting(false);
  }
  if (mode === "paper")
    return (
      <>
        <div className="portal-heading answer-workspace-head">
          <div>
            <p>ANSWER ON PAPER</p>
            <h1>{assignment.title}</h1>
            <h2>Write and shade directly on the question paper.</h2>
          </div>
          <div>
            <button onClick={() => setMode("typed")}>Use answer sheet</button>
            <button onClick={back}>← Assigned papers</button>
          </div>
        </div>
        <PdfAnnotator
          assignment={assignment}
          pages={paperPages}
          setPages={setPaperPages}
          pageNumber={paperPageNumber}
          setPageNumber={setPaperPageNumber}
          onSubmitted={async (status) => {
            await clearSavedDraft();
            submitted(status);
          }}
        />
      </>
    );
  return (
    <>
      <div className="portal-heading answer-workspace-head">
        <div>
          <p>ANSWER WORKSPACE</p>
          <h1>{assignment.title}</h1>
          <h2>Read the paper, then type answers or upload handwritten work.</h2>
        </div>
        <button onClick={back}>← Assigned papers</button>
      </div>
      <div className="answer-layout">
        <section className="panel paper-viewer">
          <header>
            <div>
              <h3>
                {paperQuestions.length && !showFullPaper
                  ? `Question ${paperQuestions[activeIndex]?.label}`
                  : "Question paper"}
              </h3>
              <p>
                {paperQuestions.length && !showFullPaper
                  ? `${paperQuestions[activeIndex]?.marks || "—"} marks · Question ${activeIndex + 1} of ${paperQuestions.length}`
                  : "The mark scheme is not available to students."}
              </p>
            </div>
            {!!paperQuestions.length && (
              <button onClick={() => setShowFullPaper(!showFullPaper)}>
                {showFullPaper ? "Show current question" : "View full paper"}
              </button>
            )}
          </header>
          {paperQuestions.length && !showFullPaper ? (
            <QuestionImage
              assignmentId={assignment.id}
              pdf={questionPdf}
              question={paperQuestions[activeIndex]}
              onRendered={(image) =>
                setQuestionBackgrounds((current) =>
                  current[activeIndex] === image
                    ? current
                    : { ...current, [activeIndex]: image },
                )
              }
            />
          ) : (
            <iframe
              title={assignment.title}
              src={`/api/assignments/${assignment.id}/paper`}
              style={{ width: "100%", height: "70vh", border: 0 }}
            />
          )}
        </section>
        <section className="panel answer-panel">
          <form id="student-answer-form" ref={formRef} className="answer-form" onSubmit={openSubmissionReview}>
            <div className="answer-form-title">
              <div>
                <small>YOUR RESPONSE</small>
                <h3>Complete the paper</h3>
              </div>
              <span className={`draft-status ${saveState}`}>
                {saveState === "loading"
                  ? "Loading draft…"
                  : saveState === "saving"
                    ? "Saving to cloud…"
                    : saveState === "error"
                      ? "Draft not saved"
                      : saveState === "device"
                        ? "Saved on this device"
                        : "✓ Saved to account"}
              </span>
              <button type="submit" className="workspace-submit">
                Review &amp; submit →
              </button>
            </div>
            {assignment.paper_mode !== "multiple_choice" && (
            <div className="answer-methods">
              {(
                [
                  ["typed", "Typed answers"],
                  ["handwritten", "Handwritten upload"],
                  ["both", "Both"],
                  ["paper", "Answer on paper"],
                ] as const
              ).map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  className={mode === value ? "active" : ""}
                  onClick={() => setMode(value)}
                >
                  {label}
                </button>
              ))}
            </div>
            )}
            {mode !== "handwritten" && (
              <>
                <div className="question-progress">
                  <div>
                    <b>Question response {activeIndex + 1}</b>
                    <small>
                      {
                        rows.filter(
                          (row) =>
                            row.answer.trim() ||
                            row.answers?.some((answer) => answer.trim()) ||
                            row.drawing,
                        )
                          .length
                      }{" "}
                      of {rows.length} answered
                    </small>
                  </div>
                  <div>
                    {rows.map((row, index) => (
                      <button
                        type="button"
                        key={index}
                        className={`${activeIndex === index ? "active" : ""} ${row.answer.trim() || row.answers?.some((answer) => answer.trim()) || row.drawing ? "done" : ""}`}
                        onClick={() => setActiveIndex(index)}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="answer-entry single-question">
                  <div className="answer-number">{activeIndex + 1}</div>
                  <label>
                    Question number
                    <input
                      value={rows[activeIndex].question}
                      readOnly={!!paperQuestions.length}
                      onChange={(e) =>
                        setRows(
                          rows.map((item, i) =>
                            i === activeIndex
                              ? { ...item, question: e.target.value }
                              : item,
                          ),
                        )
                      }
                      placeholder="e.g. 1(a)"
                    />
                  </label>
                  {assignment.subject === "Physics" &&
                    assignment.paper_mode !== "multiple_choice" && (
                    <p className="answer-layout-choice">
                      Response required: {rows[activeIndex].workMode === "formula"
                        ? "Formula, working out and final answer"
                        : rows[activeIndex].workMode === "working"
                          ? "Working out and final answer"
                          : "Answer only"}
                    </p>
                  )}
                  {assignment.subject === "Physics" &&
                    rows[activeIndex].workMode === "formula" && (
                    <label className="formula-field">
                      Formula
                      <input
                        value={rows[activeIndex].formula || ""}
                        onChange={(e) =>
                          setRows(
                            rows.map((item, i) =>
                              i === activeIndex
                                ? { ...item, formula: e.target.value }
                                : item,
                            ),
                          )
                        }
                        placeholder="Write the equation or formula used"
                      />
                    </label>
                  )}
                  {assignment.paper_mode !== "multiple_choice" &&
                    (assignment.subject !== "Physics" ||
                    rows[activeIndex].workMode === "working" ||
                    rows[activeIndex].workMode === "formula") && (
                  <label className="working-field">
                    {assignment.subject === "Physics" ? "Working out" : "Show your working"}
                    <textarea
                      value={rows[activeIndex].working || ""}
                      onChange={(e) =>
                        setRows(
                          rows.map((item, i) =>
                            i === activeIndex
                              ? { ...item, working: e.target.value }
                              : item,
                          ),
                        )
                      }
                      placeholder="Write calculations, reasoning and method here…"
                    />
                  </label>
                  )}
                  {Array.from(
                    {
                      length: Math.max(
                        1,
                        Number(paperQuestions[activeIndex]?.answer_slots) || 1,
                      ),
                    },
                    (_, answerIndex) => {
                      const answerValues = rows[activeIndex].answers || [
                        rows[activeIndex].answer,
                      ];
                      return (
                        <label className="final-answer-field" key={answerIndex}>
                          {answerValues.length > 1
                            ? `Answer ${answerIndex + 1}`
                            : assignment.subject === "Physics"
                              ? "Final answer and unit"
                              : "Final answer"}
                          {paperQuestions[activeIndex]?.response_type ===
                          "multiple_choice" ? (
                            <select
                              value={answerValues[answerIndex] || ""}
                              required
                              onChange={(e) =>
                                setRows(
                                  rows.map((item, i) => {
                                    if (i !== activeIndex) return item;
                                    const answers = [
                                      ...(item.answers || [item.answer]),
                                    ];
                                    answers[answerIndex] = e.target.value;
                                    return {
                                      ...item,
                                      answers,
                                      answer: answers[0] || "",
                                    };
                                  }),
                                )
                              }
                            >
                              <option value="">Select A, B, C or D</option>
                              <option value="A">A</option>
                              <option value="B">B</option>
                              <option value="C">C</option>
                              <option value="D">D</option>
                            </select>
                          ) : (
                            <input
                              value={answerValues[answerIndex] || ""}
                              onChange={(e) =>
                                setRows(
                                  rows.map((item, i) => {
                                    if (i !== activeIndex) return item;
                                    const answers = [
                                      ...(item.answers || [item.answer]),
                                    ];
                                    answers[answerIndex] = e.target.value;
                                    return {
                                      ...item,
                                      answers,
                                      answer: answers[0] || "",
                                    };
                                  }),
                                )
                              }
                              placeholder={`Enter answer ${answerIndex + 1}`}
                            />
                          )}
                        </label>
                      );
                    },
                  )}
                  {assignment.paper_mode !== "multiple_choice" && <button
                    className="drawing-toggle"
                    type="button"
                    disabled={
                      paperQuestions[activeIndex]?.response_type === "drawing"
                    }
                    onClick={() =>
                      setRows(
                        rows.map((item, i) =>
                          i === activeIndex
                            ? { ...item, showDrawing: !item.showDrawing }
                            : item,
                        ),
                      )
                    }
                  >
                    {paperQuestions[activeIndex]?.response_type === "drawing"
                      ? "Drawing answer required"
                      : rows[activeIndex].showDrawing
                        ? "Hide drawing pad"
                        : "✎ Add freehand drawing"}
                  </button>}
                  {(rows[activeIndex].showDrawing ||
                    paperQuestions[activeIndex]?.response_type ===
                      "drawing") && (
                    <DrawingPad
                      background={
                        paperQuestions[activeIndex]?.response_type === "drawing"
                          ? questionBackgrounds[activeIndex]
                          : undefined
                      }
                      onChange={(drawing) =>
                        setRows(
                          rows.map((item, i) =>
                            i === activeIndex ? { ...item, drawing } : item,
                          ),
                        )
                      }
                    />
                  )}
                </div>
                <div className="question-actions">
                  <button
                    type="button"
                    disabled={activeIndex === 0}
                    onClick={() => setActiveIndex(activeIndex - 1)}
                  >
                    ← Previous
                  </button>
                  <span>
                    Answers and drawings are saved automatically to your account.
                  </span>
                  {!!paperQuestions.length && activeIndex === rows.length - 1 ? (
                    <button type="submit" className="primary submit-from-question">
                      Review &amp; submit →
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="primary"
                      onClick={() => {
                        if (activeIndex === rows.length - 1) {
                          setRows([
                            ...rows,
                            {
                              question: String(rows.length + 1),
                              working: "",
                              answer: "",
                            },
                          ]);
                          setActiveIndex(activeIndex + 1);
                        } else setActiveIndex(activeIndex + 1);
                      }}
                    >
                      {activeIndex === rows.length - 1
                        ? "Add next question →"
                        : "Next question →"}
                    </button>
                  )}
                </div>
              </>
            )}
            {mode !== "typed" && (
              <section className="handwritten-upload-box">
                <header>
                  <span>⇧</span>
                  <div><b>Upload handwritten work</b><small>Choose how these pages should be matched for marking.</small></div>
                </header>
                <div className="handwritten-upload-mode">
                  <button type="button" className={handwrittenUploadMode === "whole_paper" ? "active" : ""} onClick={() => {
                    setHandwrittenUploadMode("whole_paper");
                    setHandwrittenAttached(wholePaperFiles.map((file) => file.name).join(", "));
                  }}>
                    Complete paper / pages
                    <small>The tracker matches pages to detected questions.</small>
                  </button>
                  <button type="button" className={handwrittenUploadMode === "question_specific" ? "active" : ""} onClick={() => {
                    setHandwrittenUploadMode("question_specific");
                    setHandwrittenAttached(Object.values(questionSpecificFiles).map((file) => file.name).join(", "));
                  }}>
                    Question-specific
                    <small>Attach a scan directly to one question.</small>
                  </button>
                </div>
                {handwrittenUploadMode === "whole_paper" ? (
                  <>
                  <label className="handwritten-file-picker">
                    <b>Select complete paper or page scans</b>
                    <small>One PDF or several JPG, PNG or WebP pages · up to 40 MB combined · add photos one at a time or several at once, they'll all be kept</small>
                    <input type="file" multiple accept="application/pdf,image/jpeg,image/png,image/webp" onChange={(event) => {
                      const newFiles = Array.from(event.target.files || []);
                      const merged = [...wholePaperFiles, ...newFiles];
                      setWholePaperFiles(merged);
                      setHandwrittenAttached(merged.map((file) => file.name).join(", "));
                      event.currentTarget.value = "";
                    }}/>
                  </label>
                  {!!wholePaperFiles.length && <div className="question-upload-list">{wholePaperFiles.map((file, index) => (
                    <article key={`${file.name}-${index}`}>
                      <span>Page {index + 1}</span>
                      <b>{file.name}</b>
                      <button type="button" onClick={() => {
                        const next = wholePaperFiles.filter((_, i) => i !== index);
                        setWholePaperFiles(next);
                        setHandwrittenAttached(next.map((f) => f.name).join(", "));
                      }}>Remove</button>
                    </article>
                  ))}</div>}
                  </>
                ) : (
                  <div className="question-specific-upload">
                    <label>
                      Attach to question
                      <select value={questionUploadTarget} onChange={(event) => setQuestionUploadTarget(Number(event.target.value))}>
                        {rows.map((row, index) => <option key={`${row.question}-${index}`} value={index}>Question {row.question || index + 1}</option>)}
                      </select>
                    </label>
                    <label className="handwritten-file-picker">
                      <b>Select this question’s handwritten answer</b>
                      <input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        const next = { ...questionSpecificFiles, [questionUploadTarget]: file };
                        setQuestionSpecificFiles(next);
                        setHandwrittenAttached(Object.values(next).map((item) => item.name).join(", "));
                        event.currentTarget.value = "";
                      }}/>
                    </label>
                    {!!Object.keys(questionSpecificFiles).length && <div className="question-upload-list">{Object.entries(questionSpecificFiles).sort(([left],[right])=>Number(left)-Number(right)).map(([indexValue,file]) => {
                      const index = Number(indexValue);
                      return <article key={indexValue}><span>Question {rows[index]?.question || index + 1}</span><b>{file.name}</b><button type="button" onClick={() => {
                        const next = { ...questionSpecificFiles }; delete next[index]; setQuestionSpecificFiles(next); setHandwrittenAttached(Object.values(next).map((item) => item.name).join(", "));
                      }}>Remove</button></article>;
                    })}</div>}
                  </div>
                )}
                <small className="handwritten-refresh-note">After refreshing, select these files again before submitting.</small>
              </section>
            )}
            <div className="answer-submit">
              <div>
                <b>Ready to submit?</b>
                <small>
                  You will review unanswered questions before the final submission.
                </small>
                {message && <p>{message}</p>}
              </div>
              <button className="primary">Review submission →</button>
            </div>
          </form>
        </section>
      </div>
      <button
        type="submit"
        form="student-answer-form"
        className="primary fixed-student-submit"
      >
        Review &amp; submit paper →
      </button>
      {reviewingSubmission && (
        <div
          className="portal-modal submission-review-modal"
          onMouseDown={() => !submitting && setReviewingSubmission(false)}
        >
          <section
            className="submission-review-shell"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <small>FINAL CHECK</small>
                <h2>Review before submitting</h2>
                <p>{assignment.title}</p>
              </div>
              <button
                className="x"
                disabled={submitting}
                onClick={() => setReviewingSubmission(false)}
                aria-label="Close submission review"
              >
                ×
              </button>
            </header>
            <div className="submission-review-summary">
              <article>
                <small>COMPLETION</small>
                <b>{completion}%</b>
              </article>
              <article className="complete">
                <small>ANSWERED</small>
                <b>{answeredIndexes.length}</b>
              </article>
              <article className={unansweredIndexes.length ? "warning" : "complete"}>
                <small>UNANSWERED</small>
                <b>{unansweredIndexes.length}</b>
              </article>
              <article>
                <small>WORK / DRAWINGS</small>
                <b>{supportingWorkCount}</b>
              </article>
            </div>
            {handwrittenAttached && (
              <div className="handwritten-confirmed">
                <b>Handwritten file attached</b>
                <span>{handwrittenAttached}</span>
              </div>
            )}
            {!!unansweredIndexes.length && (
              <div className="unanswered-warning">
                <b>Check unanswered questions</b>
                <p>
                  You may still submit, but these questions currently have no
                  final answer or drawing.
                </p>
              </div>
            )}
            <div className="submission-question-checklist">
              {rows.map((row, index) => {
                const answered = questionAnswered(row, index);
                return (
                  <button
                    type="button"
                    key={`${row.question}-${index}`}
                    className={answered ? "answered" : "unanswered"}
                    onClick={() => {
                      setActiveIndex(index);
                      if (mode === "handwritten") setMode("both");
                      setReviewingSubmission(false);
                    }}
                  >
                    <span>{answered ? "✓" : "!"}</span>
                    <b>Question {row.question || index + 1}</b>
                    <small>{answered ? "Answered" : "Go to question →"}</small>
                  </button>
                );
              })}
            </div>
            <footer>
              <label>
                <input
                  type="checkbox"
                  checked={confirmSubmission}
                  disabled={submitting}
                  onChange={(event) => setConfirmSubmission(event.target.checked)}
                />
                <span>
                  I have reviewed my answers
                  {unansweredIndexes.length
                    ? " and understand that some questions are unanswered."
                    : " and I am ready to submit."}
                </span>
              </label>
              <div>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setReviewingSubmission(false)}
                >
                  Continue working
                </button>
                <button
                  type="button"
                  className="primary"
                  disabled={!confirmSubmission || submitting}
                  onClick={submitFinal}
                >
                  {submitting ? "Submitting…" : "Confirm & submit →"}
                </button>
              </div>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}

function StudentPortal({ switchRole }: { switchRole: () => void }) {
  const [started, setStarted] = useState(false);
  const [studentArea, setStudentArea] = useState<"papers" | "stage7" | "stage89" | "physics">("papers");
  const [activeAssignment, setActiveAssignment] = useState<{
    id: string;
    title: string;
    subject: string;
    syllabus: string;
    paper_mode: "structured" | "multiple_choice";
  } | null>(null);
  const [savedAssignments, setSavedAssignments] = useState<
    Array<{
      id: string;
      title: string;
      subject: string;
      syllabus: string;
      paper_mode: "structured" | "multiple_choice";
      due_date: string | null;
      student_status: StudentPaperStatus;
    }>
  >([]);
  const [publishedResults, setPublishedResults] = useState<
    Array<{
      id: string;
      assignment_id: string;
      title: string;
      total_final: number;
      maximum: number;
      teacher_feedback: string | null;
      published_at: string;
      paper_mode: "structured" | "multiple_choice";
      marks: Array<{
        label: string;
        maximum: number;
        final_mark: number;
        teacher_feedback: string | null;
      }>;
    }>
  >([]);
  useEffect(() => {
    fetch("/api/assignments")
      .then((r) => (r.ok ? r.json() : []))
      .then(setSavedAssignments);
    fetch("/api/submissions")
      .then((r) => (r.ok ? r.json() : []))
      .then(setPublishedResults);
  }, []);
  const latest = savedAssignments[0];
  const cleanNav = (
    <nav className="portal-nav">
      <p>MY LEARNING</p>
      <button className={studentArea === "papers" ? "active" : ""} onClick={() => setStudentArea("papers")}>
        <span>▤</span>Assigned papers
      </button>
      <button className={studentArea === "stage7" ? "active" : ""} onClick={() => setStudentArea("stage7")}>
        <span>7</span>Stage 7 mastery
      </button>
      <button className={studentArea === "stage89" ? "active" : ""} onClick={() => setStudentArea("stage89")}>
        <span>8</span>Stages 8 &amp; 9
      </button>
      <button className={studentArea === "physics" ? "active" : ""} onClick={() => setStudentArea("physics")}>
        <span>⚛</span>Physics practice
      </button>
    </nav>
  );
  if (activeAssignment)
    return (
      <Shell role="Student" onSwitch={switchRole} nav={cleanNav}>
        <AnswerWorkspace
          assignment={activeAssignment}
          back={() => {
            setSavedAssignments((current) =>
              current.map((paper) =>
                paper.id === activeAssignment.id &&
                paper.student_status === "not_started"
                  ? { ...paper, student_status: "in_progress" }
                  : paper,
              ),
            );
            setActiveAssignment(null);
          }}
          submitted={(submissionStatus) => {
            const studentStatus: StudentPaperStatus =
              submissionStatus === "published"
                ? "result_available"
                : "awaiting_review";
            setSavedAssignments((current) =>
              current.map((paper) =>
                paper.id === activeAssignment.id
                  ? { ...paper, student_status: studentStatus }
                  : paper,
              ),
            );
            if (submissionStatus === "published")
              fetch("/api/submissions")
                .then((response) => (response.ok ? response.json() : []))
                .then(setPublishedResults);
          }}
        />
      </Shell>
    );
  if (studentArea === "stage7")
    return (
      <Shell role="Student" onSwitch={switchRole} nav={cleanNav}>
        <Stage7Student back={() => setStudentArea("papers")} />
      </Shell>
    );
  if (studentArea === "stage89")
    return (
      <Shell role="Student" onSwitch={switchRole} nav={cleanNav}>
        <Stage89Student back={() => setStudentArea("papers")} />
      </Shell>
    );
  if (studentArea === "physics")
    return (
      <Shell role="Student" onSwitch={switchRole} nav={cleanNav}>
        <PhysicsStudent back={() => setStudentArea("papers")} />
      </Shell>
    );
  return (
    <Shell role="Student" onSwitch={switchRole} nav={cleanNav}>
      <div className="portal-heading">
        <div>
          <p>CAMBRIDGE STUDY PORTAL</p>
          <h1>My assigned papers</h1>
          <h2>
            Open a question paper and complete it as instructed by your teacher.
          </h2>
        </div>
      </div>
      <div className="student-overview">
        <article>
          <small>ASSIGNED PAPERS</small>
          <b>{savedAssignments.length}</b>
          <span>Your current papers</span>
        </article>
        <article>
          <small>IN PROGRESS</small>
          <b>
            {
              savedAssignments.filter(
                (assignment) => assignment.student_status === "in_progress",
              ).length
            }
          </b>
          <span>Cloud drafts available</span>
        </article>
        <article>
          <small>PUBLISHED RESULTS</small>
          <b>{publishedResults.length}</b>
          <span>Marks and feedback</span>
        </article>
      </div>
      <section className="panel student-table assigned-papers">
        <header>
          <div>
            <h3>
              {savedAssignments.length} paper
              {savedAssignments.length === 1 ? "" : "s"}
            </h3>
            <p>Only papers assigned to your account are shown.</p>
          </div>
        </header>
        {savedAssignments.length === 0 ? (
          <p>No papers have been assigned yet.</p>
        ) : (
          savedAssignments.map((assignment) => {
            const status = assignment.student_status || "not_started";
            const statusDetails: Record<
              StudentPaperStatus,
              { label: string; action: string }
            > = {
              not_started: { label: "Not started", action: "Start paper →" },
              in_progress: { label: "In progress", action: "Resume paper →" },
              submitted: { label: "Submitted", action: "Submitted" },
              awaiting_review: {
                label: "Awaiting teacher review",
                action: "Awaiting review",
              },
              result_available: {
                label: "Result available",
                action: "View result ↓",
              },
            };
            const details = statusDetails[status];
            const canOpen = status === "not_started" || status === "in_progress";
            return (
            <article key={assignment.id}>
              <span>PDF</span>
              <div>
                <b>{assignment.title}</b>
                <small>
                  {assignment.subject} · {assignment.syllabus} · {" "}
                  {assignment.due_date
                    ? `Due ${new Date(assignment.due_date).toLocaleDateString("en-ZA")}`
                    : "No due date"}
                </small>
              </div>
              <em className={`student-paper-status ${status}`}>
                {details.label}
              </em>
              <button
                className={
                  canOpen || status === "result_available"
                    ? "primary"
                    : "paper-locked"
                }
                disabled={status === "submitted" || status === "awaiting_review"}
                onClick={() => {
                  if (status === "result_available") {
                    document
                      .getElementById(`result-${assignment.id}`)
                      ?.scrollIntoView({ behavior: "smooth", block: "center" });
                    return;
                  }
                  if (!canOpen) return;
                  setActiveAssignment({
                    id: assignment.id,
                    title: assignment.title,
                    subject: assignment.subject,
                    syllabus: assignment.syllabus,
                    paper_mode: assignment.paper_mode,
                  });
                }}
              >
                {details.action}
              </button>
            </article>
          );})
        )}
      </section>
      <section className="panel published-results">
        <header>
          <div>
            <h3>Published results</h3>
            <p>Only results approved by your teacher appear here.</p>
          </div>
        </header>
        {!publishedResults.length ? (
          <div className="empty-results">
            <span>✓</span>
            <div>
              <b>No published results yet</b>
              <p>Your marks, feedback and downloadable reports will appear here after a paper is completed.</p>
            </div>
          </div>
        ) : (
          publishedResults.map((result) => (
            <article key={result.id} id={`result-${result.assignment_id}`}>
              <span>
                {result.maximum
                  ? `${Math.round((result.total_final / result.maximum) * 100)}%`
                  : "—"}
              </span>
              <div>
                <b>{result.title}</b>
                <small>
                  {result.total_final} of {result.maximum} marks
                </small>
                {result.teacher_feedback && <p>{result.teacher_feedback}</p>}
                {!!result.marks?.length && (
                  <details className="result-breakdown">
                    <summary>View question feedback</summary>
                    {result.marks.map((mark) => (
                      <div key={mark.label}>
                        <b>Question {mark.label}</b>
                        <span>{mark.final_mark} / {mark.maximum || 0}</span>
                        {mark.teacher_feedback && <p>{mark.teacher_feedback}</p>}
                      </div>
                    ))}
                  </details>
                )}
                <a className="report-download" href={`/api/submissions/${result.id}/report`}>
                  Download progress report PDF
                </a>
              </div>
            </article>
          ))
        )}
      </section>
    </Shell>
  );
  /* Legacy prototype below is intentionally unreachable pending the answer-workspace build. */
  const nav = (
    <nav className="portal-nav">
      <p>MY LEARNING</p>
      <button className="active">
        <span>⌂</span>Overview
      </button>
      <button>
        <span>▤</span>Assignments<i>2</i>
      </button>
      <button>
        <span>◎</span>My results
      </button>
      <button>
        <span>↗</span>Topic progress
      </button>
    </nav>
  );
  return (
    <Shell role="Student" onSwitch={switchRole} nav={nav}>
      {started ? (
        <ExamAttempt back={() => setStarted(false)} />
      ) : (
        <>
          <div className="portal-heading">
            <div>
              <p>MONDAY, 24 AUGUST</p>
              <h1>Welcome back, Naledi</h1>
              <h2>
                {savedAssignments.length
                  ? `You have ${savedAssignments.length} revision assignment${savedAssignments.length === 1 ? "" : "s"} waiting.`
                  : "Your assigned revision papers will appear here."}
              </h2>
            </div>
          </div>
          <div className="student-hero">
            <div>
              <small>
                {latest?.due_date
                  ? `DUE ${new Date(latest.due_date!).toLocaleDateString("en-ZA")}`
                  : "NEW 0580 REVISION PAPER"}
              </small>
              <h2>{latest?.title || "No saved assignment yet"}</h2>
              <p>Cambridge IGCSE Mathematics · 0580</p>
              <div>
                <span>Question paper</span>
                <span>Typed, handwritten or hybrid</span>
              </div>
              {latest && (
                <>
                  <button
                    className="primary"
                    onClick={() => {
                      window.location.href = `/api/assignments/${latest.id}/paper`;
                    }}
                  >
                    Open question paper →
                  </button>
                  <button onClick={() => setStarted(true)}>
                    Start answer workspace
                  </button>
                </>
              )}
            </div>
            <aside>
              <span>58%</span>
              <small>CLASS SUBMITTED</small>
              <b>14 of 24</b>
            </aside>
          </div>
          <div className="teacher-grid student-grid">
            <section className="panel">
              <header>
                <div>
                  <h3>My assignments</h3>
                  <p>What to work on next</p>
                </div>
              </header>
              <article className="student-assignment">
                <span className="purple-file">π</span>
                <div>
                  <b>{latest?.title || "0580 revision assignment"}</b>
                  <small>
                    {latest?.due_date
                      ? `Due ${new Date(latest.due_date!).toLocaleDateString("en-ZA")} · Not started`
                      : "Waiting for teacher assignment"}
                  </small>
                </div>
                <em>4/4 answers</em>
                <button
                  disabled={!latest}
                  onClick={() => {
                    if (latest)
                      window.location.href = `/api/assignments/${latest.id}/paper`;
                  }}
                >
                  Open paper
                </button>
              </article>
              <article className="student-assignment">
                <span className="yellow-file">∑</span>
                <div>
                  <b>Algebra topic review</b>
                  <small>Due 4 Sep · Not started</small>
                </div>
                <em>0/12 answers</em>
                <button>Start</button>
              </article>
            </section>
            <section className="panel">
              <header>
                <div>
                  <h3>Recent result</h3>
                  <p>Your last marked paper</p>
                </div>
              </header>
              <div className="recent-score">
                <span>74%</span>
                <div>
                  <b>0580/22 October/November</b>
                  <small>26 of 35 marks</small>
                  <p>Strongest topic: Number · Review: Algebra</p>
                </div>
              </div>
            </section>
          </div>
        </>
      )}
    </Shell>
  );
}

function ExamAttempt({ back }: { back: () => void }) {
  const [active, setActive] = useState(0),
    [answers, setAnswers] = useState<Record<number, string>>({}),
    [done, setDone] = useState(false),
    [mode, setMode] = useState<"Typed" | "Handwritten" | "Hybrid">("Typed");
  const q = questions[active],
    score = useMemo(
      () =>
        questions.reduce(
          (s, x, i) =>
            s +
            ((answers[i] || "").replace(/\s/g, "").toLowerCase() ===
            x.answer.replace(/\s/g, "").toLowerCase()
              ? x.marks
              : answers[i]
                ? 1
                : 0),
          0,
        ),
      [answers],
    );
  if (done)
    return (
      <div className="student-results">
        <button onClick={back}>← Back to assignments</button>
        <p>PROVISIONAL RESULT</p>
        <h1>{score}/14</h1>
        <h2>Your submission is ready for teacher review.</h2>
        <div>
          <article>
            <b>{Math.round((score / 14) * 100)}%</b>
            <small>Provisional score</small>
          </article>
          <article>
            <b>1</b>
            <small>Method mark flagged</small>
          </article>
          <article>
            <b>3/4</b>
            <small>Questions attempted</small>
          </article>
        </div>
        <section className="panel">
          <h3>What happens next?</h3>
          <p>
            Your teacher can inspect the answers, approve or change proposed
            marks, and send feedback. Confirmed results will update your topic
            progress.
          </p>
        </section>
      </div>
    );
  return (
    <>
      <div className="attempt-head">
        <button onClick={back}>← Assignments</button>
        <div>
          <small>0580/42 · MAY/JUNE REVISION</small>
          <b>Question {q.n}</b>
        </div>
        <span>◷ 00:24:18</span>
      </div>
      <div className="attempt-modes">
        {(["Typed", "Handwritten", "Hybrid"] as const).map((x) => (
          <button
            className={mode === x ? "active" : ""}
            onClick={() => setMode(x)}
            key={x}
          >
            {x}
          </button>
        ))}
      </div>
      <div className="attempt-grid">
        <aside>
          {questions.map((x, i) => (
            <button
              key={x.n}
              className={active === i ? "active" : ""}
              onClick={() => setActive(i)}
            >
              <span>{answers[i] ? "✓" : x.n}</span>
              <div>
                <b>{x.topic}</b>
                <small>{x.marks} marks</small>
              </div>
            </button>
          ))}
        </aside>
        <article>
          <div>
            <span>QUESTION {q.n}</span>
            <b>{q.marks} marks</b>
          </div>
          <h2>{q.text}</h2>
          {mode !== "Typed" && (
            <label className="mini-upload">
              <input type="file" accept="image/*,.pdf" />
              <span>⇧</span>
              <b>Upload handwritten working</b>
              <small>PDF or clear image</small>
            </label>
          )}
          <label className="answer-label">
            {mode === "Handwritten" ? "Optional final answer" : "Your answer"}
            <textarea
              value={answers[active] || ""}
              onChange={(e) =>
                setAnswers({ ...answers, [active]: e.target.value })
              }
              placeholder="Type your answer and essential working…"
            />
          </label>
          <footer>
            <button
              disabled={active === 0}
              onClick={() => setActive(active - 1)}
            >
              ← Previous
            </button>
            <small>Draft saved on this device</small>
            <button
              className="primary"
              onClick={() =>
                active < 3 ? setActive(active + 1) : setDone(true)
              }
            >
              {active < 3 ? "Next question →" : "Submit paper →"}
            </button>
          </footer>
        </article>
      </div>
    </>
  );
}
