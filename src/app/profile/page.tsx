"use client";

import { motion } from "framer-motion";
import { Check, CheckCircle2, RotateCcw, Sparkles, TrendingDown, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ScoreBadge } from "@/components/ScoreBadge";
import { useToast } from "@/components/ToastProvider";
import { ghosts } from "@/lib/data";
import { formatDateLong, formatNumber, timeSince } from "@/lib/format";
import {
  formatGap,
  getResolutions,
  getStats,
  resetResolutions,
  subscribe,
  type Resolution,
} from "@/lib/resolutions";
import { Clock } from "lucide-react";

const VALUE_PER_RESCUE = 540;

type ActivityFilter = "all" | "rescued" | "dismissed";

const ACTIVITY_CHIPS: { id: ActivityFilter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "rescued", label: "Rescatados" },
  { id: "dismissed", label: "Dismissed" },
];

export default function ProfilePage() {
  const [stats, setStats] = useState(() => getStats());
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>("all");
  const toast = useToast();

  useEffect(() => {
    const sync = () => {
      setStats(getStats());
      setResolutions(
        [...getResolutions()].sort(
          (a, b) => new Date(b.resolved_at).getTime() - new Date(a.resolved_at).getTime()
        )
      );
    };
    sync();
    return subscribe(sync);
  }, []);

  const allRescued = stats.rescued >= ghosts.length;

  const filteredResolutions = useMemo(() => {
    return resolutions.filter((r) => {
      if (activityFilter === "all") return true;
      if (activityFilter === "rescued") return r.resolution_type === "rescued";
      // dismissed bucket lumps "dismissed" + "not_actionable"
      return r.resolution_type !== "rescued";
    });
  }, [resolutions, activityFilter]);

  const onReset = () => {
    if (
      typeof window === "undefined" ||
      window.confirm(
        "¿Borrar todos tus rescates locales? Esta acción no se puede deshacer."
      )
    ) {
      resetResolutions();
      toast.show("Demo reseteada", "info");
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6 md:px-6 md:pt-10">
      {/* Header */}
      <header className="mb-8 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-bg-card text-ink-muted">
          <UserIcon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-widest text-ink-faint">Tu sesión</p>
          <h1 className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">
            Tu progreso en la demo
          </h1>
          <p className="mt-1 max-w-xl text-sm text-ink-muted">
            Resumen de los fantasmas que rescataste durante esta sesión. Persistido en el localStorage de tu navegador.
          </p>
        </div>
      </header>

      {/* Easter egg */}
      {allRescued && stats.rescued > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-3 overflow-hidden rounded-lg border border-ok/30 bg-ok/10 p-4"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ok/20 text-ok">
            <Sparkles className="h-4 w-4" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Rescataste todos los fantasmas</p>
            <p className="text-xs text-ink-muted">
              Si esto fuera prod, acabás de recuperar ~${formatNumber(stats.estimated_value_recovered)} MXN en
              comisión potencial.
            </p>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <BigStat
          label="Rescatados"
          value={stats.rescued}
          accent="loss"
          icon={<Sparkles className="h-4 w-4" />}
        />
        <BigStat
          label="Valor estimado"
          value={`$${formatNumber(stats.estimated_value_recovered)}`}
          suffix="MXN"
          accent="ok"
          icon={<TrendingDown className="h-4 w-4 rotate-180" />}
        />
        <BigStat
          label="Tiempo / rescate"
          value={
            stats.total_resolved >= 2 ? formatGap(stats.avg_gap_seconds) : "—"
          }
          accent="muted"
          icon={<Clock className="h-4 w-4" />}
        />
        <BigStat
          label="Dismissed"
          value={stats.dismissed + stats.not_actionable}
          accent="muted"
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
      </div>

      {/* Math footnote */}
      <p className="mt-3 text-[11px] text-ink-faint">
        <span className="font-mono tabular-nums">{stats.rescued}</span> rescates × 30% lead→cita × 10% cita→contrato ×
        $18K MXN comisión = <span className="font-mono tabular-nums">${formatNumber(stats.rescued * VALUE_PER_RESCUE)}</span>{" "}
        MXN.
      </p>

      {/* Activity log */}
      <section className="mt-10">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-ink-muted">
            Actividad
          </h2>
          {resolutions.length > 0 && (
            <div className="flex items-center gap-1">
              {ACTIVITY_CHIPS.map((c) => {
                const active = activityFilter === c.id;
                const count =
                  c.id === "all"
                    ? resolutions.length
                    : c.id === "rescued"
                    ? stats.rescued
                    : stats.dismissed + stats.not_actionable;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActivityFilter(c.id)}
                    className={`shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                      active
                        ? "border-loss/50 bg-loss/15 text-loss"
                        : "border-line bg-bg text-ink-muted hover:border-line-strong hover:text-ink"
                    }`}
                  >
                    {c.label}
                    <span className="ml-1 font-mono text-[10px] tabular-nums opacity-70">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {filteredResolutions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line bg-bg-card/40 p-8 text-center">
            <p className="text-sm text-ink-muted">
              {resolutions.length === 0
                ? "Todavía no rescataste ningún fantasma."
                : "Ningún registro matchea este filtro."}
            </p>
            {resolutions.length === 0 && (
              <Link
                href="/feed"
                className="mt-3 inline-block rounded-md bg-loss px-3 py-2 text-xs font-semibold text-white shadow-glow hover:bg-loss-deep"
              >
                Ir al feed
              </Link>
            )}
          </div>
        ) : (
          <ul className="overflow-hidden rounded-lg border border-line bg-bg-card">
            {filteredResolutions.map((r, i) => {
              const ghost = ghosts.find((g) => g.conv_id === r.conv_id);
              if (!ghost) return null;
              return (
                <li
                  key={r.conv_id}
                  className={`px-4 py-3 ${i > 0 ? "border-t border-line-subtle" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/feed/${r.conv_id}`}
                        className="block text-sm font-medium text-ink hover:text-loss"
                      >
                        {ghost.lead_name ?? "Anónimo"}{" "}
                        {ghost.lead_last_name ? ghost.lead_last_name[0] + "." : ""}
                      </Link>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] tabular-nums text-ink-faint">
                        <span>conv #{r.conv_id}</span>
                        <span className="text-ink-faint">·</span>
                        <span>{timeSince(r.resolved_at)}</span>
                        {r.message_copied && (
                          <>
                            <span className="text-ink-faint">·</span>
                            <span className="inline-flex items-center gap-0.5 text-ok">
                              <Check className="h-3 w-3" /> mensaje copiado
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                          r.resolution_type === "rescued"
                            ? "border-loss/40 bg-loss/10 text-loss"
                            : "border-line bg-bg-card text-ink-muted"
                        }`}
                      >
                        {r.resolution_type === "rescued"
                          ? "Rescatado"
                          : r.resolution_type === "not_actionable"
                          ? "No accionable"
                          : "Dismissed"}
                      </span>
                      <ScoreBadge score={ghost.intent_score} size="sm" />
                    </div>
                  </div>
                  {r.notes && (
                    <p className="mt-1.5 rounded border-l-2 border-line bg-bg/40 py-1 pl-2.5 text-xs italic text-ink-muted">
                      &ldquo;{r.notes}&rdquo;
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Reset */}
      <section className="mt-12 flex flex-col items-start gap-3 rounded-lg border border-line bg-bg-card/40 p-5">
        <div>
          <h3 className="text-sm font-semibold text-ink">Reset de la demo</h3>
          <p className="mt-1 max-w-md text-xs text-ink-muted">
            Borra todos tus rescates locales para volver a empezar. Útil entre demo y demo, o para Sales testers.
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-md border border-line bg-bg px-3 py-2 text-xs font-medium text-ink-muted hover:text-loss"
        >
          <RotateCcw className="h-3 w-3" />
          Reset demo
        </button>
      </section>
    </div>
  );
}

function BigStat({
  label,
  value,
  suffix,
  accent,
  icon,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  accent: "loss" | "ok" | "muted";
  icon: React.ReactNode;
}) {
  const accents = {
    loss: "border-loss/30 bg-loss/5 text-loss",
    ok: "border-ok/30 bg-ok/5 text-ok",
    muted: "border-line bg-bg-card text-ink-muted",
  } as const;
  return (
    <div className={`rounded-lg border p-4 md:p-5 ${accents[accent]}`}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-ink-faint">{label}</span>
        {icon}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="font-mono text-3xl font-semibold tabular-nums text-ink md:text-4xl">
          {value}
        </span>
        {suffix && <span className="text-xs text-ink-muted">{suffix}</span>}
      </div>
    </div>
  );
}
