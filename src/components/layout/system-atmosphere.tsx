"use client";

import { usePathname } from "next/navigation";
import { useAppStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";

const INTELLIGENCE_PATHS = ["/analyst", "/dna", "/review"];

export function SystemAtmosphere() {
  const pathname = usePathname();
  const novusOpen = useAppStore((state) => state.novusOpen);
  const intelligenceContext = INTELLIGENCE_PATHS.some((path) => pathname.startsWith(path));

  return (
    <div
      aria-hidden="true"
      className={cn(
        "os-atmosphere pointer-events-none fixed inset-0 -z-10",
        pathname === "/dashboard" && "os-atmosphere--now",
        intelligenceContext && "os-atmosphere--intelligence",
        novusOpen && "os-atmosphere--novus"
      )}
    >
      <span className="os-light-field os-light-field--primary" />
      <span className="os-light-field os-light-field--depth" />
    </div>
  );
}
