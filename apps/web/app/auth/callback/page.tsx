"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SiteNav from "../../components/SiteNav";
import { getSupabase } from "../../lib/supabase";

export default function AuthCallback() {
  const router = useRouter();
  const [state, setState] = useState<"working" | "error">("working");
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setError("Supabase isn't configured.");
      setState("error");
      return;
    }
    supabase.auth.exchangeCodeForSession(window.location.href).then(({ error }) => {
      if (error) {
        setError(error.message);
        setState("error");
      } else {
        router.replace("/studio");
      }
    });
  }, [router]);

  return (
    <>
      <SiteNav />
      <div className="auth-wrap">
        <div className="auth-card">
          {state === "working" ? (
            <>
              <h1>Signing you in…</h1>
              <p className="auth-sub">Verifying your magic link and taking you to your dashboard.</p>
            </>
          ) : (
            <>
              <h1>Sign-in link didn&rsquo;t work</h1>
              <p className="auth-error">{error}</p>
              <p className="auth-note">Magic links must be opened in the same browser you requested them from, and each link can only be used once. Try requesting a fresh one.</p>
              <p className="auth-alt"><Link href="/signin">Back to sign in</Link></p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
