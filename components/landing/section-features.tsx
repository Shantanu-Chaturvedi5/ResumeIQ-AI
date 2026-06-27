"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Gauge,
  Lock,
  Sparkles,
  Target,
  Wand2,
} from "lucide-react";

const FEATURES = [
  {
    icon: Gauge,
    title: "Real ATS scoring",
    body: "A 0–100 score based on skills, formatting, experience, education, and keywords — the way real applicant-tracking systems do it.",
  },
  {
    icon: Target,
    title: "Job description matching",
    body: "Paste any JD. We surface the missing keywords, recommended skills, and how close you are to a confident match.",
  },
  {
    icon: Brain,
    title: "Actionable suggestions",
    body: "Specific improvements to your bullet points, verbs, and structure — not generic advice.",
  },
  {
    icon: Wand2,
    title: "Rewrite-ready examples",
    body: "Every suggestion includes a concrete before/after so you can copy, edit, and ship.",
  },
  {
    icon: Lock,
    title: "100% local",
    body: "Your resume never leaves your browser. Parsing, scoring, and matching run on your device.",
  },
  {
    icon: Sparkles,
    title: "Built for speed",
    body: "Under 30 seconds from upload to a full report. Skeleton loaders keep the experience snappy.",
  },
];

export function Features() {
  return (
    <section id="features" className="border-t border-border/60 py-24 md:py-32">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Features
          </p>
          <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            Everything an ATS checks.{" "}
            <span className="gradient-text">Nothing you don't need.</span>
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            A focused toolkit, not a 14-tab dashboard.
          </p>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.5,
                delay: i * 0.05,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-foreground/20"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                <f.icon className="h-5 w-5 text-foreground" />
              </div>
              <h3 className="mt-5 text-lg font-semibold tracking-tight">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.body}
              </p>
              <div className="pointer-events-none absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-[radial-gradient(ellipse_at_center,hsl(var(--gradient-start)/0.15),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
