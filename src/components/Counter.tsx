"use client";

import { animate, useMotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";

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

  // Keep `format` out of effect deps — it's a new ref each render when
  // it comes from a default arg, which would re-trigger the animation
  // every render and lock the display at 0.
  const formatRef = useRef(format);
  formatRef.current = format;

  const finalText = format(to);

  // SSR / pre-hydration: render the FINAL value (invisible via opacity)
  // so the layout reserves the right width and we never flash $0.
  // After mount: reset to "0" and animate up to `to`.
  const [mounted, setMounted] = useState(false);
  const [display, setDisplay] = useState(finalText);

  useEffect(() => {
    setDisplay(formatRef.current(0));
    setMounted(true);
    const unsub = value.on("change", (v) => setDisplay(formatRef.current(v)));
    const controls = animate(value, to, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => {
      controls.stop();
      unsub();
    };
  }, [to, duration, delay, value]);

  return (
    <span
      className={`tabular-nums font-mono transition-opacity ${
        mounted ? "opacity-100" : "opacity-0"
      } ${className ?? ""}`}
      aria-label={finalText}
    >
      {display}
    </span>
  );
}
