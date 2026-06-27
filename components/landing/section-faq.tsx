"use client";

import { Disclosure } from "@/components/ui/tabs";

const FAQS = [
  {
    q: "What is an ATS, exactly?",
    a: "An Applicant Tracking System is software recruiters use to filter, rank, and route resumes before a human ever sees them. Most large companies and almost every Fortune 500 use one. ResumeIQ mimics the signals those systems care about — keyword match, structure, contact info, section ordering, formatting — so you can see what a recruiter's tool sees.",
  },
  {
    q: "Is my resume uploaded to a server?",
    a: "No. ResumeIQ parses and scores your resume entirely in your browser. Nothing is uploaded, logged, or stored. You can verify this in your network tab — there are zero outbound requests during analysis.",
  },
  {
    q: "What's a good ATS score?",
    a: "Above 80 is strong, 70–80 is competitive, 60–70 needs work, and below 60 will struggle to clear most filters. The score is a starting point — the per-category breakdown and the suggestions are where the real value is.",
  },
  {
    q: "What file types are supported?",
    a: "PDF and DOCX. Both are parsed locally. Image-based PDFs (scanned resumes) aren't supported because there's no text to extract — export your resume as a real PDF from Word, Google Docs, or LaTeX.",
  },
  {
    q: "How does job description matching work?",
    a: "We extract the skills, tools, and key phrases from the JD and compare them to the skills and language in your resume. The match percentage reflects how much overlap there is, and the missing keywords list tells you exactly what to add.",
  },
  {
    q: "Will this rewrite my resume?",
    a: "Not in v1 — ResumeIQ gives you specific, copy-pasteable suggestions and before/after examples, but the actual writing is yours. AI-powered rewriting is on the roadmap.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="border-t border-border/60 py-24 md:py-32">
      <div className="container max-w-3xl">
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            FAQ
          </p>
          <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            Questions, answered.
          </h2>
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-card p-6 md:p-8">
          {FAQS.map((f, i) => (
            <Disclosure
              key={f.q}
              defaultOpen={i === 0}
              title={f.q}
            >
              {f.a}
            </Disclosure>
          ))}
        </div>
      </div>
    </section>
  );
}
