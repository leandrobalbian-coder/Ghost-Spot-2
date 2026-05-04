"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, MessageCircle, Phone, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Ghost } from "@/types/ghost";
import { buildRescueMessage, formatPhoneFull, fullName } from "@/lib/format";
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
  const toast = useToast();

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
                className="flex h-8 w-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-bg-hover hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-4 p-5">
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

              {/* Note */}
              <p className="rounded-md border border-line-subtle bg-bg/60 px-3 py-2 text-xs text-ink-dim">
                <span className="text-ink-muted">Demo controlado:</span> el mensaje no se manda automáticamente. Copialo y enviarlo desde tu WhatsApp si querés probar real.
              </p>
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
