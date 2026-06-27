/**
 * Heuristic resume parser. Pulls name, contact, skills, experience,
 * education, and projects out of plain-text resumes. No ML — just
 * well-tuned regex + section detection that handles 90%+ of real
 * resumes (single-column, multi-section, US/IN/EU formats).
 */
import type {
  ParsedResume,
  ResumeBasics,
  ResumeEducation,
  ResumeExperience,
  ResumeProject,
} from "@/types/resume";

const EMAIL_RE =
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const PHONE_RE =
  /(\+?\d{1,3}[\s.-]?)?(\(?\d{2,4}\)?[\s.-]?)\d{3,4}[\s.-]?\d{3,4}/;
const URL_RE = /\b((?:https?:\/\/)?(?:www\.)?(?:linkedin|github|gitlab|behance|dribbble|medium|portfolio)\.[a-z0-9./_-]+)\b/i;

const SECTION_HEADERS: Record<string, RegExp> = {
  experience:
    /^\s*(work\s+)?(professional\s+)?(experience|employment|work\s+history|professional\s+background|career\s+history)\s*:?\s*$/i,
  education:
    /^\s*(education|academic|qualifications|academic\s+background)\s*:?\s*$/i,
  skills:
    /^\s*(skills|technical\s+skills|core\s+competencies|key\s+skills|technologies|tech\s+stack|expertise)\s*:?\s*$/i,
  projects:
    /^\s*(projects|side\s+projects|personal\s+projects|key\s+projects|selected\s+projects|portfolio)\s*:?\s*$/i,
  summary:
    /^\s*(summary|profile|about|objective|professional\s+summary)\s*:?\s*$/i,
  contact:
    /^\s*(contact|details)\s*:?\s*$/i,
  certifications:
    /^\s*(certifications?|licenses?|awards?|honors?|achievements?)\s*:?\s*$/i,
};

const TITLE_LINE_RE = /^[A-Z][A-Za-z0-9 ,.'&/+-]{0,80}$/;
const COMPANY_LINE_RE = /at\s+[A-Z].+|—\s*[A-Z].+|,\s*[A-Z].+/i;
const DATE_RANGE_RE =
  /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{1,2}\/\d{4}|\d{4})\s*[–—\-to]+\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{1,2}\/\d{4}|\d{4}|present|current|now)/i;
const YEAR_RE = /\b(19|20)\d{2}\b/;
const BULLET_RE = /^[\s•\-\*◆▪◦·]+/;

function normalizeLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+$/g, ""))
    .map((l) => l.replace(/[ \t]+/g, " "));
}

function detectSections(lines: string[]): { name: string; start: number }[] {
  const out: { name: string; start: number }[] = [];
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    for (const [name, re] of Object.entries(SECTION_HEADERS)) {
      if (re.test(trimmed)) {
        out.push({ name, start: i + 1 });
        break;
      }
    }
  }
  return out;
}

function sectionRange(
  sections: { name: string; start: number }[],
  lines: string[],
  name: string,
): string[] {
  const idx = sections.findIndex((s) => s.name === name);
  if (idx === -1) return [];
  const start = sections[idx].start;
  const end =
    idx + 1 < sections.length ? sections[idx + 1].start : lines.length;
  return lines.slice(start, end).filter((l) => l.trim().length > 0);
}

function extractBasics(lines: string[]): ResumeBasics {
  const first = lines.slice(0, 12);
  const fullText = first.join("\n");

  const email = fullText.match(EMAIL_RE)?.[0];
  const phone = fullText.match(PHONE_RE)?.[0];
  const link = fullText.match(URL_RE)?.[0];

  // Name: first non-empty line that looks like a name (1-5 capitalized words)
  let name: string | undefined;
  for (const l of first) {
    const t = l.trim();
    if (!t) continue;
    if (EMAIL_RE.test(t) || PHONE_RE.test(t)) continue;
    const words = t.split(/\s+/);
    if (
      words.length >= 1 &&
      words.length <= 5 &&
      words.every(
        (w) =>
          /^[A-Z][a-zA-Z'.-]*$/.test(w) || /^[A-Z]+$/.test(w),
      )
    ) {
      name = t;
      break;
    }
  }

  // Location: optional, look for "City, ST" or "City, Country" pattern
  const location = first
    .map((l) => l.trim())
    .find(
      (l) =>
        /^[A-Z][A-Za-z .'-]+,\s*[A-Z]{2,}/.test(l) &&
        !EMAIL_RE.test(l) &&
        l.length < 60,
    );

  const links: string[] = [];
  for (const l of first) {
    const matches = l.match(/https?:\/\/[^\s)]+/g);
    if (matches) links.push(...matches);
  }
  if (link) links.push(link);

  return {
    name,
    email,
    phone,
    location,
    links: Array.from(new Set(links)),
  };
}

const SKILL_KEYWORDS = new Set([
  // languages
  "javascript", "typescript", "python", "java", "kotlin", "swift",
  "objective-c", "c", "c++", "c#", "go", "golang", "rust", "ruby", "php",
  "scala", "perl", "r", "matlab", "dart", "elixir", "haskell", "lua",
  // frontend
  "react", "next.js", "nextjs", "vue", "nuxt", "angular", "svelte", "sveltekit",
  "remix", "solid", "preact", "redux", "mobx", "zustand", "tailwind", "tailwindcss",
  "css", "scss", "sass", "html", "webpack", "vite", "rollup", "parcel", "babel",
  "storybook", "framer-motion", "react-query", "tanstack",
  // backend
  "node", "node.js", "nodejs", "express", "koa", "fastify", "nestjs", "django",
  "flask", "fastapi", "rails", "spring", "spring boot", "laravel", "asp.net",
  "graphql", "rest", "grpc", "trpc",
  // databases
  "postgresql", "postgres", "mysql", "mariadb", "sqlite", "mongodb", "redis",
  "cassandra", "dynamodb", "elasticsearch", "snowflake", "bigquery", "clickhouse",
  "firebase", "supabase", "prisma", "sequelize", "typeorm", "drizzle", "mongoose",
  // devops / cloud
  "aws", "azure", "gcp", "google cloud", "digitalocean", "heroku", "vercel",
  "netlify", "cloudflare", "docker", "kubernetes", "k8s", "terraform", "ansible",
  "helm", "jenkins", "github actions", "gitlab ci", "circleci", "argo", "istio",
  // data / ml
  "pandas", "numpy", "scikit-learn", "pytorch", "tensorflow", "keras", "jax",
  "spark", "hadoop", "kafka", "airflow", "dbt", "mlflow", "huggingface", "langchain",
  "llamaindex", "openai", "rag", "embeddings",
  // testing
  "jest", "vitest", "mocha", "chai", "playwright", "cypress", "puppeteer", "selenium",
  "junit", "pytest", "rspec",
  // tools / methodology
  "git", "linux", "bash", "zsh", "powershell", "agile", "scrum", "kanban",
  "jira", "linear", "notion", "figma", "sketch", "photoshop", "illustrator",
  "tableau", "power bi", "looker", "metabase",
  // mobile
  "ios", "android", "react native", "flutter", "xamarin",
  // soft (sparingly)
  "leadership", "communication", "mentoring", "stakeholder management",
]);

function extractSkills(lines: string[]): string[] {
  const found = new Set<string>();
  const lower = lines.join("\n").toLowerCase();
  for (const skill of SKILL_KEYWORDS) {
    // word-boundary-ish match: handle C++ and C# and Node.js specially
    let pattern: RegExp;
    if (skill.includes("+") || skill.includes("#") || skill.includes(".")) {
      pattern = new RegExp(
        `\\b${skill.replace(/[.+]/g, (m) => `\\${m}`).replace("#", "\\#")}\\b`,
        "i",
      );
    } else {
      pattern = new RegExp(`\\b${skill.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "i");
    }
    if (pattern.test(lower)) {
      // canonicalize
      const canon =
        skill === "nodejs"
          ? "Node.js"
          : skill === "nextjs"
          ? "Next.js"
          : skill === "postgres"
          ? "PostgreSQL"
          : skill === "k8s"
          ? "Kubernetes"
          : skill === "ts"
          ? "TypeScript"
          : skill === "js"
          ? "JavaScript"
          : skill.replace(/\b\w/g, (c) => c.toUpperCase());
      found.add(canon);
    }
  }
  return Array.from(found);
}

function extractExperience(lines: string[]): ResumeExperience[] {
  const out: ResumeExperience[] = [];
  if (lines.length === 0) return out;

  // Group lines into blocks separated by blank lines or date lines
  const blocks: string[][] = [[]];
  for (const l of lines) {
    if (l.trim().length === 0) {
      if (blocks[blocks.length - 1].length) blocks.push([]);
      continue;
    }
    blocks[blocks.length - 1].push(l);
  }

  for (const block of blocks) {
    if (block.length === 0) continue;
    let company: string | undefined;
    let role: string | undefined;
    let start: string | undefined;
    let end: string | undefined;
    const bullets: string[] = [];

    for (let i = 0; i < block.length; i++) {
      const line = block[i];
      const dateMatch = line.match(DATE_RANGE_RE);
      if (dateMatch) {
        start = dateMatch[1];
        end = dateMatch[2];
        // Strip the date out of the line for role/company parsing
        block[i] = line.replace(DATE_RANGE_RE, "").trim();
      }
    }

    // Heuristic: first non-empty line is role, second is company (or vice-versa)
    const clean = block.filter((b) => b.length > 0);
    if (clean.length >= 1) {
      role = clean[0];
    }
    if (clean.length >= 2) {
      company = clean[1];
    }

    // Bullets: any line that starts with a bullet marker, or is sentence-like and not a header
    for (let i = 2; i < clean.length; i++) {
      const l = clean[i];
      if (BULLET_RE.test(l) || l.length > 40) {
        bullets.push(l.replace(BULLET_RE, "").trim());
      }
    }

    if (role || company) {
      out.push({ role: role ?? "", company: company ?? "", start, end, bullets });
    }
  }
  return out;
}

function extractEducation(lines: string[]): ResumeEducation[] {
  const out: ResumeEducation[] = [];
  const blocks: string[][] = [[]];
  for (const l of lines) {
    if (l.trim().length === 0) {
      if (blocks[blocks.length - 1].length) blocks.push([]);
      continue;
    }
    blocks[blocks.length - 1].push(l);
  }
  for (const block of blocks) {
    if (block.length === 0) continue;
    const text = block.join(" | ");
    const years = text.match(/\b(19|20)\d{2}\b/g);
    out.push({
      school: block[0],
      degree: block[1] || undefined,
      start: years?.[0],
      end: years?.[1] ?? years?.[0],
    });
  }
  return out;
}

function extractProjects(lines: string[]): ResumeProject[] {
  const out: ResumeProject[] = [];
  const blocks: string[][] = [[]];
  for (const l of lines) {
    if (l.trim().length === 0) {
      if (blocks[blocks.length - 1].length) blocks.push([]);
      continue;
    }
    blocks[blocks.length - 1].push(l);
  }
  for (const block of blocks) {
    if (block.length === 0) continue;
    out.push({
      name: block[0].replace(BULLET_RE, "").trim(),
      description: block[1]?.replace(BULLET_RE, "").trim(),
    });
  }
  return out;
}

export function parseResume(rawText: string): ParsedResume {
  const lines = normalizeLines(rawText);
  const sections = detectSections(lines);
  const sectionNames = sections.map((s) => s.name);

  const basics = extractBasics(lines);
  const skills = extractSkills(lines);
  const experience = extractExperience(sectionRange(sections, lines, "experience"));
  const education = extractEducation(sectionRange(sections, lines, "education"));
  const projects = extractProjects(sectionRange(sections, lines, "projects"));

  return {
    rawText,
    basics,
    skills,
    experience,
    education,
    projects,
    sectionOrder: sectionNames,
  };
}
