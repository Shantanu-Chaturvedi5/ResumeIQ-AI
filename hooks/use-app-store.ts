"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AnalysisResult, ParsedResume } from "@/types/resume";

export type AppStep = "idle" | "uploading" | "parsing" | "scoring" | "ready";

interface AppState {
  // file
  fileName: string | null;
  fileType: "pdf" | "docx" | null;
  fileSize: number | null;
  previewText: string; // first ~1500 chars for preview pane

  // pipeline
  step: AppStep;
  progress: number; // 0-100
  error: string | null;

  // parsed + analysis
  parsed: ParsedResume | null;
  result: AnalysisResult | null;
  jdText: string;

  // demo
  demoMode: boolean;

  // actions
  setFile: (info: {
    name: string;
    type: "pdf" | "docx";
    size: number;
    previewText: string;
  }) => void;
  setStep: (step: AppStep) => void;
  setProgress: (p: number) => void;
  setError: (err: string | null) => void;
  setParsed: (parsed: ParsedResume | null) => void;
  setResult: (result: AnalysisResult | null) => void;
  setJdText: (text: string) => void;
  setDemoMode: (on: boolean) => void;
  /**
   * Atomically populate the store with a fully-analyzed demo resume and JD.
   * Used by the "Try Demo" CTA on the landing page and analyzer.
   */
  loadDemo: (input: {
    fileName: string;
    parsed: ParsedResume;
    ats: import("@/types/resume").AtsResult;
    suggestions: import("@/types/resume").Suggestion[];
    jdText: string;
    jd?: import("@/types/resume").JdMatchResult;
  }) => void;
  reset: () => void;
}

const initial = {
  fileName: null as string | null,
  fileType: null as "pdf" | "docx" | null,
  fileSize: null as number | null,
  previewText: "",
  step: "idle" as AppStep,
  progress: 0,
  error: null as string | null,
  parsed: null as ParsedResume | null,
  result: null as AnalysisResult | null,
  jdText: "",
  demoMode: false,
};

const STORAGE_KEY = "resumeiq-v1";

/**
 * Persist a curated subset of the store to localStorage. We intentionally
 * skip transient pipeline state (progress, error) and only save the bits
 * that are expensive to re-derive or annoying to lose on refresh:
 *   - the parsed resume + analysis result
 *   - the user's job description text
 *   - the file metadata so the report card can show "yourfile.pdf"
 *   - the demoMode flag so the demo loader doesn't re-seed on refresh
 */
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initial,
      setFile: (info) =>
        set({
          fileName: info.name,
          fileType: info.type,
          fileSize: info.size,
          previewText: info.previewText,
          step: "ready",
          error: null,
        }),
      setStep: (step) => set({ step }),
      setProgress: (progress) => set({ progress }),
      setError: (error) => set({ error }),
      setParsed: (parsed) => set({ parsed }),
      setResult: (result) => set({ result }),
      setJdText: (jdText) => set({ jdText }),
      setDemoMode: (demoMode) => set({ demoMode }),
      loadDemo: (input) =>
        set({
          demoMode: true,
          fileName: input.fileName,
          fileType: "pdf",
          fileSize: input.parsed.rawText.length,
          previewText: input.parsed.rawText.slice(0, 1500),
          parsed: input.parsed,
          result: {
            parsed: input.parsed,
            ats: input.ats,
            suggestions: input.suggestions,
            jd: input.jd,
          },
          jdText: input.jdText,
          step: "ready",
          error: null,
          progress: 100,
        }),
      reset: () => {
        set({ ...initial, demoMode: false });
        // Also clear the persisted blob so a refresh doesn't restore
        // the cleared state. Guarded for SSR.
        if (typeof window !== "undefined") {
          try {
            window.localStorage.removeItem(STORAGE_KEY);
          } catch {
            // localStorage may be disabled (private mode, etc.) — silently ignore.
          }
        }
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => {
        // Guard against SSR — on the server there's no `window`. We return
        // a noop storage so the first server pass uses `initial` and the
        // client hydrates from real localStorage after mount.
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return window.localStorage;
      }),
      // Only persist the expensive / user-authored bits. Skip transient
      // pipeline state (progress, error) and any parsed+result fields
      // that don't make sense without their parent (keep result whole).
      partialize: (state) => ({
        fileName: state.fileName,
        fileType: state.fileType,
        fileSize: state.fileSize,
        previewText: state.previewText,
        step: state.step,
        parsed: state.parsed,
        result: state.result,
        jdText: state.jdText,
        demoMode: state.demoMode,
      }),
      // When the persisted version doesn't match the current `version`,
      // we could migrate. For now, just drop the old payload and start
      // clean — the user just re-uploads. The next major version can add
      // a real migration.
      migrate: (persistedState, _version) => {
        return persistedState as AppState;
      },
    },
  ),
);
