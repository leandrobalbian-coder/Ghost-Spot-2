import { Building2, ExternalLink, MapPin } from "lucide-react";
import type { SuggestedSpot } from "@/types/ghost";
import { formatMXN } from "@/lib/format";

export function SpotCard({ spot }: { spot: SuggestedSpot }) {
  return (
    <a
      href={`https://spot2.mx/spots/${spot.spot_id}`}
      target="_blank"
      rel="noreferrer"
      className="group flex flex-col overflow-hidden rounded-lg border border-line bg-bg-card transition-colors hover:border-line-strong hover:bg-bg-hover"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-bg">
        {spot.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={spot.photo_url}
            alt={spot.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-faint">
            <Building2 className="h-8 w-8" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-card/95 via-transparent to-transparent" />
        <span className="absolute left-2 top-2 rounded border border-line-subtle bg-bg/80 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-ink-muted backdrop-blur-sm">
          {spot.sector}
        </span>
      </div>
      <div className="flex flex-col gap-2 p-3.5">
        <h4 className="line-clamp-2 text-sm font-semibold text-ink">{spot.title}</h4>
        <p className="flex items-center gap-1 text-xs text-ink-muted">
          <MapPin className="h-3 w-3" />
          {spot.location}
        </p>
        <div className="mt-1 flex items-baseline justify-between gap-2 border-t border-line-subtle pt-2.5">
          <span className="font-mono text-base font-semibold tabular-nums text-ink">
            {formatMXN(spot.price_mxn)}
            <span className="ml-0.5 text-[11px] font-normal text-ink-faint">/mes</span>
          </span>
          <span className="flex items-center gap-1 text-[11px] text-ink-dim group-hover:text-loss">
            Abrir
            <ExternalLink className="h-3 w-3" />
          </span>
        </div>
      </div>
    </a>
  );
}
