"use client";

import { ArrowLeft, Building2, CheckCircle2, Clock, MapPin, MessageCircle, Phone, Sparkles } from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MessageBubble } from "@/components/MessageBubble";
import { RescueModal } from "@/components/RescueModal";
import { ScoreBadge } from "@/components/ScoreBadge";
import { SpotCard } from "@/components/SpotCard";
import { findGhost } from "@/lib/data";
import {
  formatDateLong,
  formatTime,
  fullName,
  maskPhone,
} from "@/lib/format";
import { getResolution, subscribe } from "@/lib/resolutions";
import type { Resolution } from "@/lib/resolutions";

export default function GhostDetailPage() {
  const params = useParams<{ conv_id: string }>();
  const ghost = findGhost(params.conv_id);
  const [resolution, setResolution] = useState<Resolution | undefined>(undefined);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!ghost) return;
    const sync = () => setResolution(getResolution(ghost.conv_id));
    sync();
    return subscribe(sync);
  }, [ghost]);

  const conversationMeta = useMemo(() => {
    if (!ghost) return null;
    const start = new Date(ghost.conv_start_date);
    const end = new Date(ghost.conv_end_date);
    const duration = Math.round((end.getTime() - start.getTime()) / 60000);
    return {
      start,
      duration,
    };
  }, [ghost]);

  if (!ghost) return notFound();

  return (
    <>
      <div className="mx-auto max-w-4xl px-4 pb-32 pt-4 md:px-6 md:pt-8">
        {/* Back */}
        <Link
          href="/feed"
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al feed
        </Link>

        {/* Resolved banner */}
        {resolution && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 flex items-center justify-between gap-3 rounded-md border border-ok/30 bg-ok/10 px-4 py-3"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-ok" strokeWidth={2.4} />
              <p className="text-sm text-ink">
                <span className="font-semibold">Lead ya {labelFor(resolution.resolution_type)}</span>{" "}
                <span className="text-ink-muted">
                  el {formatDateLong(resolution.resolved_at)}
                </span>
              </p>
            </div>
          </motion.div>
        )}

        {/* Header card */}
        <header className="overflow-hidden rounded-lg border border-line bg-bg-card">
          <div className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:p-6">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <ScoreBadge score={ghost.intent_score} size="md" />
                <span className="text-[11px] uppercase tracking-widest text-ink-faint">
                  conv #{ghost.conv_id}
                </span>
              </div>
              <h1 className="text-balance text-2xl font-semibold tracking-tight text-ink md:text-3xl">
                {fullName(ghost)}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink-muted">
                <span className="inline-flex items-center gap-1.5 font-mono tabular-nums">
                  <Phone className="h-3.5 w-3.5" />
                  {maskPhone(ghost.lead_phone_number)}
                </span>
                {ghost.spot_sector && (
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" />
                    {ghost.spot_sector}
                  </span>
                )}
                {ghost.profile_state && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {ghost.profile_state}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 font-mono tabular-nums">
                  <Clock className="h-3.5 w-3.5" />
                  hace {ghost.days_since}d
                </span>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-px overflow-hidden rounded-md border border-line-subtle bg-line-subtle md:grid-cols-1 md:min-w-[200px]">
              <Mini label="Mensajes" value={String(ghost.messages_count)} />
              <Mini label="Spots vistos" value={String(ghost.spot2_links_count)} />
              <Mini
                label="Duración"
                value={conversationMeta ? `${conversationMeta.duration}m` : "—"}
              />
            </div>
          </div>

          {/* Profile fields */}
          {(ghost.profile_size || ghost.profile_budget || ghost.lead_email) && (
            <div className="grid grid-cols-1 gap-px border-t border-line-subtle bg-line-subtle md:grid-cols-3">
              {ghost.profile_size && (
                <ProfileField label="Tamaño / capacidad" value={ghost.profile_size} />
              )}
              {ghost.profile_budget && (
                <ProfileField label="Presupuesto" value={ghost.profile_budget} />
              )}
              {ghost.lead_email && (
                <ProfileField label="Email" value={ghost.lead_email} mono />
              )}
            </div>
          )}
        </header>

        {/* Conversation */}
        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-ink-muted">
              <MessageCircle className="h-3.5 w-3.5" />
              Conversación
            </h2>
            {conversationMeta && (
              <span className="font-mono text-[11px] tabular-nums text-ink-faint">
                {formatDateLong(ghost.conv_start_date)} · {formatTime(ghost.conv_start_date)}
              </span>
            )}
          </div>
          <div className="rounded-lg border border-line bg-bg-elevated p-4 md:p-6">
            <div className="flex flex-col gap-3">
              {ghost.messages.map((m, i) => (
                <MessageBubble key={i} role={m.role} content={m.content} timestamp={m.timestamp} />
              ))}
            </div>
          </div>
        </section>

        {/* Spots */}
        <section className="mt-8">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-ink-muted">
            <Sparkles className="h-3.5 w-3.5" />
            Spots que el chatbot le mostró
          </h2>
          {ghost.spots_suggested.length === 0 ? (
            <div className="rounded-lg border border-dashed border-line bg-bg-card/50 p-8 text-center">
              <Building2 className="mx-auto mb-2 h-6 w-6 text-ink-faint" />
              <p className="text-sm text-ink-muted">
                El chatbot no llegó a recomendar spots en esta conversación.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ghost.spots_suggested.map((spot) => (
                <SpotCard key={spot.spot_id} spot={spot} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Sticky CTA */}
      {!resolution && (
        <div className="fixed inset-x-0 bottom-12 z-30 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur-md md:bottom-0 md:py-4">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
            <div className="hidden flex-col md:flex">
              <span className="text-[10px] uppercase tracking-widest text-ink-faint">
                Listo para rescatar
              </span>
              <span className="text-sm font-medium text-ink">
                Mensaje contextualizado para {fullName(ghost)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-loss px-4 py-3 text-sm font-semibold text-white shadow-glow transition-colors hover:bg-loss-deep md:flex-none md:px-6"
            >
              <Sparkles className="h-4 w-4" />
              Rescatar por WhatsApp
            </button>
          </div>
        </div>
      )}

      <RescueModal ghost={ghost} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-bg-card px-4 py-3 md:px-5">
      <div className="text-[10px] uppercase tracking-widest text-ink-faint">{label}</div>
      <div className="font-mono text-lg font-semibold tabular-nums text-ink md:text-xl">
        {value}
      </div>
    </div>
  );
}

function ProfileField({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 bg-bg-card px-4 py-3 md:px-5">
      <span className="text-[10px] uppercase tracking-widest text-ink-faint">{label}</span>
      <span className={`text-sm text-ink ${mono ? "font-mono tabular-nums break-all" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function labelFor(type: Resolution["resolution_type"]): string {
  switch (type) {
    case "rescued":
      return "rescatado";
    case "not_actionable":
      return "marcado no accionable";
    case "dismissed":
      return "dismisseado";
  }
}
