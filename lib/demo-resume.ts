/**
 * Sample resume used by the "Try Demo" flow on the analyzer page. Hand-tuned
 * to produce a realistic, mid-strength ATS profile so the user can see how
 * the report looks without uploading their own file.
 *
 * Also exports a sample job description that scores well against this
 * resume (with deliberate gaps the demo can highlight as missing keywords).
 */

export const DEMO_RESUME_FILENAME = "demo-resume.txt";

export const DEMO_RESUME_TEXT = `Aarav Sharma
aarav.sharma@example.com  ·  +1 (415) 555-0142  ·  San Francisco, CA
linkedin.com/in/aaravsharma  ·  github.com/aaravsharma

SUMMARY
Senior full-stack engineer with 7 years of experience designing and shipping
production web applications. Strong background in TypeScript, React, and
Node.js with a focus on performance, accessibility, and clean APIs.

SKILLS
TypeScript, JavaScript, React, Next.js, Node.js, Express, PostgreSQL,
MongoDB, Redis, Docker, Kubernetes, AWS, GraphQL, REST, Jest, Playwright,
Tailwind CSS, Figma, Git, GitHub Actions, Vite, Webpack

EXPERIENCE

Senior Software Engineer — Stripe
Jan 2022 – Present
- Architected a Next.js admin dashboard that cut reporting time by 42% for
  12 internal teams and serves 4k weekly active users.
- Led the migration of 6 Express services to TypeScript, reducing runtime
  type errors by 78% and shipping 2x faster.
- Owned the move from REST to GraphQL across the payments surface, cutting
  average page latency from 1.4s to 320ms.
- Mentored 4 mid-level engineers; ran weekly code review and architecture
  office hours.

Software Engineer — Vercel
Jul 2019 – Dec 2021
- Built a deployment metrics pipeline in Node.js + PostgreSQL that processed
  18M events/day with 99.95% uptime.
- Shipped a Playwright-based visual regression suite that caught 30+
  production-breaking UI bugs in the first quarter.
- Reduced p95 cold start times by 55% by introducing edge caching and
  smarter bundling.

Frontend Engineer — Notion
Aug 2017 – Jun 2019
- Worked on the Notion editor performance team, improving keystroke latency
  by 35% for documents over 50 pages.
- Helped ship the slash-command UI used by 8M+ users.
- Authored internal React component library used across 14 product teams.

EDUCATION
B.S. Computer Science — University of California, Berkeley
2013 – 2017

PROJECTS
- ResumeIQ (open source) — a local-first ATS analyzer used by 1.2k
  developers. Built with Next.js, TypeScript, and PDF.js.
- Pixelogue — a headless CMS for indie game studios. Postgres + GraphQL.
`;

export const DEMO_JD_TEXT = `Senior Full-Stack Engineer
San Francisco, CA · Hybrid

We're hiring a Senior Full-Stack Engineer to join our platform team. You'll
own large parts of our customer-facing product, working closely with design
and product to ship a fast, reliable experience for thousands of users.

Responsibilities
- Design, build, and maintain production-grade web applications in
  TypeScript and React.
- Own services end-to-end: from API design (REST or GraphQL) through
  deployment, monitoring, and on-call.
- Collaborate with product, design, and data teams to ship customer
  features on a weekly cadence.
- Champion engineering quality: code review, testing, and documentation.

Required
- 5+ years of professional software engineering experience.
- Strong proficiency with TypeScript, React, and Node.js.
- Experience with PostgreSQL or another relational database.
- Familiarity with cloud infrastructure (AWS, GCP, or Azure).
- Solid understanding of CI/CD pipelines and Docker.
- Experience with Kubernetes, Terraform, or other infrastructure-as-code
  tools is a strong plus.

Nice to have
- Experience with Python or Go for backend services.
- Familiarity with machine learning pipelines or LLM applications.
- Contributions to open-source projects.
- Strong written communication; experience writing technical design docs.
`;
