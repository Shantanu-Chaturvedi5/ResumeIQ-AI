/**
 * Extracts plain text from a PDF (pdfjs-dist) or DOCX (mammoth) File.
 * Runs entirely in the browser — no network calls.
 */
import * as pdfjs from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api";

// Resolve the PDF.js worker once at module load. We use the `?url` style by
// writing the worker as a static asset in /public (see scripts/copy-pdf-worker.mjs
// pattern below) and pointing the workerSrc at it. This avoids bundler-specific
// worker issues across Next 15's dev/prod pipeline.

let workerReady: Promise<void> | null = null;

async function ensureWorker(): Promise<void> {
  if (typeof window === "undefined") return;
  if (pdfjs.GlobalWorkerOptions.workerSrc) return;
  if (workerReady) return workerReady;

  workerReady = (async () => {
    // Self-host: the worker is copied to /public/pdf.worker.min.mjs at build
    // time (see scripts/postinstall.cjs in this repo). If the static copy
    // doesn't exist (e.g. dev before postinstall), fall back to the bundled
    // worker via a blob URL so the app still works.
    const STATIC = "/pdf.worker.min.mjs";
    try {
      const head = await fetch(STATIC, { method: "HEAD" });
      if (head.ok) {
        pdfjs.GlobalWorkerOptions.workerSrc = STATIC;
        return;
      }
    } catch {
      /* fall through */
    }
    // Fallback: blob URL from the bundled worker module
    const url = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url" as any))
      .default as string | undefined;
    if (url) {
      pdfjs.GlobalWorkerOptions.workerSrc = url;
    }
  })();

  return workerReady;
}

export async function extractPdfText(file: File): Promise<string> {
  await ensureWorker();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  let full = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const items = content.items as TextItem[];
    // Reconstruct lines using Y-coordinate bucketing
    const lines: Record<number, { x: number; str: string }[]> = {};
    for (const it of items) {
      if (!it.str) continue;
      const y = Math.round(it.transform[5]);
      const x = it.transform[4];
      if (!lines[y]) lines[y] = [];
      lines[y].push({ x, str: it.str });
    }
    const sortedYs = Object.keys(lines)
      .map(Number)
      .sort((a, b) => b - a);
    for (const y of sortedYs) {
      const row = lines[y].sort((a, b) => a.x - b.x);
      full += row.map((r) => r.str).join(" ") + "\n";
    }
    full += "\n";
  }
  return full.trim();
}

export async function extractDocxText(file: File): Promise<string> {
  const mammoth = await import("mammoth/mammoth.browser");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}

export async function extractText(file: File): Promise<string> {
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".pdf") || file.type === "application/pdf") {
    return extractPdfText(file);
  }
  if (lower.endsWith(".docx")) {
    return extractDocxText(file);
  }
  return (await file.text()).trim();
}
