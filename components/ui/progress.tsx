"use client";

import * as React from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { cn } from "@/lib/utils";

interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
  showValue?: boolean;
  label?: string;
}

export function CircularProgress({
  value,
  size = 160,
  strokeWidth = 12,
  className,
  showValue = true,
  label,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));

  const motionValue = useMotionValue(0);
  const displayed = useTransform(motionValue, (v) => Math.round(v));
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    const controls = animate(motionValue, clamped, {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
    });
    const unsub = displayed.on("change", (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsub();
    };
  }, [clamped, motionValue, displayed]);

  // Gradient ID scoped per instance to avoid conflicts
  const gradientId = React.useId();

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
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
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{
            strokeDashoffset: circumference - (clamped / 100) * circumference,
          }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: "drop-shadow(0 0 8px hsl(var(--gradient-end) / 0.5))" }}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-semibold tracking-tight">
            {display}
            <span className="text-xl text-muted-foreground">/100</span>
          </div>
          {label && (
            <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
              {label}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function LinearProgress({
  value,
  className,
  showValue = false,
}: {
  value: number;
  className?: string;
  showValue?: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("w-full", className)}>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full [background-image:linear-gradient(90deg,hsl(var(--gradient-start))_0%,hsl(var(--gradient-end))_100%)]"
        />
      </div>
      {showValue && (
        <div className="mt-1 text-xs text-muted-foreground tabular-nums">
          {Math.round(clamped)}/100
        </div>
      )}
    </div>
  );
}
