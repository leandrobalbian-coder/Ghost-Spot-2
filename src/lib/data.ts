import ghostsJson from "@/data/ghosts.json";
import metricsJson from "@/data/metrics.json";
import timelineJson from "@/data/timeline.json";
import type { Ghost, Metrics, WeeklyBreakdown } from "@/types/ghost";

export const ghosts: Ghost[] = ghostsJson as Ghost[];
export const metrics: Metrics = metricsJson as Metrics;
export const timeline: { weekly_breakdown: WeeklyBreakdown[] } = timelineJson;

export function findGhost(conv_id: string): Ghost | undefined {
  return ghosts.find((g) => g.conv_id === conv_id);
}

export function uniqueSectors(): string[] {
  return Array.from(
    new Set(ghosts.map((g) => g.spot_sector).filter((x): x is string => Boolean(x)))
  ).sort();
}

export function uniqueStates(): string[] {
  return Array.from(
    new Set(ghosts.map((g) => g.profile_state).filter((x): x is string => Boolean(x)))
  ).sort();
}
