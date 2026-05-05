"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Ghost, BarChart3, User, Sparkles, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { getActiveTester, getStats, subscribe } from "@/lib/resolutions";

const links = [
  { href: "/", label: "Resumen", icon: Activity },
  { href: "/feed", label: "Feed", icon: Ghost },
  { href: "/timeline", label: "Timeline", icon: BarChart3 },
  { href: "/profile", label: "Perfil", icon: User },
];

const DEMO_FLAG_KEY = "ghosts_demo_mode";

export function TopNav() {
  const pathname = usePathname();
  const [rescued, setRescued] = useState(0);
  const [demoMode, setDemoMode] = useState(false);
  const [tester, setTester] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setRescued(getStats().rescued);
    update();
    return subscribe(update);
  }, []);

  useEffect(() => {
    const read = () => {
      try {
        setDemoMode(window.sessionStorage.getItem(DEMO_FLAG_KEY) === "1");
      } catch {
        setDemoMode(false);
      }
    };
    read();
    window.addEventListener("ghosts-demo-mode-change", read);
    return () => window.removeEventListener("ghosts-demo-mode-change", read);
  }, []);

  useEffect(() => {
    const read = () => setTester(getActiveTester());
    read();
    window.addEventListener("ghosts-tester-change", read);
    return () => window.removeEventListener("ghosts-tester-change", read);
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 z-40 border-b border-line-subtle bg-bg/80 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span aria-hidden className="relative flex h-6 w-6 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-loss/20 blur-md" />
            <span className="relative h-2 w-2 rounded-full bg-loss animate-pulse-loss" />
          </span>
          <span className="text-ink">
            ghosts<span className="text-ink-muted">.spot2.mx</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {links.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? "bg-bg-card text-ink"
                      : "text-ink-muted hover:text-ink hover:bg-bg-card/60"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2 md:gap-3">
          {tester && (
            <div
              className="flex items-center gap-1 rounded-full border border-loss/40 bg-loss/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-loss md:px-2.5 md:py-1"
              title={`Modo tester activo: rescates separados por usuario "${tester}"`}
            >
              <UserCircle className="h-3 w-3" strokeWidth={2.4} />
              <span className="max-w-[80px] truncate normal-case">{tester}</span>
            </div>
          )}
          {demoMode && (
            <div
              className="flex items-center gap-1 rounded-full border border-warm/40 bg-warm/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-warm md:px-2.5 md:py-1"
              title="Modo demo activo: localStorage reseteado al cargar"
            >
              <Sparkles className="h-3 w-3" strokeWidth={2.4} />
              <span>Demo</span>
            </div>
          )}
          {rescued > 0 && (
            <div className="hidden items-center gap-1.5 rounded-full border border-ok/30 bg-ok/10 px-2.5 py-1 text-xs font-medium text-ok md:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-ok" />
              <span className="tabular-nums">{rescued} rescatado{rescued === 1 ? "" : "s"}</span>
            </div>
          )}
          <span className="hidden text-[10px] uppercase tracking-widest text-ink-faint md:inline">
            Prototipo
          </span>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <ul className="fixed bottom-0 inset-x-0 z-40 flex items-center justify-around border-t border-line-subtle bg-bg/95 backdrop-blur-md md:hidden">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
                  active ? "text-loss" : "text-ink-dim"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={active ? 2.5 : 2} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </header>
  );
}
