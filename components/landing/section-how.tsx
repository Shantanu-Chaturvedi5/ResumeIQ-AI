"use client";

import { motion } from "framer-motion";
import { ClipboardList, FileSearch, LineChart, UploadCloud } from "lucide-react";

const STEPS = [
  {
    n: "01",
    icon: UploadCloud,
    title: "Upload your resume",
    body: "Drag in a PDF or DOCX. Parsing happens on your device — we never see it.",
  },
  {
    n: "02",
    icon: FileSearch,
    title: "We score it like an ATS would",
    body: "Skills, formatting, experience, education, and keywords are checked in under 30 seconds.",
  },
  {
    n: "03",
    icon: ClipboardList,
    title: "Paste a job description",
    body: "Optional but powerful. We compare your resume against the role and surface the gaps.",
  },
  {
    n: "04",
    icon: LineChart,
    title: "Apply the fixes",
    body: "Ship the suggestions, re-upload, and watch your score climb.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative border-t border-border/60 py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-dot opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      </div>
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            How it works
          </p>
          <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            Four steps.{" "}
            <span className="gradient-text">No guesswork.</span>
          </h2>
        </div>

        <div className="relative mt-16">
          {/* Connector line */}
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-border via-border to-transparent md:block" />

          <ol className="space-y-12 md:space-y-20">
            {STEPS.map((s, i) => (
              <motion.li
                key={s.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className={`grid items-center gap-8 md:grid-cols-2 ${
                  i % 2 === 1 ? "md:[&>div:first-child]:order-2" : ""
                }`}
              >
                <div className="relative">
                  <div className="absolute -left-3 top-1/2 hidden h-px w-12 bg-border md:block" />
                  <div className="glass rounded-2xl border border-border p-6">
                    <div className="text-xs font-mono text-muted-foreground">
                      STEP {s.n}
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl [background-image:linear-gradient(135deg,hsl(var(--gradient-start))_0%,hsl(var(--gradient-end))_100%)] text-white">
                        <s.icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-semibold tracking-tight">
                        {s.title}
                      </h3>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {s.body}
                    </p>
                  </div>
                </div>
                <div className="hidden md:block" />
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
