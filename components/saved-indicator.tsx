"use client";

import * as React from "react";
import { Cloud } from "lucide-react";
import { useAppStore } from "@/hooks/use-app-store";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";

/**
 * Subtle "Saved · just now / 2 min ago" indicator for the analyzer header.
 * Renders nothing on the server / before hydration, so it never causes a
 * hydration mismatch.
 */
export function SavedIndicator({ className }: { className?: string }) {
  const mounted = useMounted();
  const result = useAppStore((s) => s.result);
  const demoMode = useAppStore((s) => s.demoMode);
  const [savedAt, setSavedAt] = React.useState<number | null>(null);
  const [, force] = React.useReducer((x) => x + 1, 0);

  // Whenever the result changes, bump the "saved at" timestamp.
  // We also start a ticker so the "ago" label refreshes every 30s.
  React.useEffect(() => {
    if (!mounted) return;
    if (!result) {
      setSavedAt(null);
      return;
    }
    setSavedAt(Date.now());
    const id = setInterval(() => force(), 30_000);
    return () => clearInterval(id);
  }, [mounted, result]);

  if (!mounted) return null;
  if (!result || !savedAt) return null;

  const ago = formatAgo(savedAt);
  const label = demoMode ? "Demo loaded" : "Saved";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs text-muted-foreground",
        className,
      )}
      title={`${label} locally in your browser`}
    >
      <Cloud className="h-3.5 w-3.5 text-emerald-500" />
      {label}
      <span aria-hidden="true">·</span>
      <span className="tabular-nums">{ago}</span>
    </span>
  );
}

function formatAgo(ts: number): string {
  const seconds = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}
