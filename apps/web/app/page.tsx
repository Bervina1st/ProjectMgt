import Link from "next/link";
import { SOURCE_META, SourceId } from "@pmstatus/shared";
import SiteNav from "./components/SiteNav";
import TrackedLink from "./components/TrackedLink";

const CONNECTORS: { id: SourceId; blurb: string }[] = [
  { id: "jira", blurb: "Issues, sprints, statuses and due dates." },
  { id: "azure_devops", blurb: "Work items, boards and pipeline state." },
  { id: "monday", blurb: "Boards, items and timeline status." },
  { id: "github", blurb: "Issues, PRs and release progress." },
  { id: "linear", blurb: "Issues, cycles and project updates." },
  { id: "asana", blurb: "Tasks, projects and due dates." },
  { id: "trello", blurb: "Cards, lists and board activity." },
];

const VALUES = [
  { title: "One report, not four tabs", desc: "Every tool's work in a single view — no switching between Jira, Azure DevOps and Monday to piece together where things stand." },
  { title: "Risks, not just a list", desc: "Blocked, overdue and slipping items are surfaced automatically, each with the reason behind it — so nothing quietly slips." },
  { title: "You stay in control", desc: "Statuscope drafts the report; you review and edit before a word goes out. It removes the busywork, not the judgment." },
  { title: "Built for the whole team", desc: "The same source of truth, tailored for executives, engineers, and the PMO — always in sync." },
];

const FEATURES = [
  { icon: "🔗", title: "Cross-tool aggregation", desc: "Pull work from every tool into one status view — no more tab-switching to know where things stand." },
  { icon: "🚨", title: "Automatic risk detection", desc: "Blocked, overdue and slipping items are flagged deterministically, each with its reason — never a guess." },
  { icon: "👥", title: "Reports for every audience", desc: "One source of truth, three tailored variants: Executive, Engineering and PMO — always consistent." },
  { icon: "🧭", title: "Who-owns-what accountability", desc: "The PMO view groups risks by owner so you know exactly who to chase, most-critical first." },
  { icon: "✍️", title: "Edit before you send", desc: "Every draft is yours to tweak. You stay in control of what actually goes out." },
  { icon: "📤", title: "Export anywhere", desc: "Copy clean Markdown or download it — drop your report into Slack, email or a wiki." },
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    cadence: "",
    tagline: "For a single project.",
    features: ["1 project", "2 connectors", "Executive & Engineering reports", "Manual copy / export"],
    cta: "Get started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$12",
    cadence: "/mo",
    tagline: "For busy project managers.",
    features: ["Unlimited projects", "All connectors", "PMO report + owner accountability", "Scheduled reports", "Mid-cycle risk alerts"],
    cta: "Start Pro",
    popular: true,
  },
  {
    name: "Team",
    price: "$39",
    cadence: "/mo",
    tagline: "For teams & the PMO.",
    features: ["Everything in Pro", "Team seats & shared reports", "Roles & permissions", "Priority support"],
    cta: "Start Team",
    popular: false,
  },
];

const TESTIMONIALS = [
  { quote: "I used to lose half a Friday stitching together a status update. Now it's ten minutes and it's actually accurate.", name: "Dana", role: "Delivery Lead" },
  { quote: "The PMO view tells me exactly who to chase before standup. That alone paid for it.", name: "Marcus", role: "Head of PMO" },
  { quote: "One report for execs, one for my engineers, from the same data — no more copy, paste, reword.", name: "Priya", role: "Engineering Manager" },
];

const FAQS = [
  { q: "Which tools does Statuscope connect to?", a: "Jira, Azure DevOps, Monday.com, GitHub, Linear, Asana and Trello today, with more on the roadmap. You can also add items manually." },
  { q: "Do I need to install anything?", a: "No — Statuscope runs in your browser. In this preview, the connectors import sample work items so you can see how cross-tool aggregation feels." },
  { q: "How does it decide what's 'at risk'?", a: "Deterministically: items that are blocked, overdue, or due soon are flagged automatically, each with the concrete reason behind it — never an AI guess." },
  { q: "Can I edit the report before it goes out?", a: "Always. Statuscope drafts the report; you review and edit every word before sending. It removes the busywork, not your judgment." },
  { q: "What audiences can I report to?", a: "Three variants from one source of truth: Executive (a crisp summary), Engineering (full detail), and PMO (for QA, BA and PMs, with owner-grouped accountability)." },
  { q: "Is there a free plan?", a: "Yes — Free covers one project and two connectors with Executive and Engineering reports. Upgrade for unlimited projects, all connectors and the PMO view." },
];

export default function Landing() {
  return (
    <>
      <SiteNav />

      {/* ---------- HERO / PRODUCT ---------- */}
      <section id="product" className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">Multi-tool status reporting</span>
            <h1>Every tool&rsquo;s status. One clear report.</h1>
            <p>
              Jira, Azure DevOps, Monday.com, GitHub and more — pulled into one audience-ready status report,
              with the risks that matter flagged automatically and traced to who owns them.
            </p>
            <div className="hero-cta">
              <TrackedLink href="/signup" event="cta_get_started" props={{ location: "hero" }} className="btn btn-primary btn-lg">Get started free →</TrackedLink>
              <TrackedLink href="/studio" event="launch_demo" props={{ location: "hero" }} className="btn btn-ghost btn-lg">Launch live demo</TrackedLink>
            </div>
            <div className="conn-badges">
              {CONNECTORS.map((c) => (
                <span key={c.id} className="src-badge" style={{ color: SOURCE_META[c.id].color }}>{SOURCE_META[c.id].label}</span>
              ))}
            </div>
          </div>
          <div className="hero-illustration">
            <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Work from many tools flowing into one status report">
              <path d="M56 44 C 140 44 150 110 220 110" stroke="#c7d3ec" strokeWidth="3" strokeLinecap="round" />
              <path d="M56 110 C 128 110 160 110 220 110" stroke="#c7d3ec" strokeWidth="3" strokeLinecap="round" />
              <path d="M56 176 C 140 176 150 110 220 110" stroke="#c7d3ec" strokeWidth="3" strokeLinecap="round" />
              <circle cx="40" cy="44" r="18" fill="#2563eb" />
              <circle cx="40" cy="110" r="18" fill="#0b74c4" />
              <circle cx="40" cy="176" r="18" fill="#e11d48" />
              <rect x="220" y="28" width="100" height="164" rx="16" fill="#ffffff" stroke="#dbe2ef" strokeWidth="2.5" />
              <rect x="238" y="50" width="54" height="9" rx="4.5" fill="#4f6bed" />
              <rect x="238" y="72" width="66" height="6" rx="3" fill="#e6ebf5" />
              <rect x="238" y="86" width="58" height="6" rx="3" fill="#e6ebf5" />
              <rect x="238" y="110" width="64" height="6" rx="3" fill="#fca5a5" />
              <rect x="238" y="124" width="48" height="6" rx="3" fill="#fcd34d" />
              <rect x="238" y="148" width="66" height="6" rx="3" fill="#e6ebf5" />
              <rect x="238" y="162" width="52" height="6" rx="3" fill="#e6ebf5" />
              <circle cx="305" cy="40" r="12" fill="#16a34a" />
              <path d="M300 40l3.5 3.5 6-7" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </section>

      {/* ---------- WHY ---------- */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Why Statuscope</span>
            <h2>Stop chasing four tools to write one update.</h2>
          </div>
          <div className="value-grid">
            {VALUES.map((v) => (
              <div key={v.title} className="value-card">
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CONNECTORS ---------- */}
      <section id="connectors" className="section alt">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Connectors</span>
            <h2>Connect the tools you already use.</h2>
            <p className="section-sub">Bring work in from all of them — Statuscope normalizes it into one shared view.</p>
          </div>
          <div className="conn-grid">
            {CONNECTORS.map((c) => (
              <div key={c.id} className="conn-card">
                <span className="conn-dot" style={{ background: SOURCE_META[c.id].color, boxShadow: `0 0 0 4px ${SOURCE_META[c.id].color}22` }} />
                <div>
                  <strong>{SOURCE_META[c.id].label}</strong>
                  <span>{c.blurb}</span>
                </div>
              </div>
            ))}
            <div className="conn-card muted">
              <span className="conn-dot" style={{ background: "#c7d0de" }} />
              <div><strong>More coming</strong><span>Slack, Google Calendar & others on the roadmap.</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FEATURES ---------- */}
      <section id="features" className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Features</span>
            <h2>Everything you need to report status — nothing you don&rsquo;t.</h2>
          </div>
          <div className="feat-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feat-card">
                <span className="feat-icon" aria-hidden="true">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- TESTIMONIALS / REVIEWS ---------- */}
      <section id="reviews" className="section alt">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Loved by delivery teams</span>
            <h2>Less status busywork, more actual delivery.</h2>
            <p className="section-sub">Sample testimonials — swap in your own before launch.</p>
          </div>
          <div className="testi-grid">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="testi-card">
                <blockquote className="quote">{t.quote}</blockquote>
                <figcaption className="testi-author">
                  <span className="testi-avatar" aria-hidden="true">{t.name.charAt(0)}</span>
                  <span className="testi-who"><strong>{t.name}</strong><span>{t.role}</span></span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- PRICING ---------- */}
      <section id="pricing" className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Pricing</span>
            <h2>Simple pricing that scales with you.</h2>
            <p className="section-sub">Start free, upgrade when you need more projects, connectors and seats.</p>
          </div>
          <div className="price-grid">
            {PLANS.map((p) => (
              <div key={p.name} className={`price-card ${p.popular ? "popular" : ""}`}>
                {p.popular && <span className="pill-popular">Most popular</span>}
                <h3>{p.name}</h3>
                <div className="price"><span className="amount">{p.price}</span><span className="cadence">{p.cadence}</span></div>
                <p className="price-tag">{p.tagline}</p>
                <ul>
                  {p.features.map((f) => <li key={f}>{f}</li>)}
                </ul>
                <Link href="/signup" className={`btn btn-block ${p.popular ? "btn-primary" : "btn-ghost"}`}>{p.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section id="faq" className="section alt">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">FAQ</span>
            <h2>Questions, answered.</h2>
          </div>
          <div className="faq-list">
            {FAQS.map((f) => (
              <details key={f.q} className="faq-item">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA BAND ---------- */}
      <section className="cta-band">
        <div className="container cta-inner">
          <h2>Ready to ditch the status scramble?</h2>
          <p>Turn scattered work into a report you&rsquo;re proud to send — in minutes.</p>
          <div className="hero-cta">
            <TrackedLink href="/signup" event="cta_get_started" props={{ location: "cta_band" }} className="btn btn-primary btn-lg">Get started free →</TrackedLink>
            <TrackedLink href="/studio" event="launch_demo" props={{ location: "cta_band" }} className="btn btn-ghost btn-lg">Try the demo</TrackedLink>
          </div>
        </div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <strong>Statuscope</strong>
            <span>One lens on every tool.</span>
          </div>
          <div className="footer-links">
            <a href="/#product">Product</a>
            <a href="/#connectors">Connectors</a>
            <a href="/#features">Features</a>
            <a href="/#pricing">Pricing</a>
            <Link href="/studio">Demo</Link>
          </div>
        </div>
        <div className="container footer-credit">Designed &amp; developed by <strong>Christina Bervin</strong></div>
      </footer>
    </>
  );
}
