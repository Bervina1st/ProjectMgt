"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import { getSupabase } from "../lib/supabase";

type Theme = "light" | "dark";

export default function SiteNav() {
  const [email, setEmail] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    // theme was set on <html> by the inline script in layout; reflect it here
    const current = (document.documentElement.getAttribute("data-theme") as Theme) || "light";
    setTheme(current);

    const supabase = getSupabase();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) =>
      setEmail(session?.user?.email ?? null),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("statuscope:theme", next);
    } catch {
      /* ignore */
    }
  }

  async function signOut() {
    await getSupabase()?.auth.signOut();
    setEmail(null);
  }

  return (
    <header className="site-nav">
      <div className="container nav-inner">
        <Link href="/" className="nav-brand">
          <Logo size={30} />
          <span>Statuscope</span>
        </Link>
        <nav className="nav-links">
          <a href="/#product">Product</a>
          <a href="/#connectors">Connectors</a>
          <a href="/#features">Features</a>
          <a href="/#reviews">Reviews</a>
          <a href="/#pricing">Pricing</a>
          <a href="/#faq">FAQ</a>
        </nav>
        <div className="nav-actions">
          <button
            className="btn btn-ghost theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          {email ? (
            <>
              <span className="nav-user" title={email}>{email}</span>
              <button className="btn btn-ghost" onClick={signOut}>Sign out</button>
            </>
          ) : (
            <>
              <Link href="/signin" className="btn btn-ghost">Sign in</Link>
              <Link href="/signup" className="btn btn-primary">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
