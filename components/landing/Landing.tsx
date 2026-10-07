"use client";
import { useEffect } from "react";
import { Logo } from "@/components/Brand";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TryQuestion } from "@/components/landing/TryQuestion";

// The front page at /, for students and their parents, shown to anyone signed
// out. Signed-in users never see it: / renders the portal for them as before.
//
// Everything it says is something the app does today; where a level covers
// less than the others (Stage 7 practice is integers only) it says so.

const MARKING_STEPS = [
  ["Set", "Your teacher uploads a Cambridge paper and assigns it to you."],
  ["Answer", "Type, draw, upload a photo of your working, or write straight onto the paper."],
  ["Check", "StudyTrack suggests marks from the mark scheme. Your teacher checks every one."],
  ["Publish", "Your result appears once your teacher publishes it."],
] as const;

// Each level is a divider in the same colour it has inside the portal, so the
// tab a student follows here is the tab they will find in the sidebar.
const LEVELS = {
  maths: [
    ["stage7", "Stage 7", "Lower Secondary 0862", "Integers practice and a weekly focus from your teacher."],
    ["stage8", "Stage 8", "Lower Secondary 0862", "Practice for every unit, a weekly focus and past-paper questions."],
    ["stage9", "Stage 9", "Lower Secondary 0862", "Practice for every unit, a weekly focus and past-paper questions."],
    ["classroom", "IGCSE and AS", "0580 · 9709", "Papers your teacher sets, marked and returned here."],
  ],
  physics: [
    ["igcse", "IGCSE", "0625", "Practice for 21 units, a syllabus checklist and past exam papers."],
    ["as", "AS Level", "9702", "Practice across 11 topics, revision notes and past exam papers."],
  ],
} as const;

const TABS = [...LEVELS.maths, ...LEVELS.physics];

const QUESTIONS = [
  [
    "How do I get an account?",
    "Your teacher creates it and gives you a username and a temporary password. The first time you sign in, you choose your own password.",
  ],
  [
    "I have forgotten my password.",
    "Ask your teacher to reset it. They will give you a new temporary password, and you choose your own again when you sign in.",
  ],
  [
    "Can I sign up by myself?",
    "No. Accounts are only made by your teacher, so everyone in a class is someone your teacher added.",
  ],
  [
    "Do parents need an account?",
    "No. Ask your child to sign in and show you their results and the My progress screen.",
  ],
] as const;

export function Landing() {
  // Sign-in used to live here with hash routing (/#/factor-one and so on). A
  // link or a tab left mid-flow at the old address is sent on to /sign-in
  // with its step intact, rather than stranded on this page.
  useEffect(() => {
    if (window.location.hash.startsWith("#/")) {
      window.location.replace(`/sign-in${window.location.hash}`);
    }
  }, []);

  return (
    <div className="landing">
      <header className="landing-bar">
        <a href="/" className="landing-home" aria-label="StudyTrack home">
          <Logo />
        </a>
        <nav aria-label="Front page">
          <ThemeToggle />
          <a className="landing-signin" href="/sign-in">Sign in</a>
        </nav>
      </header>

      {/* The page's <main> is the portal-app wrapper in app/page.tsx. */}
      <div className="landing-main">
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <h1>Your Cambridge maths and physics, in one place.</h1>
            <p>
              Answer the work your teacher sets, practise between lessons, and see your results when they are published.
            </p>
            <div className="landing-actions">
              <a className="landing-cta" href="/sign-in">Sign in</a>
              <a className="landing-link" href="#marking">How marking works</a>
            </div>
          </div>
          <TryQuestion />
          {/* The binder's fore edge: one tab per level, stepping down the
              cover, each opening its divider further down the page. */}
          <nav className="landing-tabs" aria-label="Levels">
            {TABS.map(([level, name, code]) => (
              <a key={level} href={`#level-${level}`} data-level={level}>
                <b>{name}</b>
                <small>{code.replace("Lower Secondary ", "")}</small>
              </a>
            ))}
          </nav>
        </section>

        <section className="landing-marking" id="marking" aria-labelledby="marking-title">
          <h2 id="marking-title">How your papers are marked</h2>
          <ol>
            {MARKING_STEPS.map(([verb, text]) => (
              <li key={verb}>
                <h3>{verb}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
          <p className="landing-note">
            Practice sets and multiple-choice papers are different: they are marked the moment you finish, so you can learn from them straight away.
          </p>
        </section>

        <section className="landing-levels" aria-labelledby="levels-title">
          <h2 id="levels-title">What you can do here</h2>
          {(["maths", "physics"] as const).map((subject) => (
            <div key={subject} className="landing-subject">
              <h3>{subject === "maths" ? "Mathematics" : "Physics"}</h3>
              <ul>
                {LEVELS[subject].map(([level, name, code, text]) => (
                  <li key={level} id={`level-${level}`} data-level={level}>
                    <div className="landing-divider-tab">
                      <b>{name}</b>
                      <small>{code}</small>
                    </div>
                    <p>{text}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="landing-parents" aria-labelledby="parents-title">
          <h2 id="parents-title">For parents: ask to see My progress.</h2>
          <p>
            It shows how your child&rsquo;s practice scores have changed over time and how often they needed a hint. It says plainly whether scores are going up, holding steady or have dipped.
          </p>
        </section>

        <section className="landing-faq" aria-labelledby="faq-title">
          <h2 id="faq-title">Accounts</h2>
          <div>
            {QUESTIONS.map(([question, answer]) => (
              <details key={question}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
      </div>

      {/* On a phone the bar has room for the mark and Sign in only, so the
          theme choice moves down here. */}
      <footer className="landing-foot">
        <Logo />
        <ThemeToggle />
        <a href="/sign-in">Sign in</a>
      </footer>
    </div>
  );
}
