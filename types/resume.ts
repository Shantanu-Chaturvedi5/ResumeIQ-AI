export type Severity = "critical" | "warning" | "info";

export interface ResumeBasics {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  links?: string[];
}

export interface ResumeExperience {
  company: string;
  role: string;
  start?: string;
  end?: string;
  bullets: string[];
}

export interface ResumeEducation {
  school: string;
  degree?: string;
  field?: string;
  start?: string;
  end?: string;
}

export interface ResumeProject {
  name: string;
  description?: string;
  tech?: string[];
}

export interface ParsedResume {
  rawText: string;
  basics: ResumeBasics;
  skills: string[];
  experience: ResumeExperience[];
  education: ResumeEducation[];
  projects: ResumeProject[];
  sectionOrder: string[];
}

export interface CategoryScore {
  label: string;
  score: number; // 0-100
  reason: string;
}

export interface Suggestion {
  id: string;
  category: "skills" | "formatting" | "experience" | "keywords" | "verbs";
  severity: Severity;
  title: string;
  detail: string;
  example?: string;
}

export interface AtsResult {
  overall: number; // 0-100
  categories: CategoryScore[];
  strengths: string[];
}

export interface JdMatchResult {
  matchPercentage: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  recommendedSkills: string[];
  /** JD-side occurrence counts for each keyword. Populated by matchJd. */
  keywordFrequencies?: Record<string, number>;
}

export interface AnalysisResult {
  parsed: ParsedResume;
  ats: AtsResult;
  suggestions: Suggestion[];
  jd?: JdMatchResult;
}

export type KeywordCategory =
  | "language"
  | "framework"
  | "database"
  | "cloud"
  | "devops"
  | "data"
  | "testing"
  | "tool"
  | "soft"
  | "other";

/**
 * High-leverage "do this first" insight surfaced at the top of the
 * suggestions list. Distinct from a regular Suggestion because it
 * carries an expected score uplift and a one-line action.
 */
export interface PriorityInsight {
  id: string;
  title: string;
  action: string;
  expectedUplift: number; // estimated score points
  reason: string;
}
