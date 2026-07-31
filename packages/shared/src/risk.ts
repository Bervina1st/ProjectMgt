import type { WorkItem } from "./schema";
import type { RiskFlag } from "./types";

/** Whole-day difference between a due date and today. Negative = in the past. */
export function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const due = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(due.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / 86_400_000);
}

/**
 * Deterministic, explainable risk detection — every flag carries a concrete
 * reason (the "evidence"). This mirrors the product invariant in CLAUDE.md:
 * risk is computed, never guessed by an LLM.
 */
export function detectRisks(items: WorkItem[]): RiskFlag[] {
  const flags: RiskFlag[] = [];

  for (const item of items) {
    const title = item.title.trim() || "(untitled item)";
    const d = daysUntil(item.dueDate);

    if (item.status === "blocked") {
      flags.push({
        itemId: item.id,
        itemTitle: title,
        ruleId: "blocked",
        severity: "high",
        reason: `Marked blocked${item.owner ? ` — owner ${item.owner}` : ""}.`,
      });
    }

    if (item.status !== "done" && d !== null && d < 0) {
      flags.push({
        itemId: item.id,
        itemTitle: title,
        ruleId: "overdue",
        severity: "high",
        reason: `${Math.abs(d)} day${Math.abs(d) === 1 ? "" : "s"} overdue (due ${item.dueDate}) and not complete.`,
      });
    }

    if (item.status !== "done" && d !== null && d >= 0 && d <= 3) {
      flags.push({
        itemId: item.id,
        itemTitle: title,
        ruleId: "due_soon",
        severity: "medium",
        reason: `Due in ${d} day${d === 1 ? "" : "s"} and not complete.`,
      });
    }

    if (item.status === "not_started" && d !== null && d >= 0 && d <= 7) {
      flags.push({
        itemId: item.id,
        itemTitle: title,
        ruleId: "not_started_soon",
        severity: "medium",
        reason: `Not started with due date in ${d} day${d === 1 ? "" : "s"}.`,
      });
    }
  }

  return flags.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "high" ? -1 : 1));
}

export type Counts = {
  total: number;
  done: number;
  in_progress: number;
  blocked: number;
  not_started: number;
};

export function countByStatus(items: WorkItem[]): Counts {
  const c: Counts = { total: items.length, done: 0, in_progress: 0, blocked: 0, not_started: 0 };
  for (const i of items) c[i.status] += 1;
  return c;
}

export type Overall = "on_track" | "at_risk" | "off_track" | "complete";

/** Derive overall health from the data (the user can still edit the text). */
export function deriveOverall(counts: Counts, risks: RiskFlag[]): Overall {
  if (counts.total > 0 && counts.done === counts.total) return "complete";
  const highs = risks.filter((r) => r.severity === "high").length;
  if (highs >= 2 || (highs >= 1 && counts.blocked >= 1 && counts.total <= 4)) return "off_track";
  if (highs >= 1 || risks.length >= 1) return "at_risk";
  return "on_track";
}

export const OVERALL_META: Record<Overall, { label: string; badge: string }> = {
  complete: { label: "Complete", badge: "✅" },
  on_track: { label: "On track", badge: "🟢" },
  at_risk: { label: "At risk", badge: "🟡" },
  off_track: { label: "Off track", badge: "🔴" },
};
