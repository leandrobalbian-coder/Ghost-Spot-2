"use client";

import { AlertCircle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-loss/15 text-loss">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h1 className="text-xl font-semibold text-ink">Algo se rompió</h1>
      <p className="mt-2 max-w-xs text-balance text-sm text-ink-muted">
        Hubo un error inesperado mientras renderizábamos esta vista. La demo es un prototipo, así que probablemente sea
        un edge case que no anticipamos.
      </p>
      {error.digest && (
        <p className="mt-3 font-mono text-[10px] tabular-nums text-ink-faint">digest · {error.digest}</p>
      )}
      <button
        type="button"
        onClick={reset}
        className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-loss px-3 py-2 text-xs font-semibold text-white hover:bg-loss-deep"
      >
        <RotateCcw className="h-3 w-3" />
        Volver a intentar
      </button>
    </div>
  );
}
