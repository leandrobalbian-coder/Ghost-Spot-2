"use client";

import { animate, useMotionValue } from "framer-motion";
import { useEffect, useState } from "react";

type Props = {
  to: number;
  duration?: number;
  delay?: number;
  format?: (n: number) => string;
  className?: string;
};

export function Counter({
  to,
  duration = 2.6,
  delay = 0.2,
  format = (n) => Math.round(n).toLocaleString("es-MX"),
  className,
}: Props) {
  const value = useMotionValue(0);
  // Pre-hydration & first paint: render the FINAL value invisibly so the SSR
  // markup reserves the right width (no layout shift) and we never flash $0.
  // Once mounted on the client, switch to animated value from 0 → to.
  const [mounted, setMounted] = useState(false);
  const [display, setDisplay] = useState(format(to));

  useEffect(() => {
    setMounted(true);
    setDisplay(format(0));
    const unsubscribe = value.on("change", (v) => setDisplay(format(v)));
    const controls = animate(value, to, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [to, duration, delay, format, value]);

  return (
    <span
      className={`tabular-nums font-mono transition-opacity ${
        mounted ? "opacity-100" : "opacity-0"
      } ${className ?? ""}`}
      aria-label={format(to)}
    >
      {display}
    </span>
  );
}
