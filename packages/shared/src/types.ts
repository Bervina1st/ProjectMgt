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

export type Audience = "executive" | "engineering";

export const STATUS_LABELS: Record<ItemStatus, string> = {
  done: "Done",
  in_progress: "In progress",
  blocked: "Blocked",
  not_started: "Not started",
};

/** Brand-ish metadata for each data source. Colors are tuned for a dark UI. */
export const SOURCE_META: Record<SourceId, { label: string; color: string; short: string }> = {
  jira: { label: "Jira", color: "#4c9aff", short: "JIRA" },
  azure_devops: { label: "Azure DevOps", color: "#3b9be8", short: "ADO" },
  monday: { label: "Monday.com", color: "#ff5a7e", short: "MON" },
  github: { label: "GitHub", color: "#b6bfc9", short: "GH" },
  linear: { label: "Linear", color: "#8b7bff", short: "LIN" },
  asana: { label: "Asana", color: "#f4796b", short: "ASA" },
  trello: { label: "Trello", color: "#4ba3e3", short: "TRL" },
  manual: { label: "Manual", color: "#9aa6c4", short: "MAN" },
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
