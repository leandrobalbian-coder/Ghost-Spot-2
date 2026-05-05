"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, MessageCircle, Phone, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Ghost } from "@/types/ghost";
import { buildRescueMessage, formatPhoneFull, fullName } from "@/lib/format";

function leadSummary(ghost: Ghost): string {
  const parts: string[] = [];
  parts.push(ghost.lead_name ? `Buscó` : `Buscaba`);
  if (ghost.spot_sector) {
    parts.push(ghost.spot_sector.toLowerCase());
  } else {
    parts.push("un espacio");
  }
  if (ghost.profile_size) parts.push(`de ${ghost.profile_size}`);
  if (ghost.profile_budget) parts.push(`(${ghost.profile_budget})`);
  parts.push(`hace ${ghost.days_since} días`);
  return parts.join(" ") + ".";
}
import { saveResolution } from "@/lib/resolutions";
import { copyToClipboard } from "@/lib/clipboard";
import { useToast } from "@/components/ToastProvider";

type Props = {
  ghost: Ghost | null;
  open: boolean;
  onClose: () => void;
  onConfirmed?: (ghost: Ghost) => void;
};

export function RescueModal({ ghost, open, onClose, onConfirmed }: Props) {
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [testerMode, setTesterMode] = useState(false);
  const toast = useToast();

  useEffect(() => {
    // Read tester flag at modal open time (no Suspense needed).
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      setTesterMode(params.get("tester") === "1");
    } catch {
      setTesterMode(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setCopied(false);
      setConfirming(false);
    }
  }, [open]);

  if (!ghost) return null;

  const message = buildRescueMessage(ghost);

  const handleCopy = async () => {
    const ok = await copyToClipboard(message);
    if (ok) {
      setCopied(true);
      toast.show("Mensaje copiado", "success");
      setTimeout(() => setCopied(false), 2200);
    } else {
      toast.show("No se pudo copiar", "error");
    }
  };

  const handleConfirm = () => {
    setConfirming(true);
    saveResolution({
      conv_id: ghost.conv_id,
      resolution_type: "rescued",
      resolved_at: new Date().toISOString(),
      message_copied: copied,
    });
    toast.show(`${ghost.lead_name ?? "Lead"} marcado como rescatado`, "success");
    setTimeout(() => {
      onConfirmed?.(ghost);
      onClose();
    }, 280);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm md:items-center"
          onClick={onClose}
        >
          <motion.div
            key="panel"
            initial={{ y: "8%", opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: "5%", opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg overflow-hidden rounded-t-2xl border border-line bg-bg-card shadow-modal md:rounded-xl"
          >
            {/* Header */}
            <div className="flex items-start gap-3 border-b border-line-subtle p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-loss/10 text-loss">
                <Sparkles className="h-5 w-5" strokeWidth={2.2} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-widest text-ink-faint">
                  Rescatar lead
                </p>
                <h2 className="truncate text-base font-semibold text-ink md:text-lg">
                  {fullName(ghost)}
                </h2>
                <p className="mt-0.5 flex items-center gap-1.5 font-mono text-xs tabular-nums text-ink-muted">
                  <Phone className="h-3 w-3" />
                  {formatPhoneFull(ghost.lead_phone_number)}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="-mr-2 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-bg-hover hover:text-ink"
              >
                <X className="h-5 w-5" strokeWidth={2.2} />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-4 p-5">
              {/* Lead context — gives Sales the why-this-lead at a glance */}
              <div className="rounded-md border border-line-subtle bg-bg/60 p-3.5 text-xs leading-relaxed">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-ink-muted">
                  {ghost.spot_sector && <span>{ghost.spot_sector}</span>}
                  {ghost.spot_sector && ghost.profile_state && (
                    <span className="text-ink-faint">·</span>
                  )}
                  {ghost.profile_state && <span>{ghost.profile_state}</span>}
                </div>
                <p className="mt-1 text-ink">
                  {leadSummary(ghost)}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] tabular-nums text-ink-dim">
                  <span>
                    Score{" "}
                    <span
                      className={
                        ghost.intent_score >= 70
                          ? "font-semibold text-loss"
                          : ghost.intent_score >= 40
                          ? "font-semibold text-warm"
                          : "text-ink-muted"
                      }
                    >
                      {ghost.intent_score}
                    </span>
                  </span>
                  <span className="text-ink-faint">·</span>
                  <span>{ghost.messages_count} mensajes</span>
                  {ghost.spot2_links_count > 0 && (
                    <>
                      <span className="text-ink-faint">·</span>
                      <span>{ghost.spot2_links_count} spots vistos</span>
                    </>
                  )}
                </div>
                {ghost.last_user_message && (
                  <p className="mt-2 line-clamp-2 border-t border-line-subtle pt-2 text-ink-muted">
                    <span className="text-ink-faint">Última señal: </span>
                    <span className="italic">&ldquo;{ghost.last_user_message}&rdquo;</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-ink-faint">
                <MessageCircle className="h-3 w-3" />
                Mensaje pre-llenado
              </div>

              {/* WhatsApp-like bubble */}
              <div className="relative">
                <div className="rounded-2xl rounded-bl-sm bg-[#1F2A24] p-4 text-[15px] leading-relaxed text-ink shadow-[inset_0_0_0_1px_rgba(16,185,129,0.18)]">
                  <pre className="whitespace-pre-wrap font-sans">{message}</pre>
                  <div className="mt-2 flex justify-end gap-1 text-[10px] text-ink-dim">
                    <span className="tabular-nums">
                      {new Date().toLocaleTimeString("es-MX", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tester instructions — only shown in ?tester=1 mode for Sales testing.
                  In default (CEO demo) mode, the modal looks like production. */}
              {testerMode && (
                <p className="rounded-md border border-warm/30 bg-warm/5 px-3 py-2 text-xs text-ink-muted">
                  <span className="font-medium text-warm">Tester:</span> copiá el mensaje y pegalo en tu WhatsApp para hacer un rescate real. Después confirmá acá para registrarlo.
                </p>
              )}
            </div>

            {/* Footer actions */}
            <div className="flex flex-col gap-2 border-t border-line-subtle bg-bg/40 p-4 sm:flex-row sm:p-5">
              <button
                type="button"
                onClick={handleCopy}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors ${
                  copied
                    ? "border-ok/50 bg-ok/10 text-ok"
                    : "border-line bg-bg-card text-ink hover:bg-bg-hover"
                }`}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copiado" : "Copiar mensaje"}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={confirming}
                className="flex flex-1 items-center justify-center gap-2 rounded-md bg-loss px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-colors hover:bg-loss-deep disabled:opacity-60"
              >
                <Check className="h-4 w-4" strokeWidth={2.6} />
                Confirmar rescate
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
