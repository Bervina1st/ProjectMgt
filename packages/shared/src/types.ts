import type { ItemStatus } from "./schema";

export type Severity = "high" | "medium";

export type RiskFlag = {
  itemId: string;
  itemTitle: string;
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
