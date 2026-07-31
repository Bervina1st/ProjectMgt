import type { Project, WorkItem } from "./schema";
import type { Audience, RiskFlag } from "./types";
import { distinctSourceLabels, SOURCE_META } from "./types";
import { Counts, countByStatus, deriveOverall, detectRisks, OVERALL_META } from "./risk";

function itemsByStatus(items: WorkItem[], status: WorkItem["status"]): WorkItem[] {
  return items.filter((i) => i.status === status);
}

function srcLabel(id: WorkItem["source"]): string {
  return SOURCE_META[id]?.label ?? "Manual";
}

function bullet(i: WorkItem): string {
  const bits = [i.title.trim() || "(untitled item)"];
  if (i.owner) bits.push(`_${i.owner}_`);
  if (i.dueDate) bits.push(`due ${i.dueDate}`);
  let line = bits.join(" · ");
  if (i.note) line += ` — ${i.note.trim()}`;
  // Source shown as an inline-code tag so it reads clearly in Markdown.
  return `${line}  \`${srcLabel(i.source)}\``;
}

function cap(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

function titleOf(i: WorkItem): string {
  return i.title.trim() || "(untitled item)";
}

/** A risk line with source tag and the responsible owner (for the PMO view). */
function riskLine(r: RiskFlag, items: WorkItem[]): string {
  const mark = r.severity === "high" ? "🔴" : "🟡";
  const owner = items.find((i) => i.id === r.itemId)?.owner?.trim();
  const ownerTxt = owner ? ` _(owner ${owner})_` : "";
  return `- ${mark} **${r.itemTitle}** \`${srcLabel(r.source)}\` — ${r.reason}${ownerTxt}`;
}

function sourcesLine(items: WorkItem[]): string[] {
  const labels = distinctSourceLabels(items.map((i) => i.source));
  return labels.length ? [labels.join(" · ")] : [];
}

/**
 * Build both audience variants from ONE source of truth so they never disagree
 * (CLAUDE.md invariant: variants derive from one source). Returns Markdown.
 */
export function generateReports(project: Project): Record<Audience, string> {
  const counts = countByStatus(project.items);
  const risks = detectRisks(project.items);
  const overall = deriveOverall(counts, risks);
  const meta = OVERALL_META[overall];

  return {
    executive: buildExecutive(project, counts, risks, meta),
    engineering: buildEngineering(project, counts, risks, meta),
    pmo: buildPmo(project, counts, risks, meta),
  };
}

function buildExecutive(project: Project, counts: Counts, risks: RiskFlag[], meta: { label: string; badge: string }): string {
  const name = project.name.trim() || "Project";
  const period = project.periodLabel.trim();
  const highs = risks.filter((r) => r.severity === "high");
  const sources = sourcesLine(project.items);

  const lines: string[] = [];
  lines.push(`**${name}${period ? ` — ${period}` : ""}**`);
  lines.push("");

  const progress = counts.total > 0 ? `${counts.done}/${counts.total} items complete` : "no items tracked yet";
  let summary = `${meta.badge} **${meta.label}.** ${cap(progress)}.`;
  if (counts.blocked > 0) summary += ` ${counts.blocked} blocked.`;
  lines.push(summary);

  if (sources.length) {
    const list = distinctSourceLabels(project.items.map((i) => i.source));
    lines.push(`_Aggregated from ${list.length} source${list.length === 1 ? "" : "s"}: ${sources[0]}._`);
  }

  if (highs.length > 0) {
    lines.push("");
    lines.push(
      `**Needs attention:** ${highs
        .slice(0, 2)
        .map((r) => `${r.itemTitle} — ${srcLabel(r.source)} (${r.reason.toLowerCase()})`)
        .join("; ")}${highs.length > 2 ? `; +${highs.length - 2} more` : ""}`,
    );
  }

  return lines.join("\n");
}

function buildEngineering(project: Project, counts: Counts, risks: RiskFlag[], meta: { label: string; badge: string }): string {
  const name = project.name.trim() || "Project";
  const period = project.periodLabel.trim();
  const sources = sourcesLine(project.items);
  const lines: string[] = [];

  lines.push(`# ${name} — Status Report`);
  if (period) lines.push(`_${period}_`);
  lines.push("");
  lines.push(
    `**Overall:** ${meta.badge} ${meta.label}  ·  ${counts.done}/${counts.total} done · ${counts.in_progress} in progress · ${counts.blocked} blocked · ${counts.not_started} not started`,
  );
  if (sources.length) lines.push(`**Sources:** ${sources[0]}`);
  lines.push("");

  if (risks.length > 0) {
    lines.push(`## ⚠️ At risk (${risks.length})`);
    for (const r of risks) {
      const mark = r.severity === "high" ? "🔴" : "🟡";
      lines.push(`- ${mark} **${r.itemTitle}** \`${srcLabel(r.source)}\` — ${r.reason}`);
    }
    lines.push("");
  } else {
    lines.push(`## ✅ No risks flagged`);
    lines.push("");
  }

  addSection(lines, "🚧 In progress", itemsByStatus(project.items, "in_progress"));
  addSection(lines, "⛔ Blocked", itemsByStatus(project.items, "blocked"));
  addSection(lines, "🗒️ Not started", itemsByStatus(project.items, "not_started"));
  addSection(lines, "✅ Completed", itemsByStatus(project.items, "done"));

  return lines.join("\n").trimEnd();
}

/**
 * PMO view — for QA, BA and PMs. Leads with what needs immediate attention,
 * then role-specific cues, then the full status breakdown.
 */
function buildPmo(project: Project, counts: Counts, risks: RiskFlag[], meta: { label: string; badge: string }): string {
  const name = project.name.trim() || "Project";
  const period = project.periodLabel.trim();
  const sources = sourcesLine(project.items);

  const highs = risks.filter((r) => r.severity === "high");
  const meds = risks.filter((r) => r.severity === "medium");
  const overdue = risks.filter((r) => r.ruleId === "overdue").length;

  const done = itemsByStatus(project.items, "done");
  const inProgress = itemsByStatus(project.items, "in_progress");
  const notStarted = itemsByStatus(project.items, "not_started");
  const blocked = itemsByStatus(project.items, "blocked");

  const lines: string[] = [];
  lines.push(`# ${name} — PMO Status Update`);
  if (period) lines.push(`_${period}_`);
  lines.push("");
  lines.push(
    `**Overall:** ${meta.badge} ${meta.label}  ·  ${counts.done}/${counts.total} done · ${counts.blocked} blocked · ${risks.length} at risk`,
  );
  if (sources.length) lines.push(`**Sources:** ${sources[0]}`);
  lines.push("");

  // What must be acted on right now.
  lines.push(`## 🚨 Needs attention now (${highs.length})`);
  if (highs.length === 0) lines.push(`- ✅ Nothing critical — no blocked or overdue items.`);
  else for (const r of highs) lines.push(riskLine(r, project.items));
  lines.push("");

  // Keep an eye on these.
  if (meds.length > 0) {
    lines.push(`## ⚠️ Watch list (${meds.length})`);
    for (const r of meds) lines.push(riskLine(r, project.items));
    lines.push("");
  }

  // Role-specific cues for QA / BA / PM.
  lines.push(`## 👥 For the team`);
  lines.push(
    `- **QA:** ${done.length} item${done.length === 1 ? "" : "s"} completed and ready to verify${
      done.length ? ` — ${done.map(titleOf).join(", ")}` : ""
    }.`,
  );
  lines.push(
    `- **BA:** ${notStarted.length} not started — confirm scope/requirements${
      notStarted.length ? ` for ${notStarted.map(titleOf).join(", ")}` : ""
    }.`,
  );
  lines.push(`- **PM:** ${counts.blocked} blocked, ${overdue} overdue — escalate and unblock as needed.`);
  lines.push("");

  // Full status breakdown, most-urgent first.
  addSection(lines, "⛔ Blocked", blocked);
  addSection(lines, "🚧 In progress", inProgress);
  addSection(lines, "🗒️ Not started", notStarted);
  addSection(lines, "✅ Completed", done);

  return lines.join("\n").trimEnd();
}

function addSection(lines: string[], heading: string, items: WorkItem[]): void {
  if (items.length === 0) return;
  lines.push(`## ${heading} (${items.length})`);
  for (const i of items) lines.push(`- ${bullet(i)}`);
  lines.push("");
}
