import type { Ghost } from "@/types/ghost";

export function maskPhone(phone: string): string {
  // +525512342845 → +52 55 ••••2845
  if (!phone) return "";
  const digits = phone.replace(/[^\d]/g, "");
  if (digits.length < 10) return "•••• ••••";
  const last4 = digits.slice(-4);
  const country = digits.length > 10 ? digits.slice(0, digits.length - 10) : "52";
  const area = digits.slice(-10, -8);
  return `+${country} ${area} ••••${last4}`;
}

export function formatPhoneFull(phone: string): string {
  if (!phone) return "";
  const digits = phone.replace(/[^\d]/g, "");
  if (digits.length < 10) return phone;
  const last4 = digits.slice(-4);
  const mid = digits.slice(-8, -4);
  const area = digits.slice(-10, -8);
  const country = digits.length > 10 ? digits.slice(0, digits.length - 10) : "52";
  return `+${country} ${area} ${mid} ${last4}`;
}

export function shortName(ghost: Pick<Ghost, "lead_name" | "lead_last_name">): string {
  if (!ghost.lead_name) return "Anónimo";
  const initial = ghost.lead_last_name?.[0];
  return initial ? `${ghost.lead_name} ${initial}.` : ghost.lead_name;
}

export function fullName(ghost: Pick<Ghost, "lead_name" | "lead_last_name">): string {
  if (!ghost.lead_name) return "Sin nombre identificado";
  return `${ghost.lead_name} ${ghost.lead_last_name ?? ""}`.trim();
}

export function scoreTier(score: number): "high" | "mid" | "low" {
  if (score >= 70) return "high";
  if (score >= 40) return "mid";
  return "low";
}

export function scoreLabel(score: number): string {
  const tier = scoreTier(score);
  return tier === "high" ? "Alto" : tier === "mid" ? "Medio" : "Bajo";
}

export function formatMXN(n: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("es-MX").format(n);
}

export function formatDateLong(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
  }).format(d);
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

export function timeSince(iso: string): string {
  const now = new Date();
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `hace ${days} días`;
  const weeks = Math.floor(days / 7);
  if (weeks < 12) return `hace ${weeks} sem`;
  const months = Math.floor(days / 30);
  return `hace ${months} meses`;
}

export function buildRescueMessage(ghost: Ghost): string {
  const greeting = ghost.lead_name ? `Hola ${ghost.lead_name}` : "Hola, qué tal";
  const sector = ghost.spot_sector?.toLowerCase() ?? "un espacio comercial";
  const location = ghost.profile_state ? ` en ${ghost.profile_state}` : "";
  const timeRef =
    ghost.days_since < 30 ? `hace ${ghost.days_since} días` : `hace algunas semanas`;

  return `${greeting}, te contacto desde Spot2.

Veo que ${timeRef} escribiste buscando ${sector}${location}. ¿Sigues en la búsqueda?

Tengo algunas opciones que podrían interesarte. ¿Tienes 2 minutos para platicar?`;
}

export function truncate(text: string | null | undefined, max = 200): string {
  if (!text) return "";
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}
