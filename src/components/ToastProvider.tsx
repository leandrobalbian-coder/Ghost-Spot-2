"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, AlertCircle } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ToastVariant = "success" | "info" | "error";

type Toast = {
  id: string;
  message: string;
  variant: ToastVariant;
};

type Ctx = {
  show: (message: string, variant?: ToastVariant) => void;
};

const ToastCtx = createContext<Ctx | null>(null);

export function useToast(): Ctx {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const VARIANT_STYLES: Record<ToastVariant, { ring: string; icon: ReactNode }> = {
  success: {
    ring: "border-ok/40 bg-ok/10",
    icon: <CheckCircle2 className="h-4 w-4 text-ok" strokeWidth={2.4} />,
  },
  info: {
    ring: "border-line bg-bg-card",
    icon: <Info className="h-4 w-4 text-ink-muted" strokeWidth={2.4} />,
  },
  error: {
    ring: "border-loss/40 bg-loss/10",
    icon: <AlertCircle className="h-4 w-4 text-loss" strokeWidth={2.4} />,
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const show = useCallback((message: string, variant: ToastVariant = "info") => {
    const id = `t-${Date.now()}-${counter.current++}`;
    setToasts((prev) => [...prev, { id, message, variant }]);
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 3200);
    return () => clearTimeout(timer);
  }, [toasts]);

  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <div className="pointer-events-none fixed bottom-20 left-1/2 z-[60] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4 md:bottom-6">
        <AnimatePresence>
          {toasts.map((t) => {
            const v = VARIANT_STYLES[t.variant];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className={`pointer-events-auto flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm shadow-modal backdrop-blur-md ${v.ring}`}
              >
                {v.icon}
                <span className="text-ink">{t.message}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}
