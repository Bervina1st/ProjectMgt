import Link from "next/link";
import SiteNav from "../components/SiteNav";

export const metadata = { title: "Sign up — Statuscope" };

export default function SignUp() {
  return (
    <>
      <SiteNav />
      <div className="auth-wrap">
        <div className="auth-card">
          <h1>Create your account</h1>
          <p className="auth-sub">Start turning scattered work into clear status reports.</p>

          <label htmlFor="su-name">Full name</label>
          <input id="su-name" type="text" placeholder="Christina Bervin" autoComplete="off" />

          <label htmlFor="su-email">Work email</label>
          <input id="su-email" type="email" placeholder="you@company.com" autoComplete="off" />

          <label htmlFor="su-pass">Password</label>
          <input id="su-pass" type="password" placeholder="••••••••" autoComplete="off" />

          <Link href="/studio" className="btn btn-primary btn-block btn-lg">Create account</Link>

          <p className="auth-alt">Already have an account? <Link href="/signin">Sign in</Link></p>
          <p className="auth-note">Preview — sign-up isn&rsquo;t wired to a backend yet (real auth lands in roadmap M1). This opens the live demo.</p>
        </div>
      </div>
    </>
  );
}
