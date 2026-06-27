"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, FileText, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CircularProgress } from "@/components/ui/progress";
import { CountUp } from "@/components/ui/count-up";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32">
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid opacity-[0.35] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="absolute -top-40 left-1/2 h-[600px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,hsl(var(--gradient-start)/0.18),transparent_60%)]" />
        <div className="absolute top-20 right-[-10%] h-[400px] w-[700px] rounded-full bg-[radial-gradient(ellipse_at_center,hsl(var(--gradient-end)/0.18),transparent_60%)]" />
      </div>

      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <Badge variant="outline" className="mb-6 gap-1.5 rounded-full px-3 py-1 text-xs">
            <Sparkles className="h-3 w-3 text-violet-500" />
            Local-first · No resume leaves your browser
          </Badge>

          <h1 className="text-balance text-5xl font-semibold tracking-tight md:text-7xl">
            Beat the ATS.
            <br />
            <span className="gradient-text">Land the interview.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground leading-relaxed">
            ResumeIQ scores your resume against real applicant-tracking
            systems, matches it to any job description, and tells you exactly
            what to fix — in under 30 seconds.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="xl" variant="gradient" className="group">
              <Link href="/analyzer">
                <Upload className="h-4 w-4" />
                Upload Resume
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline">
              <Link href="/analyzer?demo=1">
                <FileText className="h-4 w-4" />
                Try the demo
              </Link>
            </Button>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Free · No sign-up · PDF & DOCX supported
          </p>
        </motion.div>

        {/* Hero product preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto mt-20 max-w-5xl"
        >
          <div className="gradient-border overflow-hidden shadow-2xl shadow-violet-500/10">
            <div className="rounded-[calc(var(--radius)-1px)] bg-card">
              {/* Window chrome */}
              <div className="flex items-center gap-1.5 border-b border-border bg-muted/30 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                <div className="ml-4 flex-1 text-center text-xs text-muted-foreground">
                  resumeiq.ai/analyzer
                </div>
              </div>

              <div className="grid gap-px bg-border md:grid-cols-2">
                {/* Left panel mock */}
                <div className="bg-card p-6 md:p-8">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Resume parsed · 1.2s
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="h-4 w-2/3 rounded bg-muted" />
                    <div className="h-3 w-1/2 rounded bg-muted" />
                    <div className="h-3 w-3/5 rounded bg-muted" />
                    <div className="mt-6 space-y-2">
                      <div className="h-2.5 w-full rounded bg-muted" />
                      <div className="h-2.5 w-11/12 rounded bg-muted" />
                      <div className="h-2.5 w-4/5 rounded bg-muted" />
                    </div>
                    <div className="mt-6 flex flex-wrap gap-1.5">
                      {["React", "TypeScript", "Node.js", "PostgreSQL", "AWS"].map((s) => (
                        <span
                          key={s}
                          className="rounded-full border border-border bg-background px-2.5 py-0.5 text-[10px] font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right panel mock — score */}
                <div className="relative bg-gradient-to-br from-card to-muted/30 p-6 md:p-8">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        ATS Score
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Strong match for the role
                      </p>
                      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                        <Stat label="Skills" value={92} />
                        <Stat label="Keywords" value={87} />
                        <Stat label="Formatting" value={95} />
                        <Stat label="Experience" value={84} />
                      </div>
                    </div>
                    <CircularProgress value={88} size={140} strokeWidth={10} />
                  </div>

                  <div className="mt-6 rounded-lg border border-border bg-background/50 p-3 text-xs text-muted-foreground">
                    <span className="text-emerald-500">↑ 24 points</span>{" "}
                    after applying suggestions
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating chips */}
          <motion.div
            initial={{ opacity: 0, y: 20, x: -20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="absolute -left-4 top-20 hidden rounded-xl border border-border bg-card/90 p-3 shadow-xl backdrop-blur md:flex"
          >
            <div className="flex items-center gap-2 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="font-medium">
                <CountUp to={98} className="tabular-nums" />%
              </span>
              <span className="text-muted-foreground">skills match</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="absolute -right-4 top-44 hidden rounded-xl border border-border bg-card/90 p-3 shadow-xl backdrop-blur md:flex"
          >
            <div className="flex items-center gap-2 text-xs">
              <Sparkles className="h-3 w-3 text-violet-500" />
              <span className="font-medium">3 quick wins found</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Trust strip */}
        <div className="mt-20 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Trusted by candidates applying to
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-60">
            {["Google", "Stripe", "Linear", "Vercel", "Notion", "Figma"].map((b) => (
              <span
                key={b}
                className="text-base font-semibold tracking-tight text-muted-foreground"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm font-semibold tabular-nums">{value}</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full [background-image:linear-gradient(90deg,hsl(var(--gradient-start))_0%,hsl(var(--gradient-end))_100%)]"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
