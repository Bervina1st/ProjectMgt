/**
 * Lightweight, self-contained analytics for the prototype.
 * Records events to localStorage + console so CTA clicks (e.g. "Launch live demo")
 * are captured with no third-party script and nothing leaving the browser.
 *
 * To wire a real provider or backend later, forward `entry` at the marked spot
 * (e.g. navigator.sendBeacon("/api/track", JSON.stringify(entry))).
 */

export type AnalyticsEvent = { event: string; props?: Record<string, unknown>; ts: number };

const KEY = "statuscope:analytics";
const MAX = 100;

export function track(event: string, props?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const entry: AnalyticsEvent = { event, props, ts: Date.now() };

  try {
    const raw = window.localStorage.getItem(KEY);
    const list: AnalyticsEvent[] = raw ? JSON.parse(raw) : [];
    list.push(entry);
    while (list.length > MAX) list.shift();
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable — ignore */
  }

  if (typeof console !== "undefined") console.debug("[analytics]", event, props ?? {});

  // --- Wire a real sink here when a backend/provider exists ---
  // navigator.sendBeacon?.("/api/track", JSON.stringify(entry));
}

/** Read captured events (handy for a future in-app dashboard or debugging). */
export function getEvents(): AnalyticsEvent[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as AnalyticsEvent[];
  } catch {
    return [];
  }
}
