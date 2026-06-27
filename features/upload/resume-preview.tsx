"use client";

import { motion } from "framer-motion";
import { SkeletonLines } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export function ResumePreview({ text }: { text: string }) {
  const lines = text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Preview</span>
          <Badge variant="secondary" className="text-[10px]">
            Extracted text
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {text.length.toLocaleString()} chars
        </span>
      </div>
      <div className="max-h-[420px] overflow-y-auto p-5 text-sm leading-relaxed text-muted-foreground">
        {lines.length === 0 ? (
          <div className="space-y-3">
            <SkeletonLines lines={2} />
            <SkeletonLines lines={4} />
            <SkeletonLines lines={3} />
            <SkeletonLines lines={5} />
          </div>
        ) : (
          <motion.pre
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="whitespace-pre-wrap font-sans"
          >
            {lines.slice(0, 200).join("\n")}
            {lines.length > 200 && (
              <span className="block pt-2 text-xs italic text-muted-foreground/60">
                … {lines.length - 200} more lines
              </span>
            )}
          </motion.pre>
        )}
      </div>
    </div>
  );
}
