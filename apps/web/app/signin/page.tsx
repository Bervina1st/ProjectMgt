"use client";

import Link from "next/link";
import { useState } from "react";
import SiteNav from "../components/SiteNav";
import { getSupabase } from "../lib/supabase";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error" | "unconfigured">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getSupabase();
    if (!supabase) {
      setStatus("unconfigured");
      return;
    }
    setStatus("sending");
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback`, shouldCreateUser: true },
    });
    if (error) {
      setError(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  return (
    <>
      <SiteNav />
      <div className="auth-wrap">
        <div className="auth-card">
          {status === "sent" ? (
            <>
              <h1>Check your inbox ✉️</h1>
              <p className="auth-sub">
                We sent a magic sign-in link to <strong>{email}</strong>. Open it in this browser and you&rsquo;ll land signed in — no password.
              </p>
              <p className="auth-note">No email after a minute? Check spam, and note Supabase&rsquo;s built-in email is rate-limited (a few per hour) until custom SMTP is set up.</p>
            </>
          ) : (
            <>
              <h1>Welcome back</h1>
              <p className="auth-sub">Enter your email and we&rsquo;ll send you a magic sign-in link.</p>
              <form onSubmit={submit}>
                <label htmlFor="si-email">Work email</label>
                <input id="si-email" type="email" required value={email} placeholder="you@company.com"
                  onChange={(e) => setEmail(e.target.value)} />
                <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={status === "sending"}>
                  {status === "sending" ? "Sending…" : "Send magic link"}
                </button>
              </form>
              {status === "error" && <p className="auth-error">Couldn&rsquo;t send the link: {error}</p>}
              {status === "unconfigured" && <p className="auth-error">Supabase isn&rsquo;t configured — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.</p>}
              <p className="auth-alt">New here? <Link href="/signup">Create an account</Link></p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
