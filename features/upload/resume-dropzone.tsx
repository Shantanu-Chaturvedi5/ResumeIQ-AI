"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, FileText, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ResumeDropzoneProps {
  fileName?: string | null;
  fileType?: "pdf" | "docx" | null;
  fileSize?: number | null;
  onFile: (file: File) => void;
  onClear?: () => void;
  disabled?: boolean;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const ACCEPT = ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export function ResumeDropzone({
  fileName,
  fileType,
  fileSize,
  onFile,
  onClear,
  disabled,
}: ResumeDropzoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isOver, setIsOver] = React.useState(false);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const isDocx = file.name.toLowerCase().endsWith(".docx");
    if (!isPdf && !isDocx) {
      // Soft reject; parent can show a toast
      return;
    }
    onFile(file);
  }

  const hasFile = !!fileName;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border-2 border-dashed transition-colors",
        isOver ? "border-foreground/40 bg-accent/40" : "border-border bg-card/40 hover:bg-card/60",
        hasFile && "border-solid border-border bg-card"
      )}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsOver(false);
        if (!disabled) handleFiles(e.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
        disabled={disabled}
      />

      {hasFile ? (
        <div className="flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium">{fileName}</p>
              <Badge variant="success" className="gap-1 text-[10px]">
                <CheckCircle2 className="h-3 w-3" />
                Loaded
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {fileType?.toUpperCase()} · {fileSize ? formatSize(fileSize) : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
            >
              Replace
            </Button>
            {onClear && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onClear}
                aria-label="Remove file"
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="block w-full p-8 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          <div className="flex flex-col items-center text-center">
            <motion.div
              animate={{ y: isOver ? -3 : 0 }}
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-background"
            >
              <Upload className="h-5 w-5" />
            </motion.div>
            <p className="mt-4 text-sm font-medium">
              Drop your resume here, or{" "}
              <span className="underline underline-offset-4">browse</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              PDF or DOCX · up to 10MB · parsed locally
            </p>
          </div>
        </button>
      )}
    </div>
  );
}
