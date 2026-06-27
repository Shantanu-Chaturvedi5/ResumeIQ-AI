"use client";

import { motion } from "framer-motion";
import { BarChart3, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CategoryRadar, KeywordBars, CategoryBars } from "@/components/ui/charts";
import { useAppStore } from "@/hooks/use-app-store";

export function AnalyticsPanel() {
  const result = useAppStore((s) => s.result);

  if (!result) return null;
  const { ats, jd } = result;

  const radarData = ats.categories.map((c) => ({
    label: c.label,
    score: c.score,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-border bg-card p-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-violet-500" />
          <h3 className="text-sm font-medium">Analytics</h3>
        </div>
        <Badge variant="outline" className="text-[10px]">
          Live
        </Badge>
      </div>

      {/* Radar — full width on its own row for visual breathing room */}
      <div className="mt-4 flex justify-center">
        <CategoryRadar data={radarData} size={280} />
      </div>

      {/* Per-category reason bars — easier to scan than the radar */}
      <div className="mt-6 border-t border-border pt-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Category breakdown
          </p>
          <span className="text-[10px] text-muted-foreground tabular-nums">
            {ats.categories.length} axes
          </span>
        </div>
        <CategoryBars
          className="mt-3"
          data={ats.categories.map((c) => ({
            label: c.label,
            score: c.score,
            reason: c.reason,
          }))}
        />
      </div>

      {/* Keyword bars — only when a JD was provided */}
      {jd && (jd.matchedKeywords.length > 0 || jd.missingKeywords.length > 0) && (
        <div className="mt-6 border-t border-border pt-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-violet-500" />
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              JD keyword frequency
            </p>
          </div>
          <KeywordBars
            frequencies={jd.keywordFrequencies ?? {}}
            matched={jd.matchedKeywords}
            missing={jd.missingKeywords}
            className="mt-3"
          />
        </div>
      )}
    </motion.div>
  );
}
