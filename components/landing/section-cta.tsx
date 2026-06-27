"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Cta() {
  return (
    <section className="border-t border-border/60 py-24 md:py-32">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl border border-border bg-card p-10 text-center md:p-16"
        >
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-32 left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,hsl(var(--gradient-start)/0.25),transparent_60%)]" />
            <div className="absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
          </div>

          <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-5xl">
            Ready to see what an ATS sees?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
            Drop in your resume. Get a score, a JD match, and a punch list of
            fixes — in under 30 seconds.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="xl" variant="gradient" className="group">
              <Link href="/analyzer">
                <Upload className="h-4 w-4" />
                Upload Resume
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
