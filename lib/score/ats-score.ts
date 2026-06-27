/**
 * ATS scoring engine. Produces a 0-100 overall score and per-category
 * breakdown based on heuristics that mimic what real ATS tools check:
 * skills, formatting, experience, education, keywords.
 */
import type { AtsResult, CategoryScore, ParsedResume } from "@/types/resume";
import {
  ACTION_VERBS,
  WEAK_VERBS,
  BULLET_HAS_NUMBER,
  bulletFirstWord,
} from "./bullet-constants";

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function scoreSkills(parsed: ParsedResume): CategoryScore {
  const skills = parsed.skills;
  let score = 0;
  const reasons: string[] = [];

  if (skills.length >= 12) { score += 50; reasons.push("strong skill breadth"); }
  else if (skills.length >= 8) { score += 38; reasons.push("good skill coverage"); }
  else if (skills.length >= 5) { score += 25; reasons.push("limited skill coverage"); }
  else { score += skills.length * 4; reasons.push("very few recognized skills"); }

  // Diversity: do we have languages, frameworks, and tools?
  const lower = skills.map((s) => s.toLowerCase());
  const hasLang = lower.some((s) => /javascript|typescript|python|java|go|rust|ruby|php|c\+\+|c#|kotlin|swift/.test(s));
  const hasFramework = lower.some((s) => /react|vue|angular|next|django|flask|fastapi|spring|express|rails|laravel/.test(s));
  const hasInfra = lower.some((s) => /aws|azure|gcp|docker|kubernetes|terraform|vercel|cloudflare/.test(s));
  const hasData = lower.some((s) => /postgres|mysql|mongodb|redis|elasticsearch|sql/.test(s));

  if (hasLang) score += 12;
  if (hasFramework) score += 12;
  if (hasInfra) score += 10;
  if (hasData) score += 10;
  if (hasLang && hasFramework && (hasInfra || hasData)) score += 6;

  return {
    label: "Skills",
    score: clamp(score),
    reason: reasons.join(", ") + (score >= 80 ? " — well-rounded" : score < 50 ? " — broaden your stack" : ""),
  };
}

function scoreFormatting(parsed: ParsedResume): CategoryScore {
  const text = parsed.rawText;
  let score = 50; // baseline for being parseable
  const reasons: string[] = [];

  // Section presence
  const hasExp = parsed.sectionOrder.includes("experience") || parsed.experience.length > 0;
  const hasEdu = parsed.sectionOrder.includes("education") || parsed.education.length > 0;
  const hasSkills = parsed.sectionOrder.includes("skills") || parsed.skills.length > 0;
  if (hasExp) score += 12; else reasons.push("missing Experience section");
  if (hasEdu) score += 10; else reasons.push("missing Education section");
  if (hasSkills) score += 12; else reasons.push("missing Skills section");

  // Contact info
  if (parsed.basics.email) score += 8; else reasons.push("no email detected");
  if (parsed.basics.phone) score += 4;
  if (parsed.basics.links && parsed.basics.links.length > 0) score += 4;

  // Length sanity (typical resume = 400-6000 chars of clean text)
  if (text.length > 200) score += 4;
  if (text.length > 800 && text.length < 6000) score += 4;
  if (text.length >= 6000 && text.length <= 12000) score += 2;
  if (text.length > 18000) {
    score -= 8;
    reasons.push("resume is very long — consider trimming");
  }

  return {
    label: "Formatting",
    score: clamp(score),
    reason: reasons.length === 0
      ? "clean structure with all key sections"
      : reasons.join(", "),
  };
}

function scoreExperience(parsed: ParsedResume): CategoryScore {
  let score = 20;
  const reasons: string[] = [];

  const exp = parsed.experience;
  if (exp.length >= 4) { score += 30; reasons.push("solid experience depth"); }
  else if (exp.length >= 2) { score += 22; reasons.push("good experience list"); }
  else if (exp.length === 1) { score += 12; reasons.push("only one role listed"); }
  else { reasons.push("no experience entries detected"); }

  // Bullet quality
  const allBullets = exp.flatMap((e) => e.bullets);
  const withNumbers = allBullets.filter((b) => BULLET_HAS_NUMBER.test(b)).length;
  const numericRatio = allBullets.length > 0 ? withNumbers / allBullets.length : 0;
  if (numericRatio > 0.5) score += 25;
  else if (numericRatio > 0.25) score += 18;
  else if (numericRatio > 0) score += 8;
  else reasons.push("bullets lack quantified impact");

  // Action verbs
  const withVerbs = allBullets.filter((b) => {
    const first = bulletFirstWord(b);
    return first && ACTION_VERBS.has(first);
  }).length;
  if (allBullets.length > 0) {
    const verbRatio = withVerbs / allBullets.length;
    if (verbRatio > 0.5) score += 25;
    else if (verbRatio > 0.25) score += 18;
    else if (verbRatio > 0) score += 10;
    else reasons.push("start bullets with strong action verbs");
  }

  // Weak verb penalty
  const weakCount = allBullets.filter((b) => {
    const first = bulletFirstWord(b);
    return first && WEAK_VERBS.has(first);
  }).length;
  if (weakCount > 0) {
    score -= Math.min(15, weakCount * 4);
    reasons.push("replace weak verbs (worked, helped, did)");
  }

  return {
    label: "Experience",
    score: clamp(score),
    reason: reasons.length === 0 ? "strong, quantified, action-led bullets" : reasons.join(", "),
  };
}

function scoreEducation(parsed: ParsedResume): CategoryScore {
  const edu = parsed.education;
  let score = 40;
  const reasons: string[] = [];

  if (edu.length === 0) {
    return {
      label: "Education",
      score: 40,
      reason: "no education section detected",
    };
  }

  if (edu.length >= 2) score += 20;
  if (edu[0].degree) score += 20;
  if (edu[0].end && /\b(20|19)\d{2}\b/.test(edu[0].end)) score += 12;
  if (edu[0].school && edu[0].school.length > 4) score += 8;

  return {
    label: "Education",
    score: clamp(score),
    reason: reasons.length === 0 ? "education section is well-detailed" : reasons.join(", "),
  };
}

function scoreKeywords(parsed: ParsedResume): CategoryScore {
  const text = parsed.rawText.toLowerCase();
  let score = 30;
  const reasons: string[] = [];

  // Bullet density
  const bullets = parsed.experience.flatMap((e) => e.bullets);
  if (bullets.length >= 12) { score += 25; reasons.push("strong bullet density"); }
  else if (bullets.length >= 6) { score += 15; }
  else { score += bullets.length; reasons.push("few bullets overall"); }

  // Numbers
  const numericHits = (text.match(/\d+/g) || []).length;
  if (numericHits >= 12) score += 18;
  else if (numericHits >= 6) score += 12;
  else if (numericHits >= 2) score += 6;
  else reasons.push("no measurable metrics found");

  // Common ATS-friendly keywords
  const atsBoosters = ["team", "leadership", "cross-functional", "stakeholder", "agile", "scrum", "ownership", "delivered", "shipped", "production"];
  const boosterHits = atsBoosters.filter((k) => text.includes(k)).length;
  score += Math.min(20, boosterHits * 3);

  // Penalize huge blocks of text (low signal-to-noise)
  const longestLine = Math.max(
    ...parsed.rawText.split(/\n/).map((l) => l.length),
    0,
  );
  if (longestLine > 400) {
    score -= 8;
    reasons.push("very long lines — break into bullets");
  }

  return {
    label: "Keywords",
    score: clamp(score),
    reason: reasons.length === 0 ? "keyword-rich, metric-driven content" : reasons.join(", "),
  };
}

function strengths(parsed: ParsedResume, categories: CategoryScore[]): string[] {
  const out: string[] = [];
  const byLabel = Object.fromEntries(categories.map((c) => [c.label, c]));

  if (byLabel.Skills.score >= 80) out.push("Broad, well-balanced technical skill set");
  if (byLabel.Formatting.score >= 80) out.push("Clean structure with all standard sections");
  if (byLabel.Experience.score >= 75) out.push("Quantified, action-led experience bullets");
  if (byLabel.Education.score >= 80) out.push("Education section is well-detailed");
  if (byLabel.Keywords.score >= 75) out.push("Strong keyword density with measurable impact");
  if (parsed.skills.length >= 10) out.push(`${parsed.skills.length}+ recognized tools and technologies`);

  if (out.length === 0) {
    out.push("Solid foundation — the suggestions below will move the needle");
  }
  return out;
}

export function scoreResume(parsed: ParsedResume): AtsResult {
  const categories: CategoryScore[] = [
    scoreSkills(parsed),
    scoreFormatting(parsed),
    scoreExperience(parsed),
    scoreEducation(parsed),
    scoreKeywords(parsed),
  ];
  // Weighted average: skills 25, formatting 20, experience 25, education 10, keywords 20
  const weights: Record<string, number> = {
    Skills: 0.25,
    Formatting: 0.2,
    Experience: 0.25,
    Education: 0.1,
    Keywords: 0.2,
  };
  const overall = Math.round(
    categories.reduce((sum, c) => sum + c.score * (weights[c.label] ?? 0.2), 0),
  );
  return {
    overall,
    categories,
    strengths: strengths(parsed, categories),
  };
}
