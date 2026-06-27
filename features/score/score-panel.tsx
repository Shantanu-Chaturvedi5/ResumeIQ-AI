"use client";

import { motion } from "framer-motion";
import { Award, Sparkles, Target, X } from "lucide-react";
import { CircularProgress, LinearProgress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import { CountUp } from "@/components/ui/count-up";
import { useAppStore } from "@/hooks/use-app-store";
import { cn } from "@/lib/utils";

function grade(score: number): { label: string; color: string } {
  if (score >= 85) return { label: "Excellent", color: "text-emerald-500" };
  if (score >= 70) return { label: "Strong", color: "text-emerald-500" };
  if (score >= 55) return { label: "Competitive", color: "text-amber-500" };
  return { label: "Needs work", color: "text-rose-500" };
}

export function ScorePanel() {
  const result = useAppStore((s) => s.result);
  const step = useAppStore((s) => s.step);

  if (step === "parsing" || step === "scoring") {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-violet-500" />
          {step === "parsing" ? "Parsing your resume…" : "Calculating ATS score…"}
        </div>
        <div className="mt-6 flex justify-center">
          <Skeleton className="h-[160px] w-[160px] rounded-full" />
        </div>
        <div className="mt-8 space-y-4">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
          <Award className="h-5 w-5" />
        </div>
        <h3 className="mt-4 text-base font-semibold">Your ATS score lives here</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Upload a resume on the left to see your score.
        </p>
      </div>
    );
  }

  const { ats } = result;
  const g = grade(ats.overall);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-border bg-card p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            ATS score
          </p>
          <p className={cn("mt-1 text-sm font-medium", g.color)}>
            {g.label}
          </p>
        </div>
        <Badge variant="gradient" className="text-[10px]">
          <Sparkles className="mr-1 h-3 w-3" />
          Live
        </Badge>
      </div>

      <div className="mt-4 flex justify-center">
        <CircularProgress value={ats.overall} size={180} strokeWidth={12} />
      </div>

      <div className="mt-8 space-y-4">
        {ats.categories.map((c) => (
          <div key={c.label}>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium">{c.label}</span>
              <span className="text-sm font-semibold tabular-nums text-foreground">
                <CountUp to={c.score} />
                <span className="text-muted-foreground">/100</span>
              </span>
            </div>
            <LinearProgress value={c.score} className="mt-1.5" />
            <p className="mt-1 text-xs text-muted-foreground">{c.reason}</p>
          </div>
        ))}
      </div>

      {ats.strengths.length > 0 && (
        <div className="mt-8 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <Target className="h-3 w-3" />
            Strengths
          </p>
          <ul className="mt-2 space-y-1 text-sm text-foreground/80">
            {ats.strengths.map((s) => (
              <li key={s} className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}
