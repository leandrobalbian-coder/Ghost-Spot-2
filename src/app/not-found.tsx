import Link from "next/link";
import { ArrowLeft, Ghost as GhostIcon } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-loss/20 blur-2xl" />
        <GhostIcon className="relative h-12 w-12 text-loss" strokeWidth={1.6} />
      </div>
      <h1 className="font-mono text-5xl font-semibold tabular-nums text-loss">404</h1>
      <p className="mt-2 text-balance text-sm text-ink-muted">
        Este fantasma se desvaneció. La conversación que buscás no existe o fue removida del mock.
      </p>
      <Link
        href="/feed"
        className="mt-6 inline-flex items-center gap-1.5 rounded-md border border-line bg-bg-card px-3 py-2 text-xs font-medium text-ink hover:bg-bg-hover"
      >
        <ArrowLeft className="h-3 w-3" />
        Volver al feed
      </Link>
    </div>
  );
}
