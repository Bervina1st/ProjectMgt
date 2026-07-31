"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Audience,
  countByStatus,
  deriveOverall,
  detectRisks,
  generateReports,
  ItemStatus,
  OVERALL_META,
  Project,
  projectSchema,
  STATUS_LABELS,
  WorkItem,
} from "@pmstatus/shared";

const STORAGE_KEY = "pmstatus:web:v1";

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

function newItem(): WorkItem {
  return { id: uid(), title: "", status: "in_progress", owner: "", dueDate: "", note: "" };
}

const SEED: Project = {
  name: "Payments Revamp",
  periodLabel: "Week of Jul 27, 2026",
  items: [
    { id: uid(), title: "Checkout API v2", status: "in_progress", owner: "Dana", dueDate: "2026-08-03", note: "" },
    { id: uid(), title: "Migrate legacy tokens", status: "blocked", owner: "Priya", dueDate: "2026-07-29", note: "waiting on security review" },
    { id: uid(), title: "Fraud rules refresh", status: "done", owner: "Sam", dueDate: "2026-07-25", note: "" },
    { id: uid(), title: "Load testing", status: "not_started", owner: "Lee", dueDate: "2026-08-01", note: "" },
  ],
};

const STATUS_OPTIONS: ItemStatus[] = ["not_started", "in_progress", "blocked", "done"];

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

  function updateItem(id: string, patch: Partial<WorkItem>) {
    setProject((p) => ({ ...p, items: p.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) }));
  }
  function removeItem(id: string) {
    setProject((p) => ({ ...p, items: p.items.filter((i) => i.id !== id) }));
  }
  function addItem() {
    setProject((p) => ({ ...p, items: [...p.items, newItem()] }));
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
        <h1>Status Report Studio</h1>
        <p>Enter your project&apos;s work items → get an audience-ready status report with the risks already flagged. Edit, then copy or download.</p>
      </header>

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
          <div className="badge">{overallMeta.badge} Overall: {overallMeta.label}</div>
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
              <div className="item-top">
                <div>
                  <label>Title</label>
                  <input type="text" value={item.title} placeholder="What is it?"
                    onChange={(e) => updateItem(item.id, { title: e.target.value })} />
                </div>
                <div>
                  <label>Status</label>
                  <select value={item.status} onChange={(e) => updateItem(item.id, { status: e.target.value as ItemStatus })}>
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
                <button className="danger" aria-label="Remove item" onClick={() => removeItem(item.id)}>Remove</button>
              </div>
              <div className="meta">
                <div>
                  <label>Owner</label>
                  <input type="text" value={item.owner ?? ""} placeholder="Optional"
                    onChange={(e) => updateItem(item.id, { owner: e.target.value })} />
                </div>
                <div>
                  <label>Due date</label>
                  <input type="date" value={item.dueDate ?? ""}
                    onChange={(e) => updateItem(item.id, { dueDate: e.target.value })} />
                </div>
              </div>
              <label>Note (optional)</label>
              <input type="text" value={item.note ?? ""} placeholder="e.g. waiting on security review"
                onChange={(e) => updateItem(item.id, { note: e.target.value })} />
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
              <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>Detected risks (with reasons):</div>
              {risks.map((r, idx) => (
                <div className="riskline" key={idx}>
                  <span className={r.severity === "high" ? "sev-high" : "sev-medium"}>
                    {r.severity === "high" ? "🔴" : "🟡"} {r.itemTitle}
                  </span>{" "}
                  — {r.reason}
                </div>
              ))}
            </div>
          )}

          <button className="primary" onClick={generate}>Generate report</button>

          {reports && (
            <>
              <div className="tabs" style={{ marginTop: 16 }}>
                <button className={`tab ${audience === "executive" ? "active" : ""}`} onClick={() => setAudience("executive")}>Executive</button>
                <button className={`tab ${audience === "engineering" ? "active" : ""}`} onClick={() => setAudience("engineering")}>Engineering</button>
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

          {!reports && <div className="hint">Fill in your items on the left, then hit &ldquo;Generate report.&rdquo;</div>}
        </section>
      </div>

      <footer className="credit">
        Designed &amp; developed by <strong>Christina Bervin</strong>
      </footer>
    </div>
  );
}
