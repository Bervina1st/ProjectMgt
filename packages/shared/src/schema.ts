import { z } from "zod";

/**
 * Zod schemas are the single source of truth for the core data shapes.
 * Types are inferred from them (per tech-stack.md: shared Zod + types in packages/shared).
 * When the full product lands, these same schemas validate tRPC I/O and ingested data.
 */

export const itemStatusSchema = z.enum(["done", "in_progress", "blocked", "not_started"]);
export type ItemStatus = z.infer<typeof itemStatusSchema>;

export const workItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: itemStatusSchema,
  owner: z.string().optional(),
  dueDate: z.string().optional(), // ISO yyyy-mm-dd
  note: z.string().optional(),
});
export type WorkItem = z.infer<typeof workItemSchema>;

export const projectSchema = z.object({
  name: z.string(),
  periodLabel: z.string(),
  items: z.array(workItemSchema),
});
export type Project = z.infer<typeof projectSchema>;
