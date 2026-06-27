// Copies the pdfjs-dist worker into /public so we can serve it as a static
// asset (avoids Next 15 / Turbopack worker module resolution issues).
const fs = require("fs");
const path = require("path");

const SRC = path.join(
  __dirname,
  "..",
  "node_modules",
  "pdfjs-dist",
  "build",
  "pdf.worker.min.mjs",
);
const DEST = path.join(__dirname, "..", "public", "pdf.worker.min.mjs");

if (!fs.existsSync(SRC)) {
  console.warn("[copy-pdf-worker] pdfjs-dist worker not found at", SRC);
  process.exit(0);
}

fs.mkdirSync(path.dirname(DEST), { recursive: true });
fs.copyFileSync(SRC, DEST);
console.log("[copy-pdf-worker] copied →", DEST);
