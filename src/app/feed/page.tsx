"use client";

import { AnimatePresence } from "framer-motion";
import { Filter, RotateCcw, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { GhostCard } from "@/components/GhostCard";
import { RescueModal } from "@/components/RescueModal";
import { ghosts, uniqueSectors, uniqueStates } from "@/lib/data";
import { getResolutions, resetResolutions, subscribe } from "@/lib/resolutions";
import type { Ghost } from "@/types/ghost";

type ScoreFilter = "all" | "high" | "mid" | "low";

const SCORE_CHIPS: { id: ScoreFilter; label: string; range: string }[] = [
  { id: "all", label: "Todos", range: "" },
  { id: "high", label: "Alto", range: "≥70" },
  { id: "mid", label: "Medio", range: "40-69" },
  { id: "low", label: "Bajo", range: "<40" },
];

export default function FeedPage() {
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());
  const [sectors, setSectors] = useState<Set<string>>(new Set());
  const [states, setStates] = useState<Set<string>>(new Set());
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>("all");
  const [query, setQuery] = useState("");
  const [activeGhost, setActiveGhost] = useState<Ghost | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Sync from localStorage
  useEffect(() => {
    const sync = () => {
      const ids = new Set(getResolutions().map((r) => r.conv_id));
      setResolvedIds(ids);
    };
    sync();
    return subscribe(sync);
  }, []);

  const sectorOptions = useMemo(() => uniqueSectors(), []);
  const stateOptions = useMemo(() => uniqueStates(), []);

  const visible = useMemo(() => {
    return ghosts
      .filter((g) => !resolvedIds.has(g.conv_id))
      .filter((g) => (sectors.size === 0 ? true : g.spot_sector ? sectors.has(g.spot_sector) : false))
      .filter((g) => (states.size === 0 ? true : g.profile_state ? states.has(g.profile_state) : false))
      .filter((g) => {
        if (scoreFilter === "all") return true;
        if (scoreFilter === "high") return g.intent_score >= 70;
        if (scoreFilter === "mid") return g.intent_score >= 40 && g.intent_score < 70;
        return g.intent_score < 40;
      })
      .filter((g) => {
        if (!query.trim()) return true;
        const q = query.trim().toLowerCase();
        return [
          g.lead_name,
          g.lead_last_name,
          g.spot_sector,
          g.profile_state,
          g.last_user_message,
        ]
          .filter(Boolean)
          .some((s) => s!.toLowerCase().includes(q));
      })
      .sort((a, b) => b.intent_score - a.intent_score);
  }, [resolvedIds, sectors, states, scoreFilter, query]);

  const totalActive = ghosts.filter((g) => !resolvedIds.has(g.conv_id)).length;
  const allDone = totalActive === 0;
  const hasFilters =
    sectors.size > 0 || states.size > 0 || scoreFilter !== "all" || query.length > 0;

  const toggle = (set: Set<string>, value: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  };

  const clearFilters = () => {
    setSectors(new Set());
    setStates(new Set());
    setScoreFilter("all");
    setQuery("");
  };

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 md:px-6 md:pt-10">
        {/* Header */}
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-balance text-2xl font-semibold tracking-tight text-ink md:text-3xl">
              Feed de fantasmas
            </h1>
            <p className="mt-1.5 max-w-xl text-sm text-ink-muted">
              Conversaciones reales que entraron al chatbot, mostraron intención y nunca llegaron a un broker.{" "}
              <span className="text-ink-dim">
                {hasFilters ? (
                  <>
                    Mostrando <span className="tabular-nums font-mono">{visible.length}</span> de{" "}
                    <span className="tabular-nums font-mono">643</span> totales (filtrado).
                  </>
                ) : (
                  <>
                    Mostrando los <span className="tabular-nums font-mono">{visible.length}</span> más recientes de los{" "}
                    <span className="tabular-nums font-mono">643</span> totales.
                  </>
                )}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-ink-faint">
            <span className="inline-flex h-2 w-2 animate-pulse-loss rounded-full bg-loss" />
            <span>{totalActive} activos</span>
          </div>
        </header>

        {/* Filter bar */}
        <div className="mb-6 flex flex-col gap-3 rounded-lg border border-line bg-bg-card p-3 md:p-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar nombre, sector o mensaje…"
                className="w-full rounded-md border border-line bg-bg pl-9 pr-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-loss/50 focus:outline-none"
              />
            </div>
            {/* Score chips */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin">
              {SCORE_CHIPS.map((c) => {
                const active = scoreFilter === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setScoreFilter(c.id)}
                    className={`shrink-0 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? "border-loss/50 bg-loss/15 text-loss"
                        : "border-line bg-bg text-ink-muted hover:border-line-strong hover:text-ink"
                    }`}
                  >
                    {c.label}
                    {c.range && (
                      <span className="ml-1 font-mono text-[10px] tabular-nums opacity-70">
                        {c.range}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                filtersOpen
                  ? "border-line-strong bg-bg-hover text-ink"
                  : "border-line bg-bg text-ink-muted hover:text-ink"
              }`}
            >
              <Filter className="h-3 w-3" />
              Filtros
              {(sectors.size > 0 || states.size > 0) && (
                <span className="ml-0.5 rounded bg-loss/20 px-1 font-mono tabular-nums text-loss">
                  {sectors.size + states.size}
                </span>
              )}
            </button>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-ink-muted hover:text-loss"
              >
                <RotateCcw className="h-3 w-3" />
                Limpiar
              </button>
            )}
          </div>

          {filtersOpen && (
            <div className="grid gap-3 border-t border-line-subtle pt-3 md:grid-cols-2">
              <FilterGroup
                label="Sector"
                options={sectorOptions}
                selected={sectors}
                onToggle={(v) => toggle(sectors, v, setSectors)}
              />
              <FilterGroup
                label="Ciudad / Estado"
                options={stateOptions}
                selected={states}
                onToggle={(v) => toggle(states, v, setStates)}
              />
            </div>
          )}
        </div>

        {/* Empty / list */}
        {allDone ? (
          <AllDoneState />
        ) : visible.length === 0 ? (
          <EmptyFiltersState onReset={clearFilters} />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {visible.map((g) => (
                <GhostCard
                  key={g.conv_id}
                  ghost={g}
                  onRescue={(g) => setActiveGhost(g)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <RescueModal
        ghost={activeGhost}
        open={!!activeGhost}
        onClose={() => setActiveGhost(null)}
      />
    </>
  );
}

function FilterGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: Set<string>;
  onToggle: (v: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-[10px] uppercase tracking-widest text-ink-faint">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = selected.has(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                active
                  ? "border-loss/50 bg-loss/15 text-loss"
                  : "border-line bg-bg text-ink-muted hover:text-ink"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EmptyFiltersState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-line bg-bg-card/50 py-16 text-center">
      <Search className="mb-3 h-6 w-6 text-ink-faint" />
      <p className="text-sm font-medium text-ink">Ningún fantasma matchea</p>
      <p className="mt-1 max-w-xs text-xs text-ink-muted">
        Ajustá los filtros o limpiálos para volver a ver el feed completo.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-4 flex items-center gap-1.5 rounded-md border border-line bg-bg px-3 py-1.5 text-xs text-ink-muted hover:text-ink"
      >
        <RotateCcw className="h-3 w-3" />
        Limpiar filtros
      </button>
    </div>
  );
}

function AllDoneState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-ok/30 bg-ok/5 py-20 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-ok/20 text-ok">
        <Sparkles className="h-6 w-6" strokeWidth={2.4} />
      </div>
      <h3 className="text-balance text-lg font-semibold text-ink">
        Rescataste todos los fantasmas pendientes
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
