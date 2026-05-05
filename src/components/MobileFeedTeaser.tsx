"use client";

import Link from "next/link";
import { ChevronRight, Clock, MapPin } from "lucide-react";
import { ScoreBadge } from "@/components/ScoreBadge";
import { ghosts } from "@/lib/data";
import { hasUrgencySignal, shortName, truncate } from "@/lib/format";

// Mobile-only horizontal scroll preview of the 3 top-scoring ghosts.
// Tapping a card jumps to /feed/[id]. Renders only on mobile (md:hidden)
// so desktop users see the existing landing layout unchanged.
export function MobileFeedTeaser() {
  const top = [...ghosts]
    .sort((a, b) => b.intent_score - a.intent_score)
    .slice(0, 3);

  return (
    <section className="md:hidden mt-12 w-full">
      <div className="mb-3 flex items-baseline justify-between px-4">
        <p className="text-[10px] uppercase tracking-widest text-ink-faint">
          Muestra del feed
        </p>
        <Link
          href="/feed"
          className="inline-flex items-center gap-0.5 text-[11px] font-medium text-ink-muted hover:text-ink"
        >
          Ver todos
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 scrollbar-thin">
        {top.map((g) => (
          <Link
            key={g.conv_id}
            href={`/feed/${g.conv_id}`}
            className="group relative flex w-[78vw] max-w-[300px] shrink-0 snap-start flex-col gap-2.5 overflow-hidden rounded-lg border border-line bg-bg-card border-l-2 border-l-loss p-4 transition-colors active:bg-bg-hover"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-ink">
                  {shortName(g)}
                </h3>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-ink-dim">
                  {g.spot_sector && <span>{g.spot_sector}</span>}
                  {g.spot_sector && g.profile_state && (
                    <span className="text-ink-faint">·</span>
                  )}
                  {g.profile_state && (
                    <span className="inline-flex items-center gap-0.5">
                      <MapPin className="h-3 w-3" />
                      {g.profile_state}
                    </span>
                  )}
                </p>
              </div>
              <ScoreBadge score={g.intent_score} size="sm" />
            </div>

            {hasUrgencySignal(g.last_user_message) && (
              <span className="inline-flex w-fit items-center gap-1 rounded border border-loss/40 bg-loss/10 px-1.5 py-0.5 text-[10px] font-medium text-loss">
                <span className="h-1.5 w-1.5 rounded-full bg-loss animate-pulse-loss" />
                Alta urgencia
              </span>
            )}

            <p className="line-clamp-3 flex-1 text-xs leading-relaxed text-ink-muted">
              {truncate(g.last_user_message, 140) || (
                <span className="italic text-ink-faint">(sin mensaje)</span>
              )}
            </p>

            <div className="flex items-center justify-between border-t border-line-subtle pt-2 font-mono text-[10px] tabular-nums text-ink-faint">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                hace {g.days_since}d
              </span>
              <span className="text-ink-dim">{g.messages_count} msgs</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
