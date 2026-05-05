"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { maskEmail } from "@/lib/format";

export function EmailField({ email }: { email: string }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="flex flex-col gap-0.5 bg-bg-card px-4 py-3 md:px-5">
      <span className="text-[10px] uppercase tracking-widest text-ink-faint">Email</span>
      <div className="flex items-center gap-2">
        <span className="break-all font-mono text-sm tabular-nums text-ink">
          {revealed ? email : maskEmail(email)}
        </span>
        <button
          type="button"
          onClick={() => setRevealed((v) => !v)}
          className="shrink-0 text-ink-muted hover:text-ink"
          aria-label={revealed ? "Ocultar email" : "Mostrar email completo"}
          title={revealed ? "Ocultar email" : "Mostrar email completo"}
        >
          {revealed ? (
            <EyeOff className="h-3.5 w-3.5" strokeWidth={2.2} />
          ) : (
            <Eye className="h-3.5 w-3.5" strokeWidth={2.2} />
          )}
        </button>
      </div>
    </div>
  );
}
