/**
 * Rule-based bullet rewriter. Given a bullet point and an optional target
 * keyword, returns a strengthened version with a list of changes the
 * rewriter applied. Designed to be useful enough to ship without an LLM.
 */
import {
  BULLET_HAS_NUMBER,
  WEAK_VERBS,
  WEAK_TO_STRONG,
  STRONG_VERBS_TITLECASE,
  bulletFirstWord,
} from "./bullet-constants";

export interface RewriteResult {
  original: string;
  rewritten: string;
  changes: string[];
}

function stripTrailingPeriod(s: string): string {
  return s.replace(/\.+\s*$/g, "");
}

function ensurePeriod(s: string): string {
  return /[.!?]$/.test(s) ? s : `${s}.`;
}

function contextVerb(bullet: string): string {
  // Pick a strong verb that loosely fits the rest of the bullet.
  const lower = bullet.toLowerCase();
  if (/(api|endpoint|service|backend|server)/.test(lower)) return "Engineered";
  if (/(ui|ux|page|component|design|interface)/.test(lower)) return "Designed";
  if (/(test|qa|spec|coverage)/.test(lower)) return "Authored";
  if (/(deploy|release|ship|launch|cutover)/.test(lower)) return "Shipped";
  if (/(team|mentor|hire|onboard)/.test(lower)) return "Led";
  if (/(metric|revenue|cost|growth|latency|performance|throughput)/.test(lower))
    return "Optimized";
  if (/(data|sql|warehouse|etl|pipeline)/.test(lower)) return "Built";
  if (/(scale|throughput|concurrent|users)/.test(lower)) return "Scaled";
  return STRONG_VERBS_TITLECASE[
    Math.floor(Math.random() * STRONG_VERBS_TITLECASE.length)
  ];
}

function swapVerb(bullet: string): { text: string; changed: boolean; newVerb: string } {
  const first = bulletFirstWord(bullet);
  if (!first) return { text: bullet, changed: false, newVerb: first };
  if (!WEAK_VERBS.has(first)) return { text: bullet, changed: false, newVerb: first };
  const replacement = WEAK_TO_STRONG[first] ?? contextVerb(bullet);
  // Preserve capitalisation (first word always capitalised in bullets).
  const capitalised = replacement.charAt(0).toUpperCase() + replacement.slice(1);
  // Replace only the very first word; keep the rest verbatim.
  const rest = bullet.trim().slice(first.length).replace(/^\s+/, "");
  return { text: rest ? `${capitalised} ${rest}` : capitalised, changed: true, newVerb: capitalised };
}

function insertNumberPlaceholder(bullet: string): { text: string; changed: boolean } {
  if (BULLET_HAS_NUMBER.test(bullet)) return { text: bullet, changed: false };
  // Append a metric prompt if missing.
  const stripped = stripTrailingPeriod(bullet);
  return {
    text: `${stripped} [add metric: % / $ / N users / ms]`,
    changed: true,
  };
}

function insertKeyword(bullet: string, keyword: string | undefined): { text: string; changed: boolean } {
  if (!keyword) return { text: bullet, changed: false };
  const k = keyword.trim();
  if (!k) return { text: bullet, changed: false };
  if (bullet.toLowerCase().includes(k.toLowerCase())) {
    return { text: bullet, changed: false };
  }
  // Append the keyword naturally as a parenthetical — keeps the bullet
  // readable and signals the JD match.
  const stripped = stripTrailingPeriod(bullet);
  return { text: `${stripped} (using ${k})`, changed: true };
}

function cleanWhitespace(s: string): string {
  return s.replace(/\s{2,}/g, " ").trim();
}

export interface RewriteOptions {
  /** If the bullet lacks a number, append a `[add metric: ...]` placeholder. */
  ensureMetric?: boolean;
  /** Insert this keyword into the bullet if not already present. */
  targetKeyword?: string;
  /** Force-swap the first word even if it isn't in WEAK_VERBS. */
  forceStrongVerb?: boolean;
}

export function rewriteBullet(
  bullet: string,
  opts: RewriteOptions = {},
): RewriteResult {
  const original = bullet.trim();
  if (!original) {
    return { original, rewritten: original, changes: [] };
  }

  const changes: string[] = [];
  let text = original;

  // 1) Verb swap
  const verbResult = swapVerb(text);
  if (verbResult.changed) {
    text = verbResult.text;
    changes.push(`Replaced weak verb with "${verbResult.newVerb}"`);
  } else if (opts.forceStrongVerb) {
    const replacement = contextVerb(text);
    const capitalised = replacement.charAt(0).toUpperCase() + replacement.slice(1);
    const rest = text.trim().split(/\s+/).slice(1).join(" ");
    text = rest ? `${capitalised} ${rest}` : capitalised;
    changes.push(`Strengthened opening verb to "${capitalised}"`);
  }

  // 2) Metric placeholder
  if (opts.ensureMetric) {
    const metric = insertNumberPlaceholder(text);
    if (metric.changed) {
      text = metric.text;
      changes.push("Added a metric placeholder — replace with a real number");
    }
  }

  // 3) Target keyword
  const kw = insertKeyword(text, opts.targetKeyword);
  if (kw.changed) {
    text = kw.text;
    changes.push(`Inserted target keyword "${opts.targetKeyword}"`);
  }

  text = ensurePeriod(cleanWhitespace(text));

  return { original, rewritten: text, changes };
}

/**
 * Apply the rewriter to every bullet in the parsed resume. Returns an
 * array of { original, rewritten, changes } for the bullets that were
 * actually changed. Useful for the "Rewrite all weak bullets" flow.
 */
export function rewriteAllBullets(
  bullets: string[],
  opts: RewriteOptions = {},
): RewriteResult[] {
  const out: RewriteResult[] = [];
  for (const b of bullets) {
    const r = rewriteBullet(b, opts);
    if (r.changes.length > 0) out.push(r);
  }
  return out;
}
