"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WeeklyBreakdown } from "@/types/ghost";

type Props = {
  data: WeeklyBreakdown[];
};

export function TimelineChart({ data }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const enriched = data.map((d) => ({
    ...d,
    label: shortLabel(d.week_start),
    ratio: d.total_convs > 0 ? Math.round((d.ghosts / d.total_convs) * 100) : 0,
  }));

  if (!mounted) {
    return (
      <div className="h-[320px] w-full md:h-[420px] shimmer rounded" aria-hidden />
    );
  }

  // Find x position for the divider (between W5 and W6 = the W6 entry)
  const breakIdx = enriched.findIndex((d) => d.is_post_break);
  const dividerLabel = breakIdx > 0 ? enriched[breakIdx].label : null;

  return (
    <div className="h-[320px] w-full md:h-[420px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={enriched}
          margin={{ top: 24, right: 12, left: -16, bottom: 8 }}
        >
          <CartesianGrid stroke="#1F1F22" strokeDasharray="2 4" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="#52525B"
            tick={{ fontSize: 11, fill: "#71717A", fontFamily: "var(--font-plex-mono)" }}
            tickLine={false}
            axisLine={{ stroke: "#27272A" }}
            interval={0}
          />
          <YAxis
            stroke="#52525B"
            tick={{ fontSize: 11, fill: "#71717A", fontFamily: "var(--font-plex-mono)" }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            cursor={{ fill: "rgba(239, 68, 68, 0.06)" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as typeof enriched[number];
              return (
                <div className="rounded-md border border-line bg-bg-card px-3 py-2.5 text-xs shadow-modal">
                  <div className="font-mono uppercase tracking-widest text-[10px] text-ink-faint">
                    Sem {d.iso_week} · {d.label}
                  </div>
                  <div className="mt-1.5 flex items-baseline gap-2">
                    <span className="font-mono text-base font-semibold tabular-nums text-loss">
                      {d.ghosts}
                    </span>
                    <span className="text-ink-muted">ghosts</span>
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] tabular-nums text-ink-dim">
                    de {d.total_convs} convs · {d.ratio}%
                  </div>
                </div>
              );
            }}
          />
          {dividerLabel && (
            <ReferenceLine
              x={dividerLabel}
              stroke="#EF4444"
              strokeDasharray="3 3"
              strokeWidth={1.5}
              label={{
                value: "2 feb · break",
                position: "top",
                fill: "#EF4444",
                fontSize: 10,
                fontFamily: "var(--font-plex-mono)",
              }}
            />
          )}
          <Bar dataKey="ghosts" radius={[3, 3, 0, 0]}>
            {enriched.map((d, i) => (
              <Cell key={i} fill={d.is_post_break ? "#EF4444" : "#3F3F46"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function shortLabel(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short" }).format(d);
}
