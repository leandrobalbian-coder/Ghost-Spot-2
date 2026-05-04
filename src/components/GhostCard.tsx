"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Clock, MapPin, MessageCircle, MoreHorizontal, Sparkles } from "lucide-react";
import { useState } from "react";
import type { Ghost } from "@/types/ghost";
import { ScoreBadge } from "@/components/ScoreBadge";
import { maskPhone, scoreTier, shortName, truncate } from "@/lib/format";
import { saveResolution, type ResolutionType } from "@/lib/resolutions";
import { useToast } from "@/components/ToastProvider";

type Props = {
  ghost: Ghost;
  onRescue: (ghost: Ghost) => void;
  onResolved?: (ghost: Ghost) => void;
};

const TIER_ACCENT = {
  high: "border-l-loss",
  mid: "border-l-warm",
  low: "border-l-line",
};

export function GhostCard({ ghost, onRescue, onResolved }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const tier = scoreTier(ghost.intent_score);
  const toast = useToast();

  const handleDismiss = (type: ResolutionType, label: string) => {
    setMenuOpen(false);
    saveResolution({
      conv_id: ghost.conv_id,
      resolution_type: type,
      resolved_at: new Date().toISOString(),
      message_copied: false,
    });
    toast.show(label, "info");
    onResolved?.(ghost);
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.32 } }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative flex flex-col overflow-hidden rounded-lg border border-line bg-bg-card border-l-2 transition-colors hover:border-line-strong hover:bg-bg-hover ${TIER_ACCENT[tier]}`}
    >
      <Link
        href={`/feed/${ghost.conv_id}`}
        className="flex flex-1 flex-col gap-3 p-4 md:p-5"
        prefetch={false}
      >
        {/* Top row: name + score */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-ink md:text-base">
              {shortName(ghost)}
            </h3>
            <p className="mt-0.5 truncate font-mono text-[11px] tabular-nums text-ink-faint">
              {maskPhone(ghost.lead_phone_number)}
            </p>
          </div>
          <ScoreBadge score={ghost.intent_score} size="sm" />
        </div>

        {/* Sector + location */}
        {(ghost.spot_sector || ghost.profile_state) && (
          <div className="flex flex-wrap items-center gap-1.5">
            {ghost.spot_sector && (
              <span className="inline-flex items-center rounded border border-line-subtle bg-bg/40 px-1.5 py-0.5 text-[11px] text-ink-muted">
                {ghost.spot_sector}
              </span>
            )}
            {ghost.profile_state && (
              <span className="inline-flex items-center gap-1 text-[11px] text-ink-dim">
                <MapPin className="h-3 w-3" />
                {ghost.profile_state}
              </span>
            )}
          </div>
        )}

        {/* Snippet */}
        <p className="line-clamp-3 flex-1 text-sm text-ink-muted">
          {truncate(ghost.last_user_message, 220) || (
            <span className="italic text-ink-faint">
              (sin mensaje del usuario en la conversación)
            </span>
          )}
        </p>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line-subtle pt-3 font-mono text-[11px] tabular-nums text-ink-faint">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            hace {ghost.days_since}d
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="h-3 w-3" />
            {ghost.messages_count} msgs
          </span>
          {ghost.spot2_links_count > 0 && (
            <span className="inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              {ghost.spot2_links_count} spots
            </span>
          )}
          <span className="ml-auto inline-flex items-center gap-0.5 text-ink-dim opacity-0 transition-opacity group-hover:opacity-100">
            Ver
            <ChevronRight className="h-3 w-3" />
          </span>
        </div>
      </Link>

      {/* Action bar */}
      <div className="flex border-t border-line-subtle bg-bg/40">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRescue(ghost);
          }}
          className="flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-loss transition-colors hover:bg-loss/10"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Rescatar
        </button>
        <div className="w-px self-stretch bg-line-subtle" />
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            aria-label="Más opciones"
            className="flex h-full items-center justify-center px-3 text-ink-muted transition-colors hover:bg-bg-hover hover:text-ink"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMenuOpen(false);
                }}
              />
              <div className="absolute bottom-full right-0 z-20 mb-1 w-48 overflow-hidden rounded-md border border-line bg-bg-card shadow-modal">
                {[
                  { label: "No es accionable", type: "not_actionable" as const, msg: "Marcado como no accionable" },
                  { label: "Ya contactado", type: "dismissed" as const, msg: "Marcado como ya contactado" },
                  { label: "No es real", type: "dismissed" as const, msg: "Marcado como no real" },
                ].map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDismiss(opt.type, opt.msg);
                    }}
                    className="block w-full px-3 py-2 text-left text-xs text-ink-muted transition-colors hover:bg-bg-hover hover:text-ink"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </motion.article>
  );
}
