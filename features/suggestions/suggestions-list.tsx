"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, Lightbulb, Sparkles, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import { useAppStore } from "@/hooks/use-app-store";
import type { PriorityInsight, Severity, Suggestion } from "@/types/resume";
import { cn } from "@/lib/utils";
import { priorityInsights } from "@/lib/score/suggestions";
import { BulletRewriterDialog } from "@/features/rewrite/bullet-rewriter-dialog";

const SEVERITY_META: Record<
  Severity,
  { label: string; icon: React.ElementType; tone: string; bg: string }
> = {
  critical: {
    label: "Critical",
    icon: AlertTriangle,
    tone: "text-rose-600 dark:text-rose-400",
    bg: "border-rose-500/20 bg-rose-500/5",
  },
  warning: {
    label: "Should fix",
    icon: AlertTriangle,
    tone: "text-amber-600 dark:text-amber-400",
    bg: "border-amber-500/20 bg-amber-500/5",
  },
  info: {
    label: "Polish",
    icon: Info,
    tone: "text-sky-600 dark:text-sky-400",
    bg: "border-sky-500/20 bg-sky-500/5",
  },
};

export function SuggestionsList() {
  const result = useAppStore((s) => s.result);
  const step = useAppStore((s) => s.step);

  if (step === "parsing" || step === "scoring") {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!result || result.suggestions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
          <Lightbulb className="h-5 w-5" />
        </div>
        <h3 className="mt-4 text-base font-semibold">Suggestions will land here</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Once we analyze your resume, we'll show specific improvements you can
          apply in minutes.
        </p>
      </div>
    );
  }

  // Group by severity
  const groups: Severity[] = ["critical", "warning", "info"];
  const grouped = groups
    .map((g) => ({ g, items: result.suggestions.filter((s) => s.severity === g) }))
    .filter((x) => x.items.length > 0);

  const insights = priorityInsights(result.parsed, result.ats, result.jd);

  return (
    <div className="space-y-6">
      {/* Top 3 quick wins */}
      {insights.length > 0 && <QuickWins insights={insights} />}

      {/* Grouped suggestions */}
      {grouped.map(({ g, items }) => {
        const meta = SEVERITY_META[g];
        return (
          <section key={g}>
            <div className="mb-3 flex items-center gap-2">
              <h3 className={cn("text-xs font-semibold uppercase tracking-wider", meta.tone)}>
                {meta.label}
              </h3>
              <span className="text-xs text-muted-foreground">· {items.length}</span>
            </div>
            <ul className="space-y-3">
              {items.map((s, i) => (
                <SuggestionCard key={s.id} suggestion={s} index={i} />
              ))}
            </ul>
          </section>
        );
      })}

      {result.suggestions.length > 0 && (
        <div className="rounded-xl border border-border bg-gradient-to-br from-violet-500/5 to-cyan-500/5 p-4 text-sm text-muted-foreground">
          <p className="flex items-center gap-2 font-medium text-foreground">
            <Sparkles className="h-4 w-4 text-violet-500" />
            Apply the critical fixes first
          </p>
          <p className="mt-1 text-xs">
            Each one typically adds 3–8 points to your ATS score.
          </p>
        </div>
      )}
    </div>
  );
}

function QuickWins({ insights }: { insights: PriorityInsight[] }) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-violet-500" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
          Top quick wins
        </h3>
        <span className="text-xs text-muted-foreground">· {insights.length}</span>
      </div>
      <ul className="space-y-3">
        {insights.map((ins, i) => (
          <motion.li
            key={ins.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="group relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 via-card to-cyan-500/5 p-5"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg [background-image:linear-gradient(135deg,hsl(var(--gradient-start))_0%,hsl(var(--gradient-end))_100%)] text-white">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold tracking-tight">
                    {ins.title}
                  </h4>
                  <Badge variant="gradient" className="text-[10px] tabular-nums">
                    +{ins.expectedUplift} pts
                  </Badge>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {ins.action}
                </p>
                <p className="mt-2 text-xs text-muted-foreground/80">
                  <span className="font-medium text-foreground/80">Why:</span> {ins.reason}
                </p>
              </div>
            </div>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}

function SuggestionCard({ suggestion, index }: { suggestion: Suggestion; index: number }) {
  const meta = SEVERITY_META[suggestion.severity];
  const Icon = meta.icon;
  const [open, setOpen] = React.useState(false);
  const [bullet, setBullet] = React.useState<string | null>(null);

  // Select the stable reference (the result object itself) and derive
  // allBullets here. Putting `.flatMap(...)` inside the selector would
  // return a fresh array on every store read, which trips Zustand's
  // "getSnapshot should be cached" warning and loops forever.
  const result = useAppStore((s) => s.result);
  const allBullets = React.useMemo(
    () => result?.parsed.experience.flatMap((e) => e.bullets) ?? [],
    [result],
  );

  // Pick a bullet the user can rewrite — try the first bullet that starts
  // with a weak verb, otherwise any bullet, otherwise the example string.
  const candidate = React.useMemo(() => {
    return (
      allBullets.find((b) => {
        const first = b.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^\w]/g, "");
        return first && ["worked", "helped", "did", "made", "responsible", "handled"].includes(first);
      }) ?? allBullets[0] ?? suggestion.example ?? null
    );
  }, [allBullets, suggestion.id, suggestion.example]);

  function openRewrite() {
    if (!candidate) return;
    setBullet(candidate);
    setOpen(true);
  }

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className={cn(
        "group rounded-2xl border bg-card p-5 transition-colors hover:border-foreground/20",
        meta.bg
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
          <Icon className={cn("h-3.5 w-3.5", meta.tone)} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold tracking-tight">
              {suggestion.title}
            </h4>
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-[10px] capitalize">
                {suggestion.category}
              </Badge>
              {candidate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openRewrite}
                  className="h-7 gap-1 px-2 text-xs"
                  title="Rewrite one of your bullets with this suggestion"
                >
                  <Wand2 className="h-3 w-3" />
                  Rewrite
                </Button>
              )}
            </div>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {suggestion.detail}
          </p>
          {suggestion.example && (
            <div className="mt-3 rounded-lg border border-border bg-background/60 p-3 text-xs">
              <p className="font-mono text-muted-foreground">
                <span className="select-none text-rose-400/80">– </span>
                {suggestion.example.replace(/^\+\s*/, "")}
              </p>
            </div>
          )}
        </div>
      </div>

      <BulletRewriterDialog
        bullet={bullet}
        open={open}
        onOpenChange={setOpen}
      />
    </motion.li>
  );
}
