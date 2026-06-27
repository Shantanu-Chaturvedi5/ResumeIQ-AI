"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Download, Sparkles } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { ResumeDropzone } from "@/features/upload/resume-dropzone";
import { ResumePreview } from "@/features/upload/resume-preview";
import { JdPanel } from "@/features/jd/jd-panel";
import { ScorePanel } from "@/features/score/score-panel";
import { KeywordPanel } from "@/features/keywords/keyword-panel";
import { SuggestionsList } from "@/features/suggestions/suggestions-list";
import { AnalyticsPanel } from "@/features/analytics/analytics-panel";
import { ResumeSnapshotCard } from "@/features/snapshot/resume-snapshot-card";
import { SavedIndicator } from "@/components/saved-indicator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/hooks/use-app-store";
import { extractText } from "@/lib/parse/extract-text";
import { parseResume } from "@/lib/parse/parse-resume";
import { scoreResume } from "@/lib/score/ats-score";
import { matchJd } from "@/lib/score/jd-match";
import { generateSuggestions, buildAnalysis } from "@/lib/score/suggestions";
import { buildReport, suggestReportFilename } from "@/lib/report/build-report";
import {
  DEMO_RESUME_FILENAME,
  DEMO_RESUME_TEXT,
  DEMO_JD_TEXT,
} from "@/lib/demo-resume";
import { toast } from "sonner";

export default function AnalyzerPage() {
  return (
    <React.Suspense fallback={null}>
      <AnalyzerPageInner />
    </React.Suspense>
  );
}

/**
 * Reads `?demo=1` from the URL and, if present, primes the store with the
 * bundled sample resume + job description so the user lands directly on a
 * fully-populated report instead of an empty analyzer.
 */
function DemoLoader() {
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "1";
  const loadDemo = useAppStore((s) => s.loadDemo);
  const step = useAppStore((s) => s.step);
  const demoMode = useAppStore((s) => s.demoMode);
  const reset = useAppStore((s) => s.reset);

  React.useEffect(() => {
    if (!isDemo) return;
    if (demoMode && step === "ready") return;
    try {
      const parsed = parseResume(DEMO_RESUME_TEXT);
      const ats = scoreResume(parsed);
      const jd = matchJd(parsed, DEMO_JD_TEXT);
      const suggestions = generateSuggestions(parsed, ats, jd);
      loadDemo({
        fileName: DEMO_RESUME_FILENAME,
        parsed,
        ats,
        suggestions,
        jdText: DEMO_JD_TEXT,
        jd,
      });
      toast.success("Demo loaded", {
        description: `Score ${ats.overall}/100 · ${suggestions.length} suggestions`,
      });
    } catch (err: any) {
      console.error(err);
      toast.error("Couldn't load the demo", {
        description: err?.message ?? "Please refresh and try again.",
      });
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemo]);

  return null;
}

function AnalyzerPageInner() {
  const fileName = useAppStore((s) => s.fileName);
  const fileType = useAppStore((s) => s.fileType);
  const fileSize = useAppStore((s) => s.fileSize);
  const previewText = useAppStore((s) => s.previewText);
  const result = useAppStore((s) => s.result);
  const jdText = useAppStore((s) => s.jdText);
  const step = useAppStore((s) => s.step);
  const setFile = useAppStore((s) => s.setFile);
  const setStep = useAppStore((s) => s.setStep);
  const setProgress = useAppStore((s) => s.setProgress);
  const setParsed = useAppStore((s) => s.setParsed);
  const setResult = useAppStore((s) => s.setResult);
  const setError = useAppStore((s) => s.setError);
  const reset = useAppStore((s) => s.reset);

  const isProcessing = step === "parsing" || step === "scoring";

  const handleFile = React.useCallback(
    async (file: File) => {
      const isPdf =
        file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      const isDocx = file.name.toLowerCase().endsWith(".docx");
      if (!isPdf && !isDocx) {
        toast.error("Unsupported file", {
          description: "Please upload a PDF or DOCX file.",
        });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large", { description: "Maximum size is 10MB." });
        return;
      }

      try {
        setStep("parsing");
        setProgress(15);
        setError(null);
        setResult(null);
        setParsed(null);
        const text = await extractText(file);
        setProgress(55);
        const parsed = parseResume(text);
        setParsed(parsed);
        setFile({
          name: file.name,
          type: isPdf ? "pdf" : "docx",
          size: file.size,
          previewText: text,
        });

        setStep("scoring");
        setProgress(75);
        const ats = scoreResume(parsed);

        const jd = jdText.trim().length > 30
          ? matchJd(parsed, jdText)
          : undefined;

        setProgress(90);
        const suggestions = generateSuggestions(parsed, ats, jd);
        const analysis = buildAnalysis(parsed, ats, suggestions, jd);
        setResult(analysis);
        setProgress(100);
        setStep("ready");
        toast.success("Analysis complete", {
          description: `Score ${ats.overall}/100 · ${suggestions.length} suggestion${suggestions.length === 1 ? "" : "s"}`,
        });
      } catch (err: any) {
        console.error(err);
        setError(err?.message ?? "Failed to parse resume");
        setStep("idle");
        toast.error("Could not parse this file", {
          description: err?.message ?? "Try a different PDF or DOCX.",
        });
      }
    },
    [jdText, setError, setFile, setParsed, setProgress, setResult, setStep],
  );

  // Re-run JD match when the user updates the JD after the resume is loaded.
  React.useEffect(() => {
    if (step !== "ready" || !result) return;
    if (jdText.trim().length < 30) {
      if (result.jd) {
        setResult({ ...result, jd: undefined });
      }
      return;
    }
    if (!jdText.trim()) return;
    const jd = matchJd(result.parsed, jdText);
    if (
      jd.matchPercentage === result.jd?.matchPercentage &&
      jd.missingKeywords.length === result.jd?.missingKeywords.length
    ) {
      return;
    }
    const suggestions = generateSuggestions(result.parsed, result.ats, jd);
    setResult({ ...result, jd, suggestions });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jdText]);

  const handleDownload = React.useCallback(() => {
    if (!result) return;
    try {
      const md = buildReport(result);
      const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = suggestReportFilename(fileName);
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("Report downloaded", {
        description: "Markdown report saved to your downloads folder.",
      });
    } catch (err: any) {
      console.error(err);
      toast.error("Couldn't download report", {
        description: err?.message ?? "Try again or copy to clipboard instead.",
      });
    }
  }, [result, fileName]);

  const handleCopy = React.useCallback(async () => {
    if (!result) return;
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      toast.error("Clipboard not available in this browser");
      return;
    }
    try {
      const md = buildReport(result);
      await navigator.clipboard.writeText(md);
      toast.success("Report copied to clipboard", {
        description: `${md.length.toLocaleString()} characters · paste anywhere`,
      });
    } catch (err: any) {
      console.error(err);
      toast.error("Couldn't copy report", {
        description: err?.message ?? "Your browser may have blocked clipboard access.",
      });
    }
  }, [result]);

  return (
    <>
      <DemoLoader />
      <Navbar />
      <main className="container pt-24 pb-24">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Badge variant="outline" className="mb-3 text-[10px]">
              Analyzer
            </Badge>
            <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
              Score your resume against the role.
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Upload your resume, optionally paste a job description, and get
              a full ATS report in seconds — parsed and scored in your browser.
            </p>
            <div className="mt-3">
              <SavedIndicator />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {result && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="gap-1.5"
                  aria-label="Copy report to clipboard"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy report
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="gap-1.5"
                  aria-label="Download Markdown report"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download .md
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={reset}
                  title="Clear the current report and remove any saved data from this browser"
                >
                  Start over
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          {/* LEFT PANEL */}
          <div className="space-y-6">
            <section>
              <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                1. Upload resume
              </h2>
              <ResumeDropzone
                fileName={fileName}
                fileType={fileType}
                fileSize={fileSize}
                onFile={handleFile}
                onClear={reset}
                disabled={isProcessing}
              />
            </section>

            <section>
              <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                2. Job description
              </h2>
              <JdPanel />
            </section>

            <AnimatePresence>
              {previewText && (
                <motion.section
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                    3. Extracted text
                  </h2>
                  <ResumePreview text={previewText} />
                </motion.section>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT PANEL */}
          <div className="space-y-6">
            <AnimatePresence>
              {result && (
                <motion.section
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                    Parsed snapshot
                  </h2>
                  <ResumeSnapshotCard />
                </motion.section>
              )}
            </AnimatePresence>

            <section>
              <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                <Sparkles className="mr-1.5 inline h-3.5 w-3.5 text-violet-500" />
                ATS Report
              </h2>
              <ScorePanel />
            </section>

            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <section>
                    <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                      Keywords
                    </h2>
                    <KeywordPanel />
                  </section>
                  <section>
                    <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                      Analytics
                    </h2>
                    <AnalyticsPanel />
                  </section>
                  <section>
                    <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                      Suggestions
                    </h2>
                    <SuggestionsList />
                  </section>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </>
  );
}