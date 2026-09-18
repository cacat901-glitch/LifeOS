"use client";

import { usePathname } from "next/navigation";
import { useAppStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";
import { AmbientField, type AmbientMode } from "@/components/visual-system/ambient-field";

const INTELLIGENCE_PATHS = ["/analyst", "/dna", "/review"];

function modeForPath(pathname: string): AmbientMode {
  if (pathname === "/dashboard") return "now";
  if (pathname.startsWith("/tasks") || pathname.startsWith("/projects")) return "execution";
  if (pathname.startsWith("/habits") || pathname.startsWith("/workout")) return "rhythm";
  if (pathname.startsWith("/goals") || pathname.startsWith("/timeline")) return "direction";
  if (pathname.startsWith("/journal") || pathname.startsWith("/mood")) return "calm";
  if (pathname.startsWith("/finance") || pathname.startsWith("/statistics")) return "data";
  if (INTELLIGENCE_PATHS.some((path) => pathname.startsWith(path))) return "intelligence";
  return "settings";
}

export function SystemAtmosphere() {
  const pathname = usePathname();
  const novusOpen = useAppStore((state) => state.novusOpen);
  const intelligenceContext = INTELLIGENCE_PATHS.some((path) => pathname.startsWith(path));
  // Now owns its material at both breakpoints; never run a second ambient
  // graphics context underneath it. Other routes retain their atmosphere.
  if (pathname === "/dashboard") return null;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "os-atmosphere pointer-events-none fixed inset-0 -z-10",
        pathname === "/dashboard" && "os-atmosphere--now",
        intelligenceContext && "os-atmosphere--intelligence",
        novusOpen && "os-atmosphere--novus"
      )}
      data-ambient-mode={modeForPath(pathname)}
    >
      <AmbientField mode={modeForPath(pathname)} active={novusOpen} />
      <span className="os-light-field os-light-field--primary" />
      <span className="os-light-field os-light-field--depth" />
    </div>
  );
}
