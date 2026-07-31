"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Audience,
  countByStatus,
  deriveOverall,
  detectRisks,
  distinctSourceLabels,
  generateReports,
  ItemStatus,
  OVERALL_META,
  Project,
  projectSchema,
  SOURCE_META,
  SourceId,
  STATUS_LABELS,
  WorkItem,
} from "@pmstatus/shared";

const STORAGE_KEY = "pmstatus:web:v2";

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

function newItem(): WorkItem {
  return { id: uid(), title: "", status: "in_progress", source: "manual", owner: "", dueDate: "", note: "" };
}

const SEED: Project = {
  name: "Payments Revamp",
  periodLabel: "Week of Jul 27, 2026",
  items: [
    { id: uid(), title: "Checkout API v2", status: "in_progress", source: "jira", owner: "Dana", dueDate: "2026-08-03", note: "" },
    { id: uid(), title: "Migrate legacy tokens", status: "blocked", source: "azure_devops", owner: "Priya", dueDate: "2026-07-29", note: "waiting on security review" },
    { id: uid(), title: "Fraud rules refresh", status: "done", source: "monday", owner: "Sam", dueDate: "2026-07-25", note: "" },
    { id: uid(), title: "Load testing", status: "not_started", source: "github", owner: "Lee", dueDate: "2026-08-01", note: "" },
  ],
};

const STATUS_OPTIONS: ItemStatus[] = ["not_started", "in_progress", "blocked", "done"];
const SOURCE_OPTIONS: SourceId[] = ["jira", "azure_devops", "monday", "github", "linear", "asana", "trello", "manual"];

// Tools you can "connect" (everything except the manual catch-all).
const CONNECTABLE: SourceId[] = ["jira", "azure_devops", "monday", "github", "linear", "asana", "trello"];

type SampleItem = { title: string; status: ItemStatus; owner?: string; due?: string; note?: string };

// Demo data pulled in when a connector is clicked — stands in for a real API sync.
const SAMPLE_ITEMS: Record<SourceId, SampleItem[]> = {
  jira: [
    { title: "Checkout API v2", status: "in_progress", owner: "Dana", due: "2026-08-03" },
    { title: "Refund webhook retries", status: "in_progress", owner: "Dana", due: "2026-08-05" },
  ],
  azure_devops: [
    { title: "Migrate legacy tokens", status: "blocked", owner: "Priya", due: "2026-07-29", note: "waiting on security review" },
    { title: "Release pipeline hardening", status: "in_progress", owner: "Omar", due: "2026-08-07" },
  ],
  monday: [
    { title: "Fraud rules refresh", status: "done", owner: "Sam", due: "2026-07-25" },
    { title: "Vendor risk review", status: "not_started", owner: "Sam", due: "2026-08-10" },
  ],
  github: [
    { title: "Load testing", status: "not_started", owner: "Lee", due: "2026-08-01" },
    { title: "SDK v3 release", status: "in_progress", owner: "Lee", due: "2026-08-06" },
  ],
  linear: [
    { title: "Onboarding redesign", status: "in_progress", owner: "Mia", due: "2026-08-04" },
    { title: "Bug triage sweep", status: "not_started", owner: "Mia" },
  ],
  asana: [{ title: "Q3 site refresh", status: "in_progress", owner: "Jules", due: "2026-08-12" }],
  trello: [{ title: "Support macros cleanup", status: "not_started", owner: "Kai" }],
  manual: [],
};

export default function Home() {
  const [project, setProject] = useState<Project>(SEED);
  const [audience, setAudience] = useState<Audience>("executive");
  const [reports, setReports] = useState<Record<Audience, string> | null>(null);
  const [copied, setCopied] = useState(false);

  // Load any saved draft (validated with the shared Zod schema — not a database, just localStorage).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = projectSchema.safeParse(JSON.parse(raw));
      if (parsed.success) setProject(parsed.data);
    } catch {
      /* ignore corrupt drafts */
    }
  }, []);

  // Autosave draft.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } catch {
      /* ignore */
    }
  }, [project]);

  const counts = useMemo(() => countByStatus(project.items), [project.items]);
  const risks = useMemo(() => detectRisks(project.items), [project.items]);
  const overall = useMemo(() => deriveOverall(counts, risks), [counts, risks]);
  const overallMeta = OVERALL_META[overall];
  const pct = counts.total > 0 ? Math.round((counts.done / counts.total) * 100) : 0;

  // Which tools feed this report, with counts — the "connected sources" strip.
  const sourcesInUse = useMemo(() => {
    const order = distinctSourceLabels(project.items.map((i) => i.source));
    const byLabel = new Map<string, { id: SourceId; count: number }>();
    for (const i of project.items) {
      const label = SOURCE_META[i.source].label;
      const cur = byLabel.get(label);
      if (cur) cur.count += 1;
      else byLabel.set(label, { id: i.source, count: 1 });
    }
    return order.map((label) => ({ label, ...byLabel.get(label)! }));
  }, [project.items]);

  // A tool is "connected" if any item currently comes from it.
  const connectedSet = useMemo(() => new Set<SourceId>(project.items.map((i) => i.source)), [project.items]);

  function updateItem(id: string, patch: Partial<WorkItem>) {
    setProject((p) => ({ ...p, items: p.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) }));
  }
  function removeItem(id: string) {
    setProject((p) => ({ ...p, items: p.items.filter((i) => i.id !== id) }));
  }
  function addItem() {
    setProject((p) => ({ ...p, items: [...p.items, newItem()] }));
  }

  function connectSource(source: SourceId) {
    const imported: WorkItem[] = (SAMPLE_ITEMS[source] ?? []).map((s) => ({
      id: uid(),
      title: s.title,
      status: s.status,
      source,
      owner: s.owner ?? "",
      dueDate: s.due ?? "",
      note: s.note ?? "",
    }));
    setProject((p) => ({ ...p, items: [...p.items, ...imported] }));
    setReports(null);
  }

  function disconnectSource(source: SourceId) {
    setProject((p) => ({ ...p, items: p.items.filter((i) => i.source !== source) }));
    setReports(null);
  }

  function generate() {
    setReports(generateReports(project));
    setCopied(false);
  }

  function resetAll() {
    setProject({ name: "", periodLabel: "", items: [newItem()] });
    setReports(null);
  }

  const current = reports?.[audience] ?? "";

  async function copyReport() {
    if (!current) return;
    try {
      await navigator.clipboard.writeText(current);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  function downloadReport() {
    if (!current) return;
    const slug = (project.name || "status-report").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const blob = new Blob([current], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}-${audience}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="wrap">
      <header className="app">
        <div className="brand">
          <span className="logo">
            <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <defs>
                <linearGradient id="logoG" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#4f6bed" />
                  <stop offset="1" stopColor="#7c5cff" />
                </linearGradient>
              </defs>
              <rect x="1" y="1" width="44" height="44" rx="12" fill="url(#logoG)" />
              <circle cx="23" cy="23" r="11" fill="none" stroke="#fff" strokeWidth="2.4" opacity="0.9" />
              <circle cx="23" cy="23" r="4.4" fill="#fff" />
              <path d="M23 6v4M23 36v4M6 23h4M36 23h4" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity="0.75" />
            </svg>
          </span>
          <div>
            <h1>Statuscope</h1>
            <p>Pull work from Jira, Azure DevOps, Monday.com &amp; more into one clear, audience-ready status report — with risks flagged automatically.</p>
          </div>
        </div>
        <div className="hero-art-wrap">
          <svg className="hero-art" viewBox="0 0 260 160" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Work from many tools flowing into one status report">
            <path d="M42 30 C 100 30 112 80 168 80" stroke="#c7d3ec" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M42 80 C 92 80 118 80 168 80" stroke="#c7d3ec" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M42 130 C 100 130 112 80 168 80" stroke="#c7d3ec" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="28" cy="30" r="14" fill="#2563eb" />
            <circle cx="28" cy="80" r="14" fill="#0b74c4" />
            <circle cx="28" cy="130" r="14" fill="#e11d48" />
            <rect x="168" y="20" width="82" height="120" rx="12" fill="#ffffff" stroke="#dbe2ef" strokeWidth="2" />
            <rect x="181" y="36" width="42" height="7" rx="3.5" fill="#4f6bed" />
            <rect x="181" y="54" width="56" height="5" rx="2.5" fill="#e6ebf5" />
            <rect x="181" y="66" width="48" height="5" rx="2.5" fill="#e6ebf5" />
            <rect x="181" y="86" width="52" height="5" rx="2.5" fill="#fca5a5" />
            <rect x="181" y="98" width="40" height="5" rx="2.5" fill="#fcd34d" />
            <rect x="181" y="116" width="56" height="5" rx="2.5" fill="#e6ebf5" />
            <circle cx="238" cy="30" r="10" fill="#16a34a" />
            <path d="M233.5 30l3 3 5-6" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </header>

      {/* Connected sources + quick connectors */}
      <div className="sources-card">
        <div className="sources-row">
          <span className="lead">Pulling from</span>
          {sourcesInUse.length === 0 && <span className="hint" style={{ margin: 0 }}>nothing yet — connect a tool below</span>}
          {sourcesInUse.map((s) => (
            <span key={s.label} className="src-badge" style={{ color: SOURCE_META[s.id].color }}>
              {s.label}<span className="src-count">×{s.count}</span>
            </span>
          ))}
        </div>
        <div className="connect-row">
          {CONNECTABLE.map((src) => {
            const on = connectedSet.has(src);
            const meta = SOURCE_META[src];
            return (
              <button
                key={src}
                className={`connect-btn ${on ? "on" : ""}`}
                style={on ? { borderColor: meta.color, background: `${meta.color}22` } : undefined}
                aria-pressed={on}
                title={on ? `Disconnect ${meta.label}` : `Connect ${meta.label} (imports sample items)`}
                onClick={() => (on ? disconnectSource(src) : connectSource(src))}
              >
                <span className="dot" style={{ background: meta.color, boxShadow: `0 0 0 3px ${meta.color}33` }} />
                {on ? `✓ ${meta.label}` : `Connect ${meta.label}`}
              </button>
            );
          })}
        </div>
        <div className="hint" style={{ marginTop: 10 }}>
          Demo connectors — clicking imports sample work items so you can see cross-tool aggregation live. Real OAuth lands in roadmap M2.
        </div>
      </div>

      <div className="grid">
        {/* ---------- LEFT: inputs ---------- */}
        <section className="panel">
          <h2>Project</h2>
          <label htmlFor="pname">Project name</label>
          <input id="pname" type="text" value={project.name} placeholder="e.g. Payments Revamp"
            onChange={(e) => setProject({ ...project, name: e.target.value })} />

          <label htmlFor="pperiod">Reporting period</label>
          <input id="pperiod" type="text" value={project.periodLabel} placeholder="e.g. Week of Jul 27, 2026"
            onChange={(e) => setProject({ ...project, periodLabel: e.target.value })} />

          <div className="spacer" />
          <div className="overall-row">
            <div className="badge">{overallMeta.badge} Overall: {overallMeta.label}</div>
            <div className="pct">{pct}% complete</div>
          </div>
          <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <span style={{ width: `${pct}%` }} />
          </div>
          <div className="counts">
            <span className="chip">{counts.done} done</span>
            <span className="chip">{counts.in_progress} in progress</span>
            <span className="chip">{counts.blocked} blocked</span>
            <span className="chip">{counts.not_started} not started</span>
            <span className="chip">{risks.length} at risk</span>
          </div>

          <h2 style={{ marginTop: 22 }}>Work items</h2>
          {project.items.map((item) => (
            <div className="item" key={item.id}>
              <div className="item-head">
                <span className="src-badge" style={{ color: SOURCE_META[item.source].color }}>
                  {SOURCE_META[item.source].label}
                </span>
                <span className={`status-pill s-${item.status}`}>{STATUS_LABELS[item.status]}</span>
                <button className="danger" aria-label="Remove item" onClick={() => removeItem(item.id)}>Remove</button>
              </div>

              <label>Title</label>
              <input type="text" value={item.title} placeholder="What is it?"
                onChange={(e) => updateItem(item.id, { title: e.target.value })} />

              <div className="meta3">
                <div>
                  <label>Source</label>
                  <select value={item.source} onChange={(e) => updateItem(item.id, { source: e.target.value as SourceId })}>
                    {SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{SOURCE_META[s].label}</option>)}
                  </select>
                </div>
                <div>
                  <label>Status</label>
                  <select value={item.status} onChange={(e) => updateItem(item.id, { status: e.target.value as ItemStatus })}>
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
                <div>
                  <label>Owner</label>
                  <input type="text" value={item.owner ?? ""} placeholder="Optional"
                    onChange={(e) => updateItem(item.id, { owner: e.target.value })} />
                </div>
              </div>

              <div className="meta2">
                <div>
                  <label>Due date</label>
                  <input type="date" value={item.dueDate ?? ""}
                    onChange={(e) => updateItem(item.id, { dueDate: e.target.value })} />
                </div>
                <div>
                  <label>Note (optional)</label>
                  <input type="text" value={item.note ?? ""} placeholder="e.g. waiting on security review"
                    onChange={(e) => updateItem(item.id, { note: e.target.value })} />
                </div>
              </div>
            </div>
          ))}

          <div className="toolbar">
            <button className="ghost" onClick={addItem}>+ Add item</button>
            <button className="ghost" onClick={resetAll}>Reset</button>
          </div>
        </section>

        {/* ---------- RIGHT: output ---------- */}
        <section className="panel">
          <h2>Report</h2>

          {risks.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>Detected risks (with source &amp; reason):</div>
              {risks.map((r, idx) => (
                <div className="riskline" key={idx}>
                  <span className={r.severity === "high" ? "sev-high" : "sev-medium"}>
                    {r.severity === "high" ? "🔴" : "🟡"} {r.itemTitle}
                  </span>{" "}
                  <span className="src-badge sm" style={{ color: SOURCE_META[r.source].color }}>{SOURCE_META[r.source].label}</span>{" "}
                  — {r.reason}
                </div>
              ))}
            </div>
          )}

          <button className="primary" onClick={generate}>✨ Generate report</button>

          {reports && (
            <>
              <div className="tabs" style={{ marginTop: 16 }}>
                <button className={`tab ${audience === "executive" ? "active" : ""}`} onClick={() => setAudience("executive")}>Executive</button>
                <button className={`tab ${audience === "engineering" ? "active" : ""}`} onClick={() => setAudience("engineering")}>Engineering</button>
                <button className={`tab ${audience === "pmo" ? "active" : ""}`} onClick={() => setAudience("pmo")} title="For QA, BA & PMs">PMO</button>
              </div>

              <textarea
                className="report"
                value={current}
                onChange={(e) => setReports({ ...reports, [audience]: e.target.value })}
                spellCheck={false}
              />
              <div className="hint">Edit freely before sending. Switch tabs for the other audience. &ldquo;Generate report&rdquo; rebuilds both from your items (and discards edits).</div>

              <div className="toolbar">
                <button onClick={copyReport}>Copy Markdown</button>
                {copied && <span className="copied">Copied ✓</span>}
                <button onClick={downloadReport}>Download .md</button>
              </div>
            </>
          )}

          {!reports && (
            <div className="empty">
              <svg className="empty-art" viewBox="0 0 130 104" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect x="33" y="12" width="64" height="82" rx="10" fill="#ffffff" stroke="#dbe2ef" strokeWidth="2" />
                <rect x="45" y="28" width="32" height="6" rx="3" fill="#4f6bed" />
                <rect x="45" y="44" width="40" height="4.5" rx="2.25" fill="#e6ebf5" />
                <rect x="45" y="55" width="34" height="4.5" rx="2.25" fill="#e6ebf5" />
                <rect x="45" y="70" width="30" height="4.5" rx="2.25" fill="#fca5a5" />
                <path d="M100 20l2.2 6.4 6.4 2.2-6.4 2.2L100 37.2l-2.2-6.4L91.4 28.6l6.4-2.2z" fill="#f5b301" />
              </svg>
              <div>Fill in your items on the left, then hit &ldquo;✨ Generate report.&rdquo;</div>
            </div>
          )}
        </section>
      </div>

      <footer className="credit">
        Designed &amp; developed by <strong>Christina Bervin</strong>
      </footer>
    </div>
  );
}
