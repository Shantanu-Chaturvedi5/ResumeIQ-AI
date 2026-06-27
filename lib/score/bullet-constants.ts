/**
 * Shared constants for bullet / verb analysis. Imported by the ATS scorer,
 * suggestions engine, and the rule-based rewriter so they all agree on
 * what counts as a "weak" or "strong" action verb.
 */

export const ACTION_VERBS = new Set([
  "achieved", "architected", "authored", "automated", "boosted", "built",
  "collaborated", "conceived", "conducted", "created", "cut", "decreased",
  "delivered", "deployed", "designed", "developed", "directed", "drove",
  "engineered", "enhanced", "established", "executed", "expanded", "generated",
  "grew", "implemented", "improved", "increased", "initiated", "introduced",
  "launched", "led", "leveraged", "managed", "mentored", "migrated",
  "modernized", "negotiated", "optimized", "orchestrated", "organized",
  "originated", "oversaw", "owned", "partnered", "pioneered", "planned",
  "produced", "programmed", "proposed", "published", "rebuilt", "reduced",
  "refactored", "released", "researched", "resolved", "restructured",
  "revamped", "scaled", "secured", "shipped", "simplified", "spearheaded",
  "streamlined", "strengthened", "supervised", "supported", "trained",
  "transformed", "translated",
]);

export const WEAK_VERBS = new Set([
  "worked", "helped", "did", "made", "responsible", "handled", "involved",
  "assisted", "participated", "tasked", "duties", "various",
]);

/**
 * Strong verbs surfaced to the user as suggestions / rewriter candidates.
 * Casing is title-case because they appear in suggestion examples.
 */
export const STRONG_VERBS_TITLECASE = [
  "Architected", "Automated", "Built", "Delivered", "Deployed", "Designed",
  "Engineered", "Implemented", "Launched", "Led", "Optimized", "Owned",
  "Pioneered", "Reduced", "Scaled", "Shipped", "Streamlined", "Transformed",
] as const;

/**
 * Maps weak verbs → context-appropriate replacements the rewriter will pick
 * based on the surrounding bullet's first content word. The fallback is
 * "Delivered" when no context is available.
 */
export const WEAK_TO_STRONG: Record<string, string> = {
  worked: "Delivered",
  helped: "Supported",
  did: "Executed",
  made: "Built",
  responsible: "Owned",
  handled: "Managed",
  involved: "Contributed to",
  assisted: "Supported",
  participated: "Contributed to",
  tasked: "Delivered",
  duties: "Owned",
  various: "Delivered",
};

/**
 * Heuristic: a bullet "has a number" if it contains any digit followed by
 * either a percent, a unit (x, ms, s, sec), or a common impact noun. Used
 * by the scorer, the suggestions engine, and the rewriter.
 */
export const BULLET_HAS_NUMBER =
  /\d+(\.\d+)?(%|x|\+|\b|\busers|\bcustomers|\brequests|\bms|\bs|\bsec)/i;

/**
 * First word of a bullet, lowercased and stripped of punctuation, suitable
 * for verb-set lookups.
 */
export function bulletFirstWord(bullet: string): string {
  return bullet.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^\w]/g, "") ?? "";
}
