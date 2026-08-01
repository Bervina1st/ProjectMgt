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

    // Provider errors (expired/invalid link) come back in the URL hash.
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const errDesc = hash.get("error_description") || hash.get("error");
    if (errDesc) {
      setError(errDesc.replace(/\+/g, " "));
      setState("error");
      return;
    }

    let settled = false;
    const go = () => {
      if (!settled) {
        settled = true;
        router.replace("/studio");
      }
    };

    // With detectSessionInUrl, the client parses the hash tokens on init and
    // fires SIGNED_IN. Also check immediately in case it already resolved.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) go();
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) go();
    });

    const timer = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session && !settled) {
        setError("Couldn't establish a session from this link — please request a fresh one.");
        setState("error");
      }
    }, 3000);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(timer);
    };
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
              <p className="auth-note">Each magic link can only be used once and expires after a while. Request a fresh one and click it soon after it arrives.</p>
              <p className="auth-alt"><Link href="/signin">Back to sign in</Link></p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
