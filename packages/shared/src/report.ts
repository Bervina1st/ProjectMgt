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

function addSection(lines: string[], heading: string, items: WorkItem[]): void {
  if (items.length === 0) return;
  lines.push(`## ${heading} (${items.length})`);
  for (const i of items) lines.push(`- ${bullet(i)}`);
  lines.push("");
}
