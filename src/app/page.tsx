"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { ArrowRight, TrendingDown } from "lucide-react";
import { Counter } from "@/components/Counter";
import { metrics } from "@/lib/data";
import { formatDateLong } from "@/lib/format";
import { resetResolutions } from "@/lib/resolutions";

const DEMO_FLAG_KEY = "ghosts_demo_mode";

function DemoModeTrigger() {
  const search = useSearchParams();
  useEffect(() => {
    if (search.get("demo") === "1") {
      try {
        resetResolutions();
        window.sessionStorage.setItem(DEMO_FLAG_KEY, "1");
        window.dispatchEvent(new Event("ghosts-demo-mode-change"));
      } catch {}
    }
  }, [search]);
  return null;
}

export default function HomePage() {
  const {
    revenue_lost_mxn,
    total_ghosts,
    since_date,
    as_of_date,
    calculation_breakdown: breakdown,
  } = metrics;

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden">
      <Suspense fallback={null}>
        <DemoModeTrigger />
      </Suspense>
      {/* Background grid */}
      <div className="pointer-events-none absolute inset-0 grid-noise opacity-40" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-loss/10 blur-3xl" />

      <section className="relative mx-auto flex max-w-5xl flex-col items-center justify-center px-4 pb-28 pt-16 md:px-6 md:pt-24">
        {/* Severity badge */}
        <div className="animate-fade-in mb-8 inline-flex items-center gap-2 rounded-full border border-loss/30 bg-loss/10 px-3 py-1.5 text-xs font-medium uppercase tracking-widest text-loss">
          <TrendingDown className="h-3 w-3" strokeWidth={2.5} />
          <span>Pérdida operativa · feb&ndash;abr 2026</span>
        </div>

        {/* Eyebrow */}
        <p className="text-balance mb-4 max-w-xl text-center text-sm font-medium text-ink-muted md:text-base">
          Comisión potencial perdida en leads SS del chatbot
        </p>

        {/* Hero counter — fluid clamp so it never explodes between sm and md */}
        <h1
          className="text-balance mb-1 text-center font-mono font-semibold leading-none tracking-tighter text-loss"
          style={{ fontSize: "clamp(56px, 12vw, 140px)" }}
        >
          <span aria-hidden className="text-loss/40">$</span>
          <Counter to={revenue_lost_mxn} />
          <span className="ml-2 align-middle text-2xl font-medium text-ink-muted md:text-3xl">
            MXN
          </span>
        </h1>

        {/* Time anchor */}
        <p className="mb-12 mt-6 max-w-2xl text-balance text-center text-base text-ink-muted md:text-lg">
          <Counter to={total_ghosts} format={(n) => Math.round(n).toLocaleString("es-MX")} className="text-ink" />{" "}
          conversaciones reales que entraron, mostraron intención, y nunca llegaron a un broker.
        </p>

        {/* CTA */}
        <Link
          href="/feed"
          className="group inline-flex items-center gap-2 rounded-md bg-loss px-5 py-3 text-sm font-semibold text-white shadow-glow transition-all hover:bg-loss-deep hover:shadow-[0_0_60px_-8px_rgba(239,68,68,0.5)]"
        >
          Ver los fantasmas
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
        </Link>

        {/* Breakdown stats row */}
        <div className="mt-20 grid w-full max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-lg border border-line-subtle bg-line-subtle md:grid-cols-4">
          <Stat label="Ghosts totales" value={total_ghosts.toLocaleString("es-MX")} />
          <Stat label="Lead → cita" value={`${(breakdown.lead_to_appointment_rate * 100).toFixed(0)}%`} />
          <Stat label="Cita → contrato" value={`${(breakdown.appointment_to_contract_rate * 100).toFixed(0)}%`} />
          <Stat
            label="Comisión prom."
            value={`$${(breakdown.average_commission_mxn / 1000).toFixed(0)}K`}
          />
        </div>

        {/* Formula footer */}
        <p className="mt-10 max-w-3xl text-balance text-center text-xs text-ink-faint">
          <span className="tabular-nums font-mono">{total_ghosts}</span> ghosts ×{" "}
          <span className="tabular-nums font-mono">
            {(breakdown.lead_to_appointment_rate * 100).toFixed(0)}%
          </span>{" "}
          lead→cita ×{" "}
          <span className="tabular-nums font-mono">
            {(breakdown.appointment_to_contract_rate * 100).toFixed(0)}%
          </span>{" "}
          cita→contrato ×{" "}
          <span className="tabular-nums font-mono">${breakdown.average_commission_mxn.toLocaleString("es-MX")}</span>{" "}
          MXN comisión.
          <br className="hidden md:block" />
          Datos del análisis cruzado{" "}
          <span className="text-ink-dim">{formatDateLong(since_date)}</span>{" "}
          al <span className="text-ink-dim">{formatDateLong(as_of_date)}</span>.
        </p>

        {/* Bottom indicator */}
        <div className="mt-16 hidden items-center gap-1.5 text-[10px] uppercase tracking-widest text-ink-faint md:flex">
          <span className="h-px w-12 bg-line" />
          <span>Prototipo de validación</span>
          <span className="h-px w-12 bg-line" />
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 bg-bg-card px-4 py-4 md:px-6 md:py-5">
      <span className="text-[10px] uppercase tracking-widest text-ink-faint">{label}</span>
      <span className="tabular-nums font-mono text-2xl font-semibold text-ink md:text-3xl">{value}</span>
    </div>
  );
}
