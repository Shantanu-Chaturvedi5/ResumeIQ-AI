/**
 * Turns an AnalysisResult into a self-contained Markdown report.
 * Pure function — no DOM, no React. Used by the "Download .md" and
 * "Copy report" buttons on the analyzer page.
 */
import type { AnalysisResult, AtsResult, Suggestion } from "@/types/resume";

function grade(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Strong";
  if (score >= 55) return "Competitive";
  return "Needs work";
}

function severityEmoji(s: Suggestion["severity"]): string {
  if (s === "critical") return "[!]";
  if (s === "warning") return "[~]";
  return "[i]";
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function buildReport(result: AnalysisResult, opts?: { generatedAt?: Date }): string {
  const ats = result.ats;
  const parsed = result.parsed;
  const jd = result.jd;
  const generatedAt = opts?.generatedAt ?? new Date();

  const lines: string[] = [];

  // Header
  lines.push(`# ResumeIQ AI — ATS Report`);
  lines.push("");
  lines.push(`**Generated:** ${formatDate(generatedAt)}`);
  lines.push(`**Overall score:** ${ats.overall}/100 (${grade(ats.overall)})`);
  if (jd) {
    lines.push(`**JD match:** ${jd.matchPercentage}%`);
  }
  lines.push("");
  lines.push("---");
  lines.push("");

  // Category breakdown
  lines.push("## Category Breakdown");
  lines.push("");
  lines.push("| Category | Score | Reason |");
  lines.push("| --- | --- | --- |");
  for (const c of ats.categories) {
    lines.push(`| **${c.label}** | ${c.score}/100 | ${c.reason} |`);
  }
  lines.push("");

  // Strengths
  if (ats.strengths.length > 0) {
    lines.push("## Strengths");
    lines.push("");
    for (const s of ats.strengths) {
      lines.push(`- ${s}`);
    }
    lines.push("");
  }

  // JD match
  if (jd) {
    lines.push("## Job Description Match");
    lines.push("");
    lines.push(`**Match:** ${jd.matchPercentage}%`);
    lines.push("");
    if (jd.matchedKeywords.length > 0) {
      lines.push(`### Matched keywords (${jd.matchedKeywords.length})`);
      lines.push("");
      lines.push(jd.matchedKeywords.slice(0, 30).map((k) => `\`${k}\``).join(" "));
      lines.push("");
    }
    if (jd.missingKeywords.length > 0) {
      lines.push(`### Missing keywords (${jd.missingKeywords.length})`);
      lines.push("");
      lines.push(jd.missingKeywords.slice(0, 30).map((k) => `\`${k}\``).join(" "));
      lines.push("");
    }
    if (jd.recommendedSkills.length > 0) {
      lines.push(`### Recommended skills`);
      lines.push("");
      lines.push(jd.recommendedSkills.map((s) => `\`${s}\``).join(" "));
      lines.push("");
    }
    lines.push("---");
    lines.push("");
  }

  // Suggestions
  lines.push("## Suggestions");
  lines.push("");
  const grouped: Record<Suggestion["severity"], Suggestion[]> = {
    critical: [],
    warning: [],
    info: [],
  };
  for (const s of result.suggestions) grouped[s.severity].push(s);

  for (const sev of ["critical", "warning", "info"] as const) {
    const items = grouped[sev];
    if (items.length === 0) continue;
    const label = sev === "critical" ? "Critical" : sev === "warning" ? "Should fix" : "Polish";
    lines.push(`### ${severityEmoji(sev)} ${label} (${items.length})`);
    lines.push("");
    for (const s of items) {
      lines.push(`- **${s.title}** _(${s.category})_`);
      lines.push(`  - ${s.detail}`);
      if (s.example) {
        // Strip the "+ " prefix the in-app example uses; render as a code block
        const example = s.example.replace(/^\+\s*/, "");
        lines.push("");
        lines.push("  ```");
        lines.push(`  ${example}`);
        lines.push("  ```");
      }
    }
    lines.push("");
  }

  // Resume snapshot
  lines.push("## Parsed Resume");
  lines.push("");
  if (parsed.basics.name) lines.push(`**Name:** ${parsed.basics.name}`);
  if (parsed.basics.email) lines.push(`**Email:** ${parsed.basics.email}`);
  if (parsed.basics.phone) lines.push(`**Phone:** ${parsed.basics.phone}`);
  if (parsed.basics.location) lines.push(`**Location:** ${parsed.basics.location}`);
  if (parsed.basics.links && parsed.basics.links.length > 0) {
    lines.push(`**Links:** ${parsed.basics.links.join(", ")}`);
  }
  if (parsed.skills.length > 0) {
    lines.push("");
    lines.push(`**Skills (${parsed.skills.length}):** ${parsed.skills.join(", ")}`);
  }
  if (parsed.experience.length > 0) {
    lines.push("");
    lines.push(`### Experience (${parsed.experience.length} roles)`);
    lines.push("");
    for (const e of parsed.experience) {
      const header = [e.role, e.company].filter(Boolean).join(" — ");
      const dates = [e.start, e.end].filter(Boolean).join(" – ");
      lines.push(`- **${header || "Role"}**${dates ? ` _(${dates})_` : ""}`);
      for (const b of e.bullets) {
        lines.push(`  - ${b}`);
      }
    }
  }
  if (parsed.education.length > 0) {
    lines.push("");
    lines.push(`### Education (${parsed.education.length})`);
    lines.push("");
    for (const ed of parsed.education) {
      const parts = [ed.school, ed.degree].filter(Boolean).join(" — ");
      const dates = [ed.start, ed.end].filter(Boolean).join(" – ");
      lines.push(`- **${parts || "School"}**${dates ? ` _(${dates})_` : ""}`);
    }
  }
  if (parsed.projects.length > 0) {
    lines.push("");
    lines.push(`### Projects (${parsed.projects.length})`);
    lines.push("");
    for (const p of parsed.projects) {
      lines.push(`- **${p.name}**${p.description ? ` — ${p.description}` : ""}`);
    }
  }

  // Footer
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push(
    "_Generated by ResumeIQ AI · All processing happens locally in your browser._",
  );

  return lines.join("\n");
}

/**
 * Suggest a filename for the downloaded report based on the original resume
 * filename (if any). Falls back to `resumeiq-report.md`.
 */
export function suggestReportFilename(sourceName?: string | null): string {
  if (!sourceName) return "resumeiq-report.md";
  const base = sourceName.replace(/\.[^.]+$/, "").replace(/[^a-z0-9-_]+/gi, "-");
  const safe = base.replace(/^-+|-+$/g, "") || "resume";
  return `${safe}-report.md`;
}

export type { AtsResult };
