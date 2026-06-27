"use client";

import { useAppStore } from "@/hooks/use-app-store";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, X } from "lucide-react";

export function JdPanel() {
  const jdText = useAppStore((s) => s.jdText);
  const setJdText = useAppStore((s) => s.setJdText);
  const parsed = useAppStore((s) => s.parsed);
  const result = useAppStore((s) => s.result);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Job description</span>
          <Badge variant="outline" className="text-[10px]">
            Optional
          </Badge>
        </div>
        {result?.jd && (
          <Badge variant="gradient" className="text-[10px]">
            {result.jd.matchPercentage}% match
          </Badge>
        )}
      </div>

      <Textarea
        value={jdText}
        onChange={(e) => setJdText(e.target.value)}
        placeholder="Paste the full job description here. We'll extract skills, tools, and key phrases to compare against your resume."
        className="mt-3 min-h-[160px] font-mono text-xs"
        disabled={!parsed}
      />

      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {jdText.length.toLocaleString()} characters
          {jdText.length > 0 && jdText.length < 200 && (
            <span className="ml-2 text-amber-500">
              · A few more lines will help matching
            </span>
          )}
        </p>
        {jdText.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setJdText("")}
            className="gap-1"
          >
            <X className="h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      {!parsed && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-violet-500" />
          Upload a resume first to enable JD matching.
        </div>
      )}
    </div>
  );
}
