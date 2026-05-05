import { Sparkles, TrendingDown } from "lucide-react";
import { TimelineChart } from "@/components/TimelineChart";
import { metrics, timeline } from "@/lib/data";
import { formatDateLong, formatNumber } from "@/lib/format";

export default function TimelinePage() {
  const weeks = timeline.weekly_breakdown;
  const pre = weeks.filter((w) => !w.is_post_break);
  const post = weeks.filter((w) => w.is_post_break);

  const sum = (arr: typeof weeks, key: "ghosts" | "total_convs") =>
    arr.reduce((s, w) => s + w[key], 0);

  const preTotal = sum(pre, "ghosts");
  const postTotal = sum(post, "ghosts");
  const preAvgRatio =
    pre.length > 0
      ? Math.round((preTotal / sum(pre, "total_convs")) * 100)
      : 0;
  const postAvgRatio =
    post.length > 0
      ? Math.round((postTotal / sum(post, "total_convs")) * 100)
      : 0;

  const preWeekly = Math.round(preTotal / pre.length);
  const postWeekly = Math.round(postTotal / post.length);

  const COMMISSION = metrics.calculation_breakdown.average_commission_mxn;
  const RATE_PRODUCT =
    metrics.calculation_breakdown.lead_to_appointment_rate *
    metrics.calculation_breakdown.appointment_to_contract_rate;

  const preLost = Math.round(preTotal * RATE_PRODUCT * COMMISSION);
  const postLost = Math.round(postTotal * RATE_PRODUCT * COMMISSION);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-6 md:px-6 md:pt-10">
      {/* Header */}
      <header className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-loss/30 bg-loss/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-widest text-loss">
          <TrendingDown className="h-3 w-3" strokeWidth={2.5} />
          <span>Patrón temporal</span>
        </div>
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          El break del 2 de febrero
        </h1>
        <p className="mt-2 max-w-2xl text-balance text-sm text-ink-muted md:text-base">
          Conversaciones que NO generaron lead operativo, por semana ISO. Enero–abril 2026.{" "}
          <span className="text-ink-dim">
            La línea roja marca el momento exacto en que la tasa cayó de ~50% a ~13%.
          </span>
        </p>
      </header>

      {/* Chart */}
      <div className="rounded-lg border border-line bg-bg-card p-4 md:p-6">
        <TimelineChart data={weeks} />
        <div className="mt-3 flex items-center justify-between font-mono text-[11px] tabular-nums text-ink-faint">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-line-strong" /> pre-break
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-loss" /> post-break
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <PeriodCard
          label="Pre-break (4 sem)"
          tone="neutral"
          ghosts={preTotal}
          weekly={preWeekly}
          ratio={preAvgRatio}
          lost={preLost}
        />
        <PeriodCard
          label="Post-break (12 sem)"
          tone="loss"
          ghosts={postTotal}
          weekly={postWeekly}
          ratio={postAvgRatio}
          lost={postLost}
        />
        <DiffCard preRatio={preAvgRatio} postRatio={postAvgRatio} />
      </div>

      {/* Narrative closer — ties the timeline back to the product pitch */}
      <div className="mt-6 flex flex-col gap-3 overflow-hidden rounded-lg border border-loss/40 bg-loss/5 p-5 md:flex-row md:items-start md:gap-4 md:p-6">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-loss/15 text-loss">
          <Sparkles className="h-4 w-4" strokeWidth={2.4} />
        </div>
        <div className="space-y-2">
          <p className="text-balance text-base font-semibold text-ink md:text-lg">
            Si esta herramienta hubiera estado activa el 2 de febrero, habríamos detectado el break en la primera semana.
          </p>
          <p className="text-balance text-sm text-ink-muted">
            Hoy lo descubrimos{" "}
            <span className="font-mono tabular-nums">3 meses</span> tarde. Cada semana sin un sistema de
            detección de fantasmas son ~<span className="font-mono tabular-nums">{Math.round(postWeekly)}</span>{" "}
            leads que no llegan a un broker.
          </p>
        </div>
      </div>

      {/* Footnote */}
      <p className="mt-8 max-w-3xl text-balance text-xs text-ink-faint">
        Fuente: análisis cruzado de PostgreSQL <span className="font-mono">bt_conv_conversations</span> vs MySQL{" "}
        <span className="font-mono">project_requirements</span>. Período {formatDateLong(weeks[0].week_start)} –{" "}
        {formatDateLong(weeks[weeks.length - 1].week_start)}. El break del 2-feb antecede en 5 semanas a la migración
        del agente monolítico (9-mar), descartando esa hipótesis como causa raíz.
      </p>
    </div>
  );
}

function PeriodCard({
  label,
  tone,
  ghosts,
  weekly,
  ratio,
  lost,
}: {
  label: string;
  tone: "neutral" | "loss";
  ghosts: number;
  weekly: number;
  ratio: number;
  lost: number;
}) {
  const isLoss = tone === "loss";
  return (
    <div
      className={`overflow-hidden rounded-lg border p-4 md:p-5 ${
        isLoss ? "border-loss/30 bg-loss/5" : "border-line bg-bg-card"
      }`}
    >
      <p className="mb-3 text-[10px] uppercase tracking-widest text-ink-faint">{label}</p>
      <div className="mb-1 flex items-baseline gap-2">
        <span
          className={`font-mono text-3xl font-semibold tabular-nums md:text-4xl ${
            isLoss ? "text-loss" : "text-ink"
          }`}
        >
          {formatNumber(ghosts)}
        </span>
        <span className="text-xs text-ink-muted">ghosts</span>
      </div>
      <div className="font-mono text-[11px] tabular-nums text-ink-dim">
        ~{formatNumber(weekly)}/sem · {ratio}% de las convs
      </div>
      <div className="mt-3 flex items-baseline justify-between border-t border-line-subtle pt-2.5 text-xs">
        <span className="text-ink-muted">Comisión perdida</span>
        <span
          className={`font-mono font-semibold tabular-nums ${
            isLoss ? "text-loss" : "text-ink"
          }`}
        >
          ${formatNumber(lost)}
        </span>
      </div>
    </div>
  );
}

function DiffCard({ preRatio, postRatio }: { preRatio: number; postRatio: number }) {
  // Compose the headline ratios: pre ≈ "1 de cada 2", post ≈ "9 de cada 10"
  const preDenom = Math.max(2, Math.round(100 / preRatio));
  const postDenom = Math.max(2, Math.round(100 / postRatio));
  return (
    <div className="overflow-hidden rounded-lg border border-loss/40 bg-loss/5 p-4 md:p-5">
      <p className="mb-3 text-[10px] uppercase tracking-widest text-ink-faint">Tasa de pérdida</p>
      <div className="mb-1 flex items-baseline gap-2">
        <span className="font-mono text-3xl font-semibold tabular-nums text-ink-muted md:text-4xl">
          {preRatio}%
        </span>
        <span className="text-ink-faint">→</span>
        <span className="font-mono text-3xl font-semibold tabular-nums text-loss md:text-4xl">
          {postRatio}%
        </span>
      </div>
      <div className="font-mono text-[11px] tabular-nums text-ink-dim">
        de las conversaciones se pierden
      </div>
      <p className="mt-3 border-t border-line-subtle pt-2.5 text-xs leading-relaxed text-ink">
        El chatbot pasó de perder{" "}
        <span className="font-mono font-semibold tabular-nums">1 de cada {preDenom}</span> leads a
        perder casi{" "}
        <span className="font-mono font-semibold tabular-nums text-loss">
          {Math.round(postRatio / 10)} de cada 10
        </span>
        .
      </p>
    </div>
  );
}
