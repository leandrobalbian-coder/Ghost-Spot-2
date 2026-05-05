"use client";

import { AnimatePresence } from "framer-motion";
import { Filter, RotateCcw, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { GhostCard } from "@/components/GhostCard";
import { RescueModal } from "@/components/RescueModal";
import { useToast } from "@/components/ToastProvider";
import { ghosts, uniqueSectors, uniqueStates } from "@/lib/data";
import { getResolutions, resetResolutions, saveResolution, subscribe } from "@/lib/resolutions";
import type { Ghost } from "@/types/ghost";

type ScoreFilter = "all" | "high" | "mid" | "low";
type AgeFilter = "all" | "recent" | "mid" | "old";

const SCORE_CHIPS: { id: ScoreFilter; label: string; range: string }[] = [
  { id: "all", label: "Todos", range: "" },
  { id: "high", label: "Alto", range: "≥70" },
  { id: "mid", label: "Medio", range: "40-69" },
  { id: "low", label: "Bajo", range: "<40" },
];

const AGE_CHIPS: { id: AgeFilter; label: string; range: string }[] = [
  { id: "all", label: "Cualquiera", range: "" },
  { id: "recent", label: "Recientes", range: "≤14d" },
  { id: "mid", label: "Medios", range: "14-30d" },
  { id: "old", label: "Viejos", range: ">30d" },
];

function matchesAge(days: number, filter: AgeFilter): boolean {
  switch (filter) {
    case "recent":
      return days <= 14;
    case "mid":
      return days > 14 && days <= 30;
    case "old":
      return days > 30;
    default:
      return true;
  }
}

export default function FeedPage() {
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());
  const [sectors, setSectors] = useState<Set<string>>(new Set());
  const [states, setStates] = useState<Set<string>>(new Set());
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>("all");
  const [ageFilter, setAgeFilter] = useState<AgeFilter>("all");
  const [query, setQuery] = useState("");
  const [showResolved, setShowResolved] = useState(false);
  const visibleRef = useRef<Ghost[]>([]);
  const toast = useToast();
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

  // Keyboard shortcuts (desktop power-users):
  //   R → rescatar el primer ghost visible (top of the sorted feed)
  //   D → dismiss el primer ghost visible como "ya contactado"
  // Disabled when a modal is open or focus is in an input/textarea.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (activeGhost) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const top = visibleRef.current[0];
      if (!top) return;
      const k = e.key.toLowerCase();
      if (k === "r") {
        e.preventDefault();
        setActiveGhost(top);
      } else if (k === "d") {
        e.preventDefault();
        saveResolution({
          conv_id: top.conv_id,
          resolution_type: "dismissed",
          resolved_at: new Date().toISOString(),
          message_copied: false,
        });
        toast.show(
          `${top.lead_name ?? "Lead"} marcado como dismissed (D)`,
          "info"
        );
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeGhost, toast]);

  const sectorOptions = useMemo(() => uniqueSectors(), []);
  const stateOptions = useMemo(() => uniqueStates(), []);

  const visible = useMemo(() => {
    return ghosts
      .filter((g) => (showResolved ? true : !resolvedIds.has(g.conv_id)))
      .filter((g) => (sectors.size === 0 ? true : g.spot_sector ? sectors.has(g.spot_sector) : false))
      .filter((g) => (states.size === 0 ? true : g.profile_state ? states.has(g.profile_state) : false))
      .filter((g) => {
        if (scoreFilter === "all") return true;
        if (scoreFilter === "high") return g.intent_score >= 70;
        if (scoreFilter === "mid") return g.intent_score >= 40 && g.intent_score < 70;
        return g.intent_score < 40;
      })
      .filter((g) => matchesAge(g.days_since, ageFilter))
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
  }, [resolvedIds, sectors, states, scoreFilter, ageFilter, query, showResolved]);

  // Sync ref so keyboard shortcuts can read the freshest visible[0]
  // without re-binding the listener on every list change.
  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  const totalActive = ghosts.filter((g) => !resolvedIds.has(g.conv_id)).length;
  const allDone = totalActive === 0;
  const hasFilters =
    sectors.size > 0 ||
    states.size > 0 ||
    scoreFilter !== "all" ||
    ageFilter !== "all" ||
    query.length > 0;

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
    setAgeFilter("all");
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
          <div className="flex items-center gap-3">
            {resolvedIds.size > 0 && (
              <button
                type="button"
                onClick={() => setShowResolved((v) => !v)}
                className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  showResolved
                    ? "border-loss/40 bg-loss/10 text-loss"
                    : "border-line bg-bg-card text-ink-muted hover:text-ink"
                }`}
                title="Incluir los ghosts ya rescatados o dismisseados en el feed"
              >
                <span className="font-mono tabular-nums">{resolvedIds.size}</span>
                {showResolved ? "rescatados visibles" : "rescatados ocultos"}
              </button>
            )}
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-ink-faint">
              <span className="inline-flex h-2 w-2 animate-pulse-loss rounded-full bg-loss" />
              <span>{totalActive} activos</span>
            </div>
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
              {(sectors.size > 0 || states.size > 0 || ageFilter !== "all") && (
                <span className="ml-0.5 rounded bg-loss/20 px-1 font-mono tabular-nums text-loss">
                  {sectors.size + states.size + (ageFilter !== "all" ? 1 : 0)}
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
              {/* Age chip group — useful for Sales triaging by recency */}
              <div className="md:col-span-2">
                <p className="mb-2 text-[10px] uppercase tracking-widest text-ink-faint">
                  Antigüedad de la conversación
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {AGE_CHIPS.map((c) => {
                    const active = ageFilter === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setAgeFilter(c.id)}
                        className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                          active
                            ? "border-loss/50 bg-loss/15 text-loss"
                            : "border-line bg-bg text-ink-muted hover:text-ink"
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
              </div>
            </div>
          )}
        </div>

        {/* Empty / list */}
        {allDone ? (
          <AllDoneState />
        ) : visible.length === 0 ? (
          <EmptyFiltersState onReset={clearFilters} />
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {visible.map((g, i) => (
                  <GhostCard
                    key={g.conv_id}
                    ghost={g}
                    index={i}
                    onRescue={(g) => setActiveGhost(g)}
                  />
                ))}
              </AnimatePresence>
            </div>
            {/* Keyboard shortcut hint — desktop only */}
            <p className="mt-6 hidden items-center justify-center gap-3 text-[10px] uppercase tracking-widest text-ink-faint md:flex">
              <span className="inline-flex items-center gap-1">
                <kbd className="rounded border border-line bg-bg-card px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-ink-muted">
                  R
                </kbd>
                <span>rescatar</span>
              </span>
              <span className="text-ink-faint">·</span>
              <span className="inline-flex items-center gap-1">
                <kbd className="rounded border border-line bg-bg-card px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-ink-muted">
                  D
                </kbd>
                <span>dismiss</span>
              </span>
              <span className="text-ink-faint">·</span>
              <span>el primero visible</span>
            </p>
          </>
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
