"use client";
import { SignIn } from "@clerk/nextjs";
import { Logo, NavIcon } from "@/components/Brand";
import { ThemeToggle } from "@/components/ThemeToggle";

// The split sign-in screen: the product in the product's own words on the
// left, Clerk's form on the right. It lived at / until the public front page
// took that address; it is now /sign-in, and the mark leads back to /.
//
// The account note sits under the form rather than at the foot of the dark
// panel: it answers the question a student has at the form ("where do I get
// an account?"), and on a phone the panel no longer pushes the form's
// Continue button below the fold.
export function SignInScreen() {
  return (
    <div className="signin">
      <aside className="signin-brand">
        <div className="signin-head">
          <a href="/" className="signin-home" aria-label="StudyTrack home">
            <Logo />
          </a>
          <ThemeToggle />
        </div>
        <div className="signin-body">
          <h1>Plan, practise and mark Cambridge Mathematics and Physics.</h1>
          <ul className="signin-levels">
            {(
              [
                ["stage7", "Stage 7", "maths"],
                ["stage8", "Stage 8", "maths"],
                ["stage9", "Stage 9", "maths"],
                ["igcse", "IGCSE 0625", "physics"],
                ["as", "AS Level 9702", "physics"],
              ] as const
            ).map(([icon, label, subject]) => (
              <li key={icon} className={subject}>
                <NavIcon name={icon} />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <div className="signin-form">
        <div>
          <SignIn routing="hash" fallbackRedirectUrl="/" />
          <p className="signin-foot">
            Your teacher creates your account. If you do not have one yet, ask them to add you to a class.
          </p>
        </div>
      </div>
    </div>
  );
}
