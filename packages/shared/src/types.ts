import type { ItemStatus, SourceId } from "./schema";

export type Severity = "high" | "medium";

export type RiskFlag = {
  itemId: string;
  itemTitle: string;
  source: SourceId;
  ruleId: "blocked" | "overdue" | "due_soon" | "not_started_soon";
  severity: Severity;
  reason: string;
};

export type Audience = "executive" | "engineering" | "pmo";

export const STATUS_LABELS: Record<ItemStatus, string> = {
  done: "Done",
  in_progress: "In progress",
  blocked: "Blocked",
  not_started: "Not started",
};

/** Brand-ish metadata for each data source. Colors are tuned for a dark UI. */
export const SOURCE_META: Record<SourceId, { label: string; color: string; short: string }> = {
  jira: { label: "Jira", color: "#2563eb", short: "JIRA" },
  azure_devops: { label: "Azure DevOps", color: "#0b74c4", short: "ADO" },
  monday: { label: "Monday.com", color: "#e11d48", short: "MON" },
  github: { label: "GitHub", color: "#57606a", short: "GH" },
  linear: { label: "Linear", color: "#6d5ae0", short: "LIN" },
  asana: { label: "Asana", color: "#df5a4d", short: "ASA" },
  trello: { label: "Trello", color: "#1f7fc4", short: "TRL" },
  manual: { label: "Manual", color: "#6b7280", short: "MAN" },
};

/** Distinct source labels present in a set of items, in first-seen order. */
export function distinctSourceLabels(sources: SourceId[]): string[] {
  const seen = new Set<SourceId>();
  const out: string[] = [];
  for (const s of sources) {
    if (!seen.has(s)) {
      seen.add(s);
      out.push(SOURCE_META[s]?.label ?? "Manual");
    }
  }
  return out;
}
