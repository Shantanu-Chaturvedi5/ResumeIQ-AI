"use client";

import * as React from "react";
import { motion, useMotionValue, animate, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// CategoryRadar — five-axis radar chart for the ATS category scores.
// Pure SVG, animated path drawing, dark/light aware.
// ---------------------------------------------------------------------------

interface CategoryRadarProps {
  /** Each entry: label and a 0–100 score. */
  data: Array<{ label: string; score: number; color?: string }>;
  size?: number;
  className?: string;
}

export function CategoryRadar({
  data,
  size = 280,
  className,
}: CategoryRadarProps) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 36;
  const n = data.length;
  // 0-100 value -> radius fraction
  const maxScore = 100;

  // Animated path drawing
  const progress = useMotionValue(0);
  React.useEffect(() => {
    const controls = animate(progress, 1, {
      duration: 1.0,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [progress]);

  // Compute polygon point for a given axis and value
  const point = (i: number, value: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2; // start at top
    const r = (value / maxScore) * radius;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  // Background rings (25/50/75/100)
  const rings = [0.25, 0.5, 0.75, 1];

  // Polygon points (animated)
  const animatedPath = useTransform(progress, (p) => {
    const pts = data.map((d, i) => point(i, d.score * p));
    return pts.map((p) => `${p.x},${p.y}`).join(" ");
  });

  // Axis lines
  const axes = data.map((_, i) => {
    const end = point(i, maxScore);
    return { x1: cx, y1: cy, x2: end.x, y2: end.y };
  });

  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="overflow-visible">
        <defs>
          <linearGradient id="radarFill" x1="0" y1="0" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--gradient-start))" stopOpacity="0.45" />
            <stop offset="100%" stopColor="hsl(var(--gradient-end))" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Rings */}
        {rings.map((r) => (
          <circle
            key={r}
            cx={cx}
            cy={cy}
            r={radius * r}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={1}
            strokeDasharray={r === 1 ? "0" : "2 3"}
            opacity={0.5}
          />
        ))}

        {/* Axes */}
        {axes.map((a, i) => (
          <line
            key={i}
            {...a}
            stroke="hsl(var(--border))"
            strokeWidth={1}
            opacity={0.6}
          />
        ))}

        {/* Animated polygon */}
        <motion.polygon
          points={animatedPath}
          fill="url(#radarFill)"
          stroke="hsl(var(--gradient-end))"
          strokeWidth={1.5}
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 0 6px hsl(var(--gradient-end) / 0.4))" }}
        />

        {/* Data point dots */}
        {data.map((d, i) => {
          const p = point(i, d.score);
          return (
            <motion.circle
              key={d.label}
              cx={p.x}
              cy={p.y}
              r={3}
              fill="hsl(var(--gradient-end))"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 + i * 0.05, duration: 0.3 }}
            />
          );
        })}

        {/* Axis labels */}
        {data.map((d, i) => {
          const p = point(i, maxScore + 14);
          return (
            <text
              key={`l-${d.label}`}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-muted-foreground"
              fontSize={10}
              fontWeight={500}
            >
              {d.label}
            </text>
          );
        })}

        {/* Score numbers at each point */}
        {data.map((d, i) => {
          const p = point(i, d.score);
          return (
            <text
              key={`s-${d.label}`}
              x={p.x}
              y={p.y - 8}
              textAnchor="middle"
              fontSize={9}
              fontWeight={600}
              className="fill-foreground"
            >
              {d.score}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// KeywordBars — side-by-side horizontal bar list for matched vs missing.
// ---------------------------------------------------------------------------

interface KeywordBarsProps {
  /** All keywords with their JD-side frequency. */
  frequencies: Record<string, number>;
  matched: string[];
  missing: string[];
  className?: string;
  /** How many top entries to show per side. */
  topN?: number;
}

export function KeywordBars({
  frequencies,
  matched,
  missing,
  className,
  topN = 6,
}: KeywordBarsProps) {
  // Sort matched and missing by frequency (desc)
  const topMatched = [...matched]
    .sort((a, b) => (frequencies[b] ?? 0) - (frequencies[a] ?? 0))
    .slice(0, topN);
  const topMissing = [...missing]
    .sort((a, b) => (frequencies[b] ?? 0) - (frequencies[a] ?? 0))
    .slice(0, topN);

  const maxFreq = Math.max(
    1,
    ...topMatched.map((k) => frequencies[k] ?? 0),
    ...topMissing.map((k) => frequencies[k] ?? 0),
  );

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", className)}>
      <BarColumn
        title="Top matched"
        tone="success"
        items={topMatched}
        maxFreq={maxFreq}
        frequencies={frequencies}
      />
      <BarColumn
        title="Top missing"
        tone="danger"
        items={topMissing}
        maxFreq={maxFreq}
        frequencies={frequencies}
      />
    </div>
  );
}

function BarColumn({
  title,
  tone,
  items,
  maxFreq,
  frequencies,
}: {
  title: string;
  tone: "success" | "danger";
  items: string[];
  maxFreq: number;
  frequencies: Record<string, number>;
}) {
  const toneClass =
    tone === "success"
      ? "[background-image:linear-gradient(90deg,hsl(var(--gradient-start))_0%,hsl(var(--gradient-end))_100%)]"
      : "bg-rose-500/80 dark:bg-rose-400/80";
  const labelClass =
    tone === "success"
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-rose-600 dark:text-rose-400";

  return (
    <div>
      <p
        className={cn(
          "text-xs font-medium uppercase tracking-wider",
          labelClass,
        )}
      >
        {title}
      </p>
      <div className="mt-2 space-y-1.5">
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground">—</p>
        ) : (
          items.map((k, i) => {
            const f = frequencies[k] ?? 0;
            const width = `${(f / maxFreq) * 100}%`;
            return (
              <div key={k} className="flex items-center gap-2 text-xs">
                <span className="w-24 shrink-0 truncate text-muted-foreground">
                  {k}
                </span>
                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width }}
                    transition={{
                      duration: 0.7,
                      delay: i * 0.05,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className={cn("h-full rounded-full", toneClass)}
                  />
                </div>
                <span className="w-6 shrink-0 text-right tabular-nums text-muted-foreground">
                  {f}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ScoreDonut — a small, ring-style breakdown of a single overall score with
// a label. Useful for embed-style summary cards.
// ---------------------------------------------------------------------------

interface ScoreDonutProps {
  value: number; // 0-100
  label?: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function ScoreDonut({
  value,
  label,
  size = 120,
  strokeWidth = 10,
  className,
}: ScoreDonutProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const id = React.useId();
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    const controls = animate(motionValue, clamped, {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
    });
    const unsub = motionValue.on("change", (v) => setDisplay(Math.round(v)));
    return () => {
      controls.stop();
      unsub();
    };
  }, [clamped, motionValue]);

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--gradient-start))" />
            <stop offset="100%" stopColor="hsl(var(--gradient-end))" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${id})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{
            strokeDashoffset: circumference - (clamped / 100) * circumference,
          }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: "drop-shadow(0 0 6px hsl(var(--gradient-end) / 0.4))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-semibold tabular-nums">{display}</div>
        {label && (
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CategoryBars — horizontal bar list of per-category ATS scores with the
// reason text below each bar. Easier to scan in print / export than the
// radar, and gives each category room to breathe next to its reasoning.
// ---------------------------------------------------------------------------

export interface CategoryBar {
  label: string;
  score: number;
  reason?: string;
}

interface CategoryBarsProps {
  data: CategoryBar[];
  className?: string;
  /** Show "Strong / Competitive / Needs work" tone per row. */
  showTone?: boolean;
}

function scoreTone(score: number): {
  text: string;
  bg: string;
} {
  if (score >= 80) {
    return {
      text: "text-emerald-600 dark:text-emerald-400",
      bg: "[background-image:linear-gradient(90deg,hsl(var(--gradient-start))_0%,hsl(var(--gradient-end))_100%)]",
    };
  }
  if (score >= 65) {
    return {
      text: "text-sky-600 dark:text-sky-400",
      bg: "[background-image:linear-gradient(90deg,hsl(var(--gradient-start))_0%,hsl(var(--gradient-end))_100%)]",
    };
  }
  if (score >= 50) {
    return {
      text: "text-amber-600 dark:text-amber-400",
      bg: "[background-image:linear-gradient(90deg,hsl(var(--gradient-start))_0%,hsl(var(--gradient-end))_100%)]",
    };
  }
  return {
    text: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500/80 dark:bg-rose-400/80",
  };
}

export function CategoryBars({
  data,
  className,
  showTone = true,
}: CategoryBarsProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {data.map((d, i) => {
        const clamped = Math.max(0, Math.min(100, d.score));
        const tone = scoreTone(clamped);
        return (
          <motion.div
            key={d.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: i * 0.06,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium">{d.label}</span>
              <span
                className={cn(
                  "text-sm font-semibold tabular-nums",
                  showTone ? tone.text : "text-foreground",
                )}
              >
                {Math.round(clamped)}
                <span className="ml-0.5 text-xs text-muted-foreground">/100</span>
              </span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${clamped}%` }}
                transition={{
                  duration: 0.9,
                  delay: 0.1 + i * 0.06,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={cn("h-full rounded-full", tone.bg)}
              />
            </div>
            {d.reason && (
              <p className="mt-1 text-xs text-muted-foreground">{d.reason}</p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
