/**
 * Job-description matching. Extracts keywords / skills / phrases from a JD
 * and compares them against the candidate's resume.
 */
import type { JdMatchResult, KeywordCategory, ParsedResume } from "@/types/resume";

// Common English stopwords we don't want to match on.
const STOPWORDS = new Set([
  "a","an","and","are","as","at","be","been","being","but","by","can","could",
  "did","do","does","doing","done","for","from","had","has","have","having","he",
  "her","here","him","his","how","i","if","in","into","is","it","its","just","me",
  "my","no","nor","not","now","of","on","once","only","or","other","our","out",
  "over","own","same","she","should","so","some","such","than","that","the",
  "their","them","then","there","these","they","this","those","through","to",
  "too","under","until","up","very","was","we","were","what","when","where",
  "which","while","who","whom","why","will","with","would","you","your",
  "year","years","month","months","day","days","week","weeks",
  "candidate","candidates","role","roles","position","positions","team","teams",
  "company","companies","organization","work","working","ability","strong",
  "good","great","plus","must","will","well","best","including","include",
  "etc","across","within","using","used","use","like","also","around",
]);

const SOFT_SKILLS = new Set([
  "leadership","communication","collaboration","mentoring","stakeholder",
  "cross-functional","ownership","initiative","problem solving","adaptability",
  "time management","prioritization","decision making",
]);

// Punctuation/char normalization
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[•●▪◦·]/g, " ")
    .replace(/[^a-z0-9+#./\- ]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2 && t.length <= 40);
}

// Extract multi-word phrases like "machine learning" or "design systems"
// by looking for known bigram and trigram patterns. Returns canonical phrases.
function extractPhrases(text: string): string[] {
  const lower = text.toLowerCase();
  const found = new Set<string>();
  const candidates = [
    // bigrams
    "machine learning","deep learning","data science","data engineering",
    "data analysis","data analytics","data visualization","data modeling",
    "data pipeline","data pipelines","design systems","design system",
    "system design","distributed systems","microservices","event driven",
    "event-driven","test driven","test-driven","ci/cd","ci cd",
    "continuous integration","continuous deployment","unit testing",
    "integration testing","end to end","end-to-end","code review",
    "code reviews","pair programming","agile methodology","scrum master",
    "product management","product strategy","user research","user experience",
    "user interface","growth marketing","content strategy","brand strategy",
    "customer success","customer experience","customer journey",
    "search engine optimization","a/b testing","a/b test","ab testing",
    "natural language processing","computer vision","reinforcement learning",
    "transformer models","large language models","vector databases",
    "react native","vue.js","next.js","node.js","spring boot","google cloud",
    "amazon web services","azure devops","google analytics","power bi",
    "tableau","looker","metabase","change management","project management",
  ];
  for (const c of candidates) {
    if (lower.includes(c)) found.add(c);
  }
  return Array.from(found);
}

function ngrams(tokens: string[], n: number): string[] {
  const out: string[] = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    const slice = tokens.slice(i, i + n);
    if (slice.some((s) => STOPWORDS.has(s))) continue;
    out.push(slice.join(" "));
  }
  return out;
}

function extractKeywords(jd: string): {
  single: string[];
  phrase: string[];
  recommended: string[];
} {
  const tokens = tokenize(jd);
  // Frequency-weighted singles
  const counts = new Map<string, number>();
  for (const t of tokens) {
    if (STOPWORDS.has(t)) continue;
    if (/^\d+$/.test(t)) continue;
    counts.set(t, (counts.get(t) ?? 0) + 1);
  }

  // Keep repeated tokens (signals "this is important in the JD")
  const single = Array.from(counts.entries())
    .filter(([, n]) => n >= 1)
    .map(([t]) => t)
    .sort((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0));

  const phrase = extractPhrases(jd);

  // Recommended skills: hard-skill tokens + phrases
  const techHints = new Set([
    "javascript","typescript","python","java","kotlin","swift","c++","c#","go",
    "rust","ruby","php","scala","react","next.js","vue","angular","svelte",
    "node.js","express","django","flask","fastapi","spring","rails","laravel",
    "postgresql","mysql","mongodb","redis","elasticsearch","snowflake","bigquery",
    "aws","azure","gcp","docker","kubernetes","terraform","ansible","jenkins",
    "graphql","rest","grpc","kafka","spark","airflow","dbt","tensorflow",
    "pytorch","scikit-learn","pandas","numpy","huggingface","langchain",
    "jest","playwright","cypress","selenium","figma","jira","linear",
  ]);
  const recommended = new Set<string>();
  for (const t of single) {
    if (techHints.has(t)) recommended.add(t.replace(/\b\w/g, (c) => c.toUpperCase()));
  }
  for (const p of phrase) recommended.add(p);
  // Soft-skill recommendations when mentioned
  for (const s of SOFT_SKILLS) {
    if (jd.toLowerCase().includes(s)) recommended.add(s);
  }

  return { single, phrase, recommended: Array.from(recommended) };
}

function resumeHasKeyword(resume: ParsedResume, kw: string): boolean {
  const target = kw.toLowerCase();
  if (resume.skills.map((s) => s.toLowerCase()).includes(target)) return true;
  if (resume.rawText.toLowerCase().includes(target)) return true;
  return false;
}

/**
 * Bucket a single keyword into a coarse category used by the keyword panel
 * to group missing items and by the Markdown report. Pure function — no I/O.
 */
export function categorizeKeyword(kw: string): KeywordCategory {
  const k = kw.toLowerCase();

  // soft skills first — they tend to overlap with general nouns
  if (SOFT_SKILLS.has(k)) return "soft";

  const has = (set: Set<string>) => set.has(k);

  if (has(LANGUAGES)) return "language";
  if (has(FRAMEWORKS)) return "framework";
  if (has(DATABASES)) return "database";
  if (has(CLOUD)) return "cloud";
  if (has(DEVOPS)) return "devops";
  if (has(DATA)) return "data";
  if (has(TESTING)) return "testing";
  if (has(TOOLS)) return "tool";

  // phrase-level fallbacks (bigrams in extractPhrases)
  if (/machine learning|deep learning|nlp|computer vision|pytorch|tensorflow|llm|rag|embeddings/.test(k)) return "data";
  if (/aws|azure|gcp|cloud|vercel|netlify|heroku/.test(k)) return "cloud";
  if (/docker|kubernetes|terraform|ansible|jenkins|circleci|github actions|ci\/cd|kafka|airflow/.test(k)) return "devops";
  if (/postgres|mysql|mongo|redis|elastic|snowflake|bigquery|sql/.test(k)) return "database";

  return "other";
}

export const KEYWORD_CATEGORY_LABEL: Record<KeywordCategory, string> = {
  language: "Languages",
  framework: "Frameworks",
  database: "Databases",
  cloud: "Cloud",
  devops: "DevOps",
  data: "Data / ML",
  testing: "Testing",
  tool: "Tools",
  soft: "Soft skills",
  other: "Other",
};

/**
 * Aliases for common synonyms — surfaced as a hover hint on ambiguous
 * missing keywords (e.g. showing "also matches: K8s, Kubernetes" when
 * the JD asks for one and the resume lists another).
 */
const ALIASES: Array<[RegExp, string[]]> = [
  [/kubernetes|k8s/i, ["k8s", "Kubernetes"]],
  [/postgres|postgresql/i, ["postgres", "PostgreSQL"]],
  [/javascript|\bjs\b/i, ["JS", "JavaScript"]],
  [/typescript|\bts\b/i, ["TS", "TypeScript"]],
  [/node\.?js|nodejs/i, ["Node", "Node.js"]],
  [/amazon web services/i, ["AWS"]],
  [/google cloud platform/i, ["GCP"]],
  [/continuous integration|continuous deployment/i, ["CI/CD"]],
  [/machine learning/i, ["ML"]],
  [/natural language processing/i, ["NLP"]],
  [/large language model/i, ["LLM"]],
  [/a\/b testing/i, ["A/B testing"]],
  [/single.page application/i, ["SPA"]],
];

export function keywordAliases(kw: string): string[] {
  const found: string[] = [];
  for (const [re, list] of ALIASES) {
    if (re.test(kw)) {
      for (const alias of list) {
        if (!kw.toLowerCase().includes(alias.toLowerCase())) found.push(alias);
      }
    }
  }
  return Array.from(new Set(found));
}

/**
 * Count how many times each candidate keyword (single word) appears in the JD.
 * Phrases are counted by direct substring matches.
 */
function buildFrequencyMap(
  jd: string,
  candidates: string[],
): Record<string, number> {
  const lower = jd.toLowerCase();
  const out: Record<string, number> = {};
  for (const c of candidates) {
    const target = c.toLowerCase();
    // word-boundary-ish count
    const re = new RegExp(
      `\\b${target.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`,
      "gi",
    );
    const matches = lower.match(re);
    out[c] = matches ? matches.length : 0;
  }
  return out;
}

export function matchJd(resume: ParsedResume, jd: string): JdMatchResult {
  if (!jd || jd.trim().length < 30) {
    return {
      matchPercentage: 0,
      matchedKeywords: [],
      missingKeywords: [],
      recommendedSkills: [],
      keywordFrequencies: {},
    };
  }

  const { single, phrase, recommended } = extractKeywords(jd);

  // De-duplicate, ignore super-short tokens, ignore stopwords.
  const candidateSet = new Set<string>();
  // phrases first (more meaningful)
  for (const p of phrase) candidateSet.add(p);
  // Top frequency single tokens (limit to keep signal high)
  for (const t of single.slice(0, 60)) {
    if (t.length < 3) continue;
    candidateSet.add(t);
  }

  const candidates = Array.from(candidateSet);
  const matched: string[] = [];
  const missing: string[] = [];
  for (const kw of candidates) {
    if (resumeHasKeyword(resume, kw)) matched.push(kw);
    else missing.push(kw);
  }

  // Recommended = missing top 8 technical terms
  const recs = recommended
    .filter((s) => !resumeHasKeyword(resume, s))
    .slice(0, 8);

  const matchPercentage = candidates.length === 0
    ? 0
    : Math.round((matched.length / candidates.length) * 100);

  // Frequency map for the UI — used to badge "mentioned 3x in the JD"
  const keywordFrequencies = buildFrequencyMap(jd, candidates);

  return {
    matchPercentage,
    matchedKeywords: matched.slice(0, 60),
    missingKeywords: missing
      .filter((k) => k.length >= 3)
      .sort((a, b) => b.length - a.length)
      .slice(0, 30),
    recommendedSkills: recs,
    keywordFrequencies,
  };
}

// Category sets used by categorizeKeyword. Kept as Sets for O(1) lookup.

const LANGUAGES = new Set([
  "javascript", "typescript", "python", "java", "kotlin", "swift",
  "objective-c", "c", "c++", "c#", "go", "golang", "rust", "ruby", "php",
  "scala", "perl", "r", "matlab", "dart", "elixir", "haskell", "lua", "sql",
]);

const FRAMEWORKS = new Set([
  "react", "next.js", "nextjs", "vue", "nuxt", "angular", "svelte", "sveltekit",
  "remix", "solid", "preact", "redux", "express", "koa", "fastify", "nestjs",
  "django", "flask", "fastapi", "rails", "spring", "laravel", "asp.net",
  "graphql", "rest", "grpc", "trpc", "tailwind", "tailwindcss",
]);

const DATABASES = new Set([
  "postgresql", "postgres", "mysql", "mariadb", "sqlite", "mongodb", "redis",
  "cassandra", "dynamodb", "elasticsearch", "snowflake", "bigquery",
  "clickhouse", "firebase", "supabase", "prisma", "sequelize", "typeorm",
  "drizzle", "mongoose",
]);

const CLOUD = new Set([
  "aws", "azure", "gcp", "google cloud", "amazon web services",
  "digitalocean", "heroku", "vercel", "netlify", "cloudflare",
]);

const DEVOPS = new Set([
  "docker", "kubernetes", "k8s", "terraform", "ansible", "helm",
  "jenkins", "github actions", "gitlab ci", "circleci", "argo", "istio",
  "ci/cd", "ci cd", "continuous integration", "continuous deployment",
]);

const DATA = new Set([
  "pandas", "numpy", "scikit-learn", "pytorch", "tensorflow", "keras",
  "jax", "spark", "hadoop", "kafka", "airflow", "dbt", "mlflow",
  "huggingface", "langchain", "llamaindex", "openai", "rag", "embeddings",
  "machine learning", "deep learning", "nlp", "computer vision",
  "reinforcement learning",
]);

const TESTING = new Set([
  "jest", "vitest", "mocha", "chai", "playwright", "cypress", "puppeteer",
  "selenium", "junit", "pytest", "rspec",
]);

const TOOLS = new Set([
  "git", "linux", "bash", "zsh", "powershell", "agile", "scrum", "kanban",
  "jira", "linear", "notion", "figma", "sketch", "photoshop", "illustrator",
  "tableau", "power bi", "looker", "metabase", "webpack", "vite", "rollup",
  "babel", "storybook",
]);
