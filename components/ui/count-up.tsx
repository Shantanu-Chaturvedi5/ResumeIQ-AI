"use client";

import * as React from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

export function CountUp({
  to,
  from = 0,
  duration = 1.2,
  className,
}: {
  to: number;
  from?: number;
  duration?: number;
  className?: string;
}) {
  const mv = useMotionValue(from);
  const rounded = useTransform(mv, (v) => Math.round(v).toString());
  const [text, setText] = React.useState(from.toString());

  React.useEffect(() => {
    const controls = animate(mv, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
    });
    const unsub = rounded.on("change", (v) => setText(v));
    return () => {
      controls.stop();
      unsub();
    };
  }, [to, duration, mv, rounded]);

  return <span className={className}>{text}</span>;
}
