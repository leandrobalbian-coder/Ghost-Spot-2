"use client";

import { useEffect } from "react";
import { setActiveTester } from "@/lib/resolutions";

// Reads ?tester=NAME from the URL on first mount and stores it in
// sessionStorage so subsequent navigation keeps the same tester active
// without polluting URL params. Lives in the root layout so it fires
// regardless of which page the tester lands on.
export function TesterTrigger() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      const raw = params.get("tester");
      if (!raw) return;
      // ?tester=1 → anonymous tester (legacy from P0 #4)
      const name = raw === "1" ? "anon" : raw.trim();
      if (name.length > 0) setActiveTester(name);
    } catch {}
  }, []);
  return null;
}
