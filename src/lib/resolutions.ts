"use client";

export type ResolutionType = "rescued" | "not_actionable" | "dismissed";

export type Resolution = {
  conv_id: string;
  resolution_type: ResolutionType;
  resolved_at: string;
  message_copied: boolean;
  notes?: string;
};

const STORAGE_KEY = "ghosts_resolutions_v1";
const VALUE_PER_RESCUE = 540; // 30% × 10% × $18K MXN

const memoryFallback: Map<string, Resolution> = new Map();

function readStorage(): Resolution[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Resolution[]) : [];
  } catch {
    return Array.from(memoryFallback.values());
  }
}

function writeStorage(items: Resolution[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    memoryFallback.clear();
    items.forEach((r) => memoryFallback.set(r.conv_id, r));
  }
}

export function getResolutions(): Resolution[] {
  return readStorage();
}

export function saveResolution(resolution: Resolution): void {
  const existing = readStorage().filter((r) => r.conv_id !== resolution.conv_id);
  writeStorage([...existing, resolution]);
  notify();
}

export function isResolved(conv_id: string): boolean {
  return readStorage().some((r) => r.conv_id === conv_id);
}

export function getResolution(conv_id: string): Resolution | undefined {
  return readStorage().find((r) => r.conv_id === conv_id);
}

export function resetResolutions(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    memoryFallback.clear();
  }
  notify();
}

export function getStats() {
  const resolutions = readStorage();
  const rescued = resolutions.filter((r) => r.resolution_type === "rescued").length;

  // Average gap between consecutive resolutions (in seconds), useful as a
  // quality-of-work signal for Sales testers — too fast may mean rushed,
  // too slow may mean stuck. Computed on >= 2 resolutions.
  const sortedTs = resolutions
    .map((r) => new Date(r.resolved_at).getTime())
    .sort((a, b) => a - b);
  let avg_gap_seconds = 0;
  if (sortedTs.length >= 2) {
    const totalMs = sortedTs[sortedTs.length - 1] - sortedTs[0];
    avg_gap_seconds = Math.round(totalMs / (sortedTs.length - 1) / 1000);
  }

  return {
    total_resolved: resolutions.length,
    rescued,
    dismissed: resolutions.filter((r) => r.resolution_type === "dismissed").length,
    not_actionable: resolutions.filter((r) => r.resolution_type === "not_actionable").length,
    estimated_value_recovered: rescued * VALUE_PER_RESCUE,
    avg_gap_seconds,
  };
}

export function formatGap(seconds: number): string {
  if (!seconds || seconds <= 0) return "—";
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return s > 0 ? `${m}m ${s}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return mm > 0 ? `${h}h ${mm}m` : `${h}h`;
}

// Pub-sub so feed/profile re-render when resolutions change
type Listener = () => void;
const listeners: Set<Listener> = new Set();

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notify() {
  listeners.forEach((l) => {
    try {
      l();
    } catch {}
  });
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) notify();
  });
}
