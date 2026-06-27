"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Sparkles, X, Check, Plus, Copy } from "lucide-react";
import { useAppStore } from "@/hooks/use-app-store";
import { cn } from "@/lib/utils";
import {
  categorizeKeyword,
  KEYWORD_CATEGORY_LABEL,
  keywordAliases,
} from "@/lib/score/jd-match";
import type { KeywordCategory } from "@/types/resume";
import { toast } from "sonner";

const CATEGORY_ORDER: KeywordCategory[] = [
  "language",
  "framework",
  "database",
  "cloud",
  "devops",
  "data",
  "testing",
  "tool",
  "soft",
  "other",
];

const CATEGORY_TONE: Record<KeywordCategory, string> = {
  language: "text-violet-600 dark:text-violet-400",
  framework: "text-sky-600 dark:text-sky-400",
  database: "text-emerald-600 dark:text-emerald-400",
  cloud: "text-amber-600 dark:text-amber-400",
  devops: "text-rose-600 dark:text-rose-400",
  data: "text-pink-600 dark:text-pink-400",
  testing: "text-cyan-600 dark:text-cyan-400",
  tool: "text-indigo-600 dark:text-indigo-400",
  soft: "text-orange-600 dark:text-orange-400",
  other: "text-muted-foreground",
};

export function KeywordPanel() {
  const result = useAppStore((s) => s.result);

  if (!result) return null;

  const matched = result.jd?.matchedKeywords ?? [];
  const missing = result.jd?.missingKeywords ?? [];
  const recommended = result.jd?.recommendedSkills ?? [];
  const skills = result.parsed.skills;
  const freqs = result.jd?.keywordFrequencies ?? {};

  // Group missing keywords by category
  const groupedMissing = React.useMemo(() => {
    const groups = new Map<KeywordCategory, string[]>();
    for (const kw of missing) {
      const cat = categorizeKeyword(kw);
      const list = groups.get(cat) ?? [];
      list.push(kw);
      groups.set(cat, list);
    }
    return groups;
  }, [missing]);

  // Sort each missing group by JD frequency (desc), then alphabetically
  const sortedGroups = React.useMemo(() => {
    const out: Array<[KeywordCategory, string[]]> = [];
    for (const [cat, list] of groupedMissing.entries()) {
      const sorted = [...list].sort((a, b) => {
        const fa = freqs[a] ?? 0;
        const fb = freqs[b] ?? 0;
        if (fb !== fa) return fb - fa;
        return a.localeCompare(b);
      });
      out.push([cat, sorted]);
    }
    out.sort((a, b) => {
      const ia = CATEGORY_ORDER.indexOf(a[0]);
      const ib = CATEGORY_ORDER.indexOf(b[0]);
      return ia - ib;
    });
    return out;
  }, [groupedMissing, freqs]);

  const matchedSet = React.useMemo(
    () => new Set(matched.map((m) => m.toLowerCase())),
    [matched],
  );

  function copy(text: string) {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(
      () => toast.success(`Copied "${text}"`),
      () => toast.error("Couldn't copy"),
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Keywords & skills</h3>
        {result.jd ? (
          <Badge variant="gradient" className="text-[10px]">
            {result.jd.matchPercentage}% match
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-[10px]">
            JD not provided
          </Badge>
        )}
      </div>

      {/* Skills in resume */}
      {skills.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            In your resume ({skills.length})
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {skills.slice(0, 30).map((s) => {
              const isMatched = matchedSet.has(s.toLowerCase());
              return (
                <Badge
                  key={s}
                  variant={isMatched ? "success" : "secondary"}
                  className="text-[11px]"
                >
                  {isMatched ? <Check className="mr-1 h-3 w-3" /> : null}
                  {s}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Missing keywords — grouped by category */}
      {sortedGroups.length > 0 && (
        <div className="mt-5 space-y-4">
          <p className="text-xs font-medium uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Missing keywords
          </p>
          {sortedGroups.map(([cat, list]) => (
            <div key={cat}>
              <p
                className={cn(
                  "text-[11px] font-medium uppercase tracking-wider",
                  CATEGORY_TONE[cat],
                )}
              >
                {KEYWORD_CATEGORY_LABEL[cat]} · {list.length}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {list.slice(0, 12).map((k) => {
                  const aliases = keywordAliases(k);
                  const freq = freqs[k] ?? 0;
                  return (
                    <motion.button
                      key={k}
                      type="button"
                      onClick={() => copy(k)}
                      title={
                        aliases.length
                          ? `Also matches: ${aliases.join(", ")} · click to copy`
                          : "Click to copy"
                      }
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="group inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/5 px-2.5 py-0.5 text-[11px] font-medium text-rose-700 transition-colors hover:bg-rose-500/15 dark:text-rose-300"
                    >
                      <X className="h-3 w-3" />
                      {k}
                      {freq > 1 && (
                        <span className="ml-0.5 rounded-full bg-rose-500/15 px-1 text-[9px] tabular-nums text-rose-700 dark:text-rose-300">
                          ×{freq}
                        </span>
                      )}
                      <Copy className="h-2.5 w-2.5 opacity-0 transition-opacity group-hover:opacity-60" />
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recommended skills */}
      {recommended.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-medium uppercase tracking-wider text-violet-600 dark:text-violet-400">
            Recommended to add
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {recommended.map((s) => (
              <Badge key={s} variant="gradient" className="text-[10px]">
                <Plus className="mr-1 h-3 w-3" />
                {s}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {!result.jd && (
        <p className="mt-5 rounded-lg border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
          Paste a job description on the left to see how your skills line up
          with what the role is asking for.
        </p>
      )}
    </div>
  );
}
