"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { rewriteBullet, type RewriteResult } from "@/lib/score/rewriter";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface BulletRewriterDialogProps {
  /** The bullet text the user wants to improve. */
  bullet: string | null;
  /** Optional suggested keyword to weave in (e.g. a missing JD term). */
  suggestedKeyword?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BulletRewriterDialog({
  bullet,
  suggestedKeyword,
  open,
  onOpenChange,
}: BulletRewriterDialogProps) {
  const [targetKeyword, setTargetKeyword] = React.useState(suggestedKeyword ?? "");
  const [ensureMetric, setEnsureMetric] = React.useState(true);
  const [forceStrongVerb, setForceStrongVerb] = React.useState(false);
  const [result, setResult] = React.useState<RewriteResult | null>(null);

  // Recompute when the bullet or any option changes
  React.useEffect(() => {
    if (!bullet) {
      setResult(null);
      return;
    }
    setResult(
      rewriteBullet(bullet, {
        ensureMetric,
        forceStrongVerb,
        targetKeyword: targetKeyword.trim() || undefined,
      }),
    );
  }, [bullet, ensureMetric, forceStrongVerb, targetKeyword]);

  // Sync the suggested keyword when the dialog reopens with a new bullet
  React.useEffect(() => {
    if (open) setTargetKeyword(suggestedKeyword ?? "");
  }, [open, suggestedKeyword]);

  // Close on Escape
  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  function copyRewritten() {
    if (!result?.rewritten) return;
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(result.rewritten).then(
      () => toast.success("Rewritten bullet copied"),
      () => toast.error("Couldn't copy"),
    );
  }

  return (
    <AnimatePresence>
      {open && bullet && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Rewrite bullet"
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg [background-image:linear-gradient(135deg,hsl(var(--gradient-start))_0%,hsl(var(--gradient-end))_100%)] text-white">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">Rewrite bullet</h2>
                  <p className="text-xs text-muted-foreground">
                    Rule-based — runs entirely in your browser.
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-0 md:grid-cols-2">
              {/* Original */}
              <div className="border-b border-border p-5 md:border-b-0 md:border-r">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-500">
                  Original
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {bullet}
                </p>
              </div>

              {/* Rewritten */}
              <div className="p-5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500">
                  Suggested
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                  {result?.rewritten ?? bullet}
                </p>
                {result && result.changes.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {result.changes.map((c, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-xs text-muted-foreground"
                      >
                        <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                )}
                {result && result.changes.length === 0 && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    No obvious improvements — this bullet already follows best
                    practice.
                  </p>
                )}
              </div>
            </div>

            {/* Options */}
            <div className="grid gap-3 border-t border-border bg-muted/30 p-5 sm:grid-cols-[1fr_auto]">
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Target keyword (optional)
                </label>
                <Input
                  value={targetKeyword}
                  onChange={(e) => setTargetKeyword(e.target.value)}
                  placeholder="e.g. Kubernetes, PostgreSQL"
                  className="mt-1.5"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Checkbox
                  checked={ensureMetric}
                  onChange={setEnsureMetric}
                  label="Add metric placeholder"
                />
                <Checkbox
                  checked={forceStrongVerb}
                  onChange={setForceStrongVerb}
                  label="Force strong opening verb"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border px-5 py-3">
              <Badge variant="secondary" className="text-[10px]">
                Local · no API
              </Badge>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={copyRewritten}
                  className="gap-1.5"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy rewritten
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer select-none items-center gap-2 text-xs",
      )}
    >
      <span
        className={cn(
          "flex h-4 w-4 items-center justify-center rounded border transition-colors",
          checked
            ? "border-transparent bg-foreground/90 text-background"
            : "border-border bg-background",
        )}
        onClick={() => onChange(!checked)}
      >
        {checked ? <Check className="h-3 w-3" /> : null}
      </span>
      <span
        onClick={() => onChange(!checked)}
        className="text-muted-foreground"
      >
        {label}
      </span>
    </label>
  );
}
