/**
 * Suggestions engine. Produces a categorized, severity-ranked list of
 * improvements based on the parsed resume, the ATS result, and (optionally)
 * the JD match result.
 */
import type {
  AnalysisResult,
  JdMatchResult,
  ParsedResume,
  Suggestion,
  AtsResult,
  PriorityInsight,
} from "@/types/resume";
import {
  WEAK_VERBS,
  STRONG_VERBS_TITLECASE,
  BULLET_HAS_NUMBER,
  bulletFirstWord,
} from "./bullet-constants";

const STRONG_VERBS = STRONG_VERBS_TITLECASE;

let _id = 0;
function id(prefix: string) {
  _id += 1;
  return `${prefix}-${_id}`;
}

function bulletImprovements(parsed: ParsedResume): Suggestion[] {
  const out: Suggestion[] = [];
  const allBullets = parsed.experience.flatMap((e) => e.bullets);
  if (allBullets.length === 0) {
    out.push({
      id: id("exp"),
      category: "experience",
      severity: "warning",
      title: "Add experience bullets",
      detail:
        "Most ATS tools and recruiters both score resumes by the depth and quality of bullet points under each role. Aim for 3–5 per role.",
      example: "Engineered a Next.js dashboard that cut reporting time by 40% for 12 internal teams.",
    });
    return out;
  }

  const noNumbers = allBullets.filter((b) => !BULLET_HAS_NUMBER.test(b));
  if (noNumbers.length / allBullets.length > 0.5) {
    out.push({
      id: id("metric"),
      category: "experience",
      severity: "critical",
      title: "Most bullets are missing measurable impact",
      detail: `Roughly ${Math.round((noNumbers.length / allBullets.length) * 100)}% of your bullets have no number, percentage, or concrete result. Recruiters (and ATS weightings) consistently rank quantified bullets higher.`,
      example: "Improved API response time from 1.2s to 180ms by introducing a Redis cache layer.",
    });
  }

  const weak = allBullets.filter((b) => {
    const first = bulletFirstWord(b);
    return first && WEAK_VERBS.has(first);
  });
  if (weak.length > 0) {
    out.push({
      id: id("verbs"),
      category: "verbs",
      severity: "warning",
      title: "Replace weak verbs with action verbs",
      detail: `Found ${weak.length} bullet${weak.length > 1 ? "s" : ""} starting with weak verbs like "worked on" or "helped". Start every bullet with a strong, specific verb.`,
      example: "Worked on payments system → Architected a payments platform handling $2M in monthly volume.",
    });
  }

  // Identify first word of bullets and suggest variety
  const firstWords = allBullets
    .map((b) => b.trim().split(/\s+/)[0]?.toLowerCase() ?? "")
    .filter(Boolean);
  const counts = new Map<string, number>();
  for (const w of firstWords) counts.set(w, (counts.get(w) ?? 0) + 1);
  const repeated = Array.from(counts.entries())
    .filter(([, n]) => n >= 3)
    .sort((a, b) => b[1] - a[1]);
  if (repeated.length > 0) {
    out.push({
      id: id("variety"),
      category: "verbs",
      severity: "info",
      title: "Vary your opening verbs",
      detail: `You start ${repeated[0][1]} bullets with "${repeated[0][0]}". Mix in different verbs to keep the resume dynamic.`,
      example: `Try: ${STRONG_VERBS.filter((v) => v.toLowerCase() !== repeated[0][0]).slice(0, 4).join(", ")}.`,
    });
  }

  return out;
}

function formattingImprovements(parsed: ParsedResume): Suggestion[] {
  const out: Suggestion[] = [];

  if (!parsed.basics.email) {
    out.push({
      id: id("contact"),
      category: "formatting",
      severity: "critical",
      title: "Add a professional email",
      detail:
        "Most ATS pipelines require a valid email. Place it in the contact block at the top of your resume.",
    });
  }
  if (!parsed.basics.phone) {
    out.push({
      id: id("phone"),
      category: "formatting",
      severity: "warning",
      title: "Add a phone number",
      detail:
        "Including a phone number increases recruiter response rate. Use a number you check regularly.",
    });
  }
  if (!parsed.basics.links || parsed.basics.links.length === 0) {
    out.push({
      id: id("links"),
      category: "formatting",
      severity: "warning",
      title: "Add LinkedIn / GitHub links",
      detail:
        "Most recruiters cross-check your LinkedIn and GitHub. Add full URLs (https://…) in your contact block.",
    });
  }
  if (parsed.rawText.length > 18000) {
    out.push({
      id: id("length"),
      category: "formatting",
      severity: "warning",
      title: "Resume is unusually long",
      detail:
        "Resumes over 2 pages often get auto-truncated. Aim for 1 page (early career) or 2 pages (senior).",
    });
  } else if (parsed.rawText.length < 600) {
    out.push({
      id: id("length-short"),
      category: "formatting",
      severity: "info",
      title: "Resume looks light on content",
      detail:
        "Detected less than 600 characters. Consider expanding bullets with more detail and quantified impact.",
    });
  }

  const order = parsed.sectionOrder;
  if (order.length > 0) {
    const hasExp = order.includes("experience");
    const hasEdu = order.includes("education");
    const expIdx = order.indexOf("experience");
    const eduIdx = order.indexOf("education");
    if (hasExp && hasEdu && eduIdx !== -1 && expIdx !== -1 && eduIdx < expIdx) {
      out.push({
        id: id("order"),
        category: "formatting",
        severity: "info",
        title: "Move Education below Experience",
        detail:
          "For mid-level and senior roles, recruiters expect Experience first, then Education.",
      });
    }
  }

  return out;
}

function skillsImprovements(parsed: ParsedResume, jd?: JdMatchResult): Suggestion[] {
  const out: Suggestion[] = [];

  if (parsed.skills.length < 6) {
    out.push({
      id: id("skills-few"),
      category: "skills",
      severity: "warning",
      title: "Add more recognizable skills",
      detail: `Only detected ${parsed.skills.length} skills. Most ATS tools and job filters look for 8–15 relevant technical skills.`,
    });
  }

  if (jd) {
    const missing = jd.missingKeywords.filter((k) => k.length >= 3).slice(0, 12);
    if (missing.length > 0) {
      out.push({
        id: id("jd-missing"),
        category: "keywords",
        severity: jd.matchPercentage < 50 ? "critical" : "warning",
        title: `Add ${missing.length} keywords from the job description`,
        detail: `These terms appear in the JD but not in your resume. If you have experience with any of them, add them to your Skills or relevant bullets.`,
        example: missing.slice(0, 6).map((m) => `+ ${m}`).join("  "),
      });
    }
    if (jd.recommendedSkills.length > 0) {
      out.push({
        id: id("jd-recommended"),
        category: "skills",
        severity: "info",
        title: "Consider adding these recommended skills",
        detail: `If you have hands-on experience with any of these, add them to your skills section. Skip anything you don't actually know.`,
        example: jd.recommendedSkills.slice(0, 6).map((s) => `+ ${s}`).join("  "),
      });
    }
  }

  return out;
}

function scoreBasedSuggestions(ats: AtsResult): Suggestion[] {
  const out: Suggestion[] = [];
  const byLabel = Object.fromEntries(ats.categories.map((c) => [c.label, c]));

  if (byLabel.Experience && byLabel.Experience.score < 65) {
    out.push({
      id: id("exp-score"),
      category: "experience",
      severity: "warning",
      title: "Tighten your experience bullets",
      detail:
        "Use the XYZ formula: \"Accomplished [X], as measured by [Y], by doing [Z].\" This is the single biggest lever for most resumes.",
    });
  }
  if (byLabel.Keywords && byLabel.Keywords.score < 60) {
    out.push({
      id: id("kw-score"),
      category: "keywords",
      severity: "warning",
      title: "Add measurable outcomes",
      detail:
        "Recruiters scan for impact. Each role should have at least 2 bullets with numbers (% growth, $ saved, ms latency, N users).",
    });
  }
  if (byLabel.Formatting && byLabel.Formatting.score < 65) {
    out.push({
      id: id("fmt-score"),
      category: "formatting",
      severity: "warning",
      title: "Standardize your section structure",
      detail:
        "Use a consistent order: Contact → Summary → Experience → Skills → Education → Projects. Avoid graphics, tables, and columns — they confuse parsers.",
    });
  }
  if (byLabel.Skills && byLabel.Skills.score < 60) {
    out.push({
      id: id("sk-score"),
      category: "skills",
      severity: "info",
      title: "Broaden your listed skills",
      detail:
        "Include languages, frameworks, databases, and infrastructure tools. Recruiters and ATS both scan for breadth.",
    });
  }
  return out;
}

export function generateSuggestions(
  parsed: ParsedResume,
  ats: AtsResult,
  jd?: JdMatchResult,
): Suggestion[] {
  const all = [
    ...formattingImprovements(parsed),
    ...bulletImprovements(parsed),
    ...skillsImprovements(parsed, jd),
    ...scoreBasedSuggestions(ats),
  ];
  // Sort by severity, then de-dup by id
  const seen = new Set<string>();
  const severityOrder = { critical: 0, warning: 1, info: 2 } as const;
  return all
    .filter((s) => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    })
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

export function buildAnalysis(
  parsed: ParsedResume,
  ats: AtsResult,
  suggestions: Suggestion[],
  jd?: JdMatchResult,
): AnalysisResult {
  return { parsed, ats, suggestions, jd };
}

let _insightId = 0;
function insightId() {
  _insightId += 1;
  return `insight-${_insightId}`;
}

/**
 * Produce the top 3 highest-leverage "do this first" insights, ranked
 * by expected score uplift. Each one is sized small enough to be
 * skimmable, with a single concrete action the user can take in minutes.
 */
export function priorityInsights(
  parsed: ParsedResume,
  ats: AtsResult,
  jd?: JdMatchResult,
): PriorityInsight[] {
  const insights: PriorityInsight[] = [];
  const byLabel = Object.fromEntries(ats.categories.map((c) => [c.label, c]));

  // 1) Quantified bullets — usually the single biggest lever
  const bullets = parsed.experience.flatMap((e) => e.bullets);
  const noNumber = bullets.filter((b) => !BULLET_HAS_NUMBER.test(b)).length;
  const noNumberRatio = bullets.length > 0 ? noNumber / bullets.length : 0;
  if (bullets.length > 0 && noNumberRatio > 0.4) {
    insights.push({
      id: insightId(),
      title: "Quantify 3 of your bullets",
      action: `Find three bullets that lack a number and add a metric (% growth, $ saved, ms latency, N users).`,
      expectedUplift: 8,
      reason: `${Math.round(noNumberRatio * 100)}% of your bullets have no measurable impact.`,
    });
  }

  // 2) JD keyword gap
  if (jd && jd.missingKeywords.length > 0) {
    const top = jd.missingKeywords
      .filter((k) => k.length >= 3)
      .slice(0, 5);
    if (top.length > 0) {
      insights.push({
        id: insightId(),
        title: `Add ${top.length} missing JD terms`,
        action: `Weave the top terms into your Skills section or a recent bullet.`,
        expectedUplift: 6,
        reason: `Top missing: ${top.slice(0, 3).map((k) => `\`${k}\``).join(", ")}.`,
      });
    }
  }

  // 3) Weak verbs
  const weakCount = bullets.filter((b) => {
    const first = bulletFirstWord(b);
    return first && WEAK_VERBS.has(first);
  }).length;
  if (weakCount > 0) {
    insights.push({
      id: insightId(),
      title: `Replace ${weakCount} weak verb${weakCount > 1 ? "s" : ""}`,
      action:
        "Swap \"worked\", \"helped\", \"responsible for\" with action verbs (Architected, Delivered, Owned, Shipped).",
      expectedUplift: 4,
      reason: `Strong verbs scan faster for recruiters and ATS keyword matchers.`,
    });
  }

  // 4) Skills breadth
  if (byLabel.Skills && byLabel.Skills.score < 60) {
    insights.push({
      id: insightId(),
      title: "Broaden your skills list",
      action:
        "Add a mix of languages, frameworks, databases, and infrastructure tools (8–15 total).",
      expectedUplift: 5,
      reason: `Skills category is at ${byLabel.Skills.score}/100.`,
    });
  }

  // 5) Contact / email
  if (!parsed.basics.email) {
    insights.push({
      id: insightId(),
      title: "Add a professional email",
      action: "Place a valid email at the top of your resume.",
      expectedUplift: 4,
      reason: "Most ATS pipelines require a valid email to route applications.",
    });
  }

  // 6) Education
  if (byLabel.Education && byLabel.Education.score < 60) {
    insights.push({
      id: insightId(),
      title: "Detail your education section",
      action:
        "Include school, degree, field of study, and graduation year for each entry.",
      expectedUplift: 3,
      reason: "Education is weighted 10% of the overall score.",
    });
  }

  // 7) Bullets density
  if (bullets.length < 6 && parsed.experience.length > 0) {
    insights.push({
      id: insightId(),
      title: `Add ${6 - bullets.length} more bullets`,
      action: "Aim for 3–5 quantified bullets per role.",
      expectedUplift: 4,
      reason: "Each role should have measurable, action-led bullet points.",
    });
  }

  // Rank by expected uplift, take top 3
  return insights
    .sort((a, b) => b.expectedUplift - a.expectedUplift)
    .slice(0, 3);
}
