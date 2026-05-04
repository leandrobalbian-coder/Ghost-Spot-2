import { scoreLabel, scoreTier } from "@/lib/format";

type Props = {
  score: number;
  size?: "sm" | "md" | "lg";
};

const TIER_STYLES = {
  high: {
    ring: "border-loss/50 bg-loss/15 text-loss",
    dot: "bg-loss",
  },
  mid: {
    ring: "border-warm/40 bg-warm/10 text-warm",
    dot: "bg-warm",
  },
  low: {
    ring: "border-line bg-bg-card text-ink-muted",
    dot: "bg-ink-faint",
  },
};

export function ScoreBadge({ score, size = "md" }: Props) {
  const tier = scoreTier(score);
  const style = TIER_STYLES[tier];
  const sizes =
    size === "sm"
      ? "px-1.5 py-0.5 text-[10px] gap-1"
      : size === "lg"
      ? "px-2.5 py-1 text-xs gap-1.5"
      : "px-2 py-0.5 text-[11px] gap-1.5";

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium uppercase tracking-wide ${style.ring} ${sizes}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      <span>
        {scoreLabel(score)} · <span className="tabular-nums font-mono">{score}</span>
      </span>
    </span>
  );
}
