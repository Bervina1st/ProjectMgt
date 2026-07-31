import Link from "next/link";
import SiteNav from "../components/SiteNav";

export const metadata = { title: "Sign in — Statuscope" };

export default function SignIn() {
  return (
    <>
      <SiteNav />
      <div className="auth-wrap">
        <div className="auth-card">
          <h1>Welcome back</h1>
          <p className="auth-sub">Sign in to pick up where you left off.</p>

          <label htmlFor="si-email">Work email</label>
          <input id="si-email" type="email" placeholder="you@company.com" autoComplete="off" />

          <label htmlFor="si-pass">Password</label>
          <input id="si-pass" type="password" placeholder="••••••••" autoComplete="off" />

          <Link href="/studio" className="btn btn-primary btn-block btn-lg">Sign in</Link>

          <p className="auth-alt">New here? <Link href="/signup">Create an account</Link></p>
          <p className="auth-note">Preview — sign-in isn&rsquo;t wired to a backend yet (real auth lands in roadmap M1). This opens the live demo.</p>
        </div>
      </div>
    </>
  );
}
