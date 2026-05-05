"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Copy, RotateCcw, Sparkles, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { ghosts, metrics } from "@/lib/data";
import { formatNumber } from "@/lib/format";
import { copyToClipboard } from "@/lib/clipboard";
import { useToast } from "@/components/ToastProvider";
import {
  getResolutions,
  getStats,
  resetResolutions,
  subscribe,
  type Resolution,
} from "@/lib/resolutions";

const VALUE_PER_RESCUE = 540;
const TOTAL_GHOSTS_REAL = metrics.total_ghosts; // 643

// Easter egg shown when the feed is empty: differentiates between
// "all 10 rescued" (full celebration) and "all dismissed / mixed"
// (modest acknowledgement). Only triggers full mode when the user
// actually rescued the 10 — not when they dismissed them all.
export function AllDoneCelebration() {
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [stats, setStats] = useState(() => getStats());
  const [shareCopied, setShareCopied] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const sync = () => {
      setResolutions(getResolutions());
      setStats(getStats());
    };
    sync();
    return subscribe(sync);
  }, []);

  const allRescued =
    resolutions.length >= ghosts.length &&
    resolutions.every((r) => r.resolution_type === "rescued");

  const valueRecovered = stats.rescued * VALUE_PER_RESCUE;
  const projectedQuarter = Math.round((TOTAL_GHOSTS_REAL * VALUE_PER_RESCUE) / 1000) * 1000;

  const handleShare = async () => {
    const text = `Acabo de rescatar ${stats.rescued} leads SS del chatbot de Spot2 — valor estimado recuperado $${formatNumber(
      valueRecovered
    )} MXN. Si esto se hiciera cada semana sobre los ${formatNumber(
      TOTAL_GHOSTS_REAL
    )} reales, se recuperaría ~$${formatNumber(projectedQuarter)} MXN por trimestre.\n\nghosts.spot2.mx`;
    const ok = await copyToClipboard(text);
    if (ok) {
      setShareCopied(true);
      toast.show("Resumen copiado — pegalo en Slack o LinkedIn", "success");
      setTimeout(() => setShareCopied(false), 2500);
    } else {
      toast.show("No se pudo copiar el resumen", "error");
    }
  };

  if (!allRescued) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-ok/30 bg-ok/5 py-20 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-ok/20 text-ok">
          <Check className="h-6 w-6" strokeWidth={2.4} />
        </div>
        <h3 className="text-balance text-lg font-semibold text-ink">
          Resolviste todos los fantasmas
        </h3>
        <p className="mt-1 max-w-sm text-sm text-ink-muted">
          El feed quedó limpio. Mirá tu progreso o reseteá la demo desde tu perfil.
        </p>
        <div className="mt-5 flex gap-2">
          <Link
            href="/profile"
            className="rounded-md border border-line bg-bg-card px-3 py-2 text-xs font-medium text-ink hover:bg-bg-hover"
          >
            Ver mi perfil
          </Link>
          <button
            type="button"
            onClick={() => {
              if (
                typeof window === "undefined" ||
                window.confirm(
                  "¿Borrar todos tus rescates locales? Esta acción no se puede deshacer."
                )
              ) {
                resetResolutions();
              }
            }}
            className="rounded-md bg-loss px-3 py-2 text-xs font-semibold text-white hover:bg-loss-deep"
          >
            Reset demo
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-lg border border-loss/40 bg-gradient-to-b from-loss/10 to-loss/5 px-6 py-12 text-center md:px-12 md:py-16"
    >
      {/* Subtle radial glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-loss/15 blur-3xl" />

      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-loss/20 text-loss shadow-glow"
      >
        <Sparkles className="h-7 w-7" strokeWidth={2.2} />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative text-balance text-2xl font-semibold tracking-tight text-ink md:text-3xl"
      >
        Rescataste {stats.rescued} leads.
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="relative mt-1 text-sm text-ink-muted md:text-base"
      >
        Valor potencial recuperado:{" "}
        <span className="font-mono font-semibold tabular-nums text-loss">
          ${formatNumber(valueRecovered)} MXN
        </span>
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.65 }}
        className="relative mx-auto mt-8 max-w-md rounded-md border border-line bg-bg-card/60 p-4 text-left text-sm leading-relaxed"
      >
        <div className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-ink-faint">
          <TrendingUp className="h-3 w-3" />
          Si esto se hiciera en producción
        </div>
        <p className="text-ink">
          Sobre los <span className="font-mono tabular-nums">{formatNumber(TOTAL_GHOSTS_REAL)}</span>{" "}
          ghosts reales, una rutina semanal de rescate recuperaría{" "}
          <span className="font-mono font-semibold tabular-nums text-loss">
            ~${formatNumber(projectedQuarter)} MXN
          </span>{" "}
          por trimestre.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.85 }}
        className="relative mt-8 flex flex-wrap items-center justify-center gap-2"
      >
        <button
          type="button"
          onClick={handleShare}
          className={`inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors ${
            shareCopied
              ? "border border-ok/50 bg-ok/10 text-ok"
              : "bg-loss text-white shadow-glow hover:bg-loss-deep"
          }`}
        >
          {shareCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {shareCopied ? "Resumen copiado" : "Compartir mi resultado"}
        </button>
        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 rounded-md border border-line bg-bg-card px-4 py-2.5 text-sm font-medium text-ink hover:bg-bg-hover"
        >
          Ver mi perfil
        </Link>
        <button
          type="button"
          onClick={() => {
            if (
              typeof window === "undefined" ||
              window.confirm(
                "¿Borrar todos tus rescates locales? Esta acción no se puede deshacer."
              )
            ) {
              resetResolutions();
            }
          }}
          className="inline-flex items-center gap-1.5 rounded-md border border-line bg-bg-card px-4 py-2.5 text-sm font-medium text-ink-muted hover:text-loss"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </motion.div>
    </motion.div>
  );
}
