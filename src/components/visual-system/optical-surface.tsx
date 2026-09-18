import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type OpticalLight = "upper" | "stream" | "cadence" | "quiet" | "signal";

/** Shared smoked-glass material. Lighting describes the local environment,
 * not a metric value. No pointer loop or additional graphics context. */
export function OpticalSurface({ children, className, light = "upper", as: Tag = "section", ...props }: {
  children: ReactNode;
  className?: string;
  light?: OpticalLight;
  as?: "section" | "article";
} & HTMLAttributes<HTMLElement>) {
  return <Tag {...props} className={cn("target-instrument optical-surface", className)} data-optical-light={light}>{children}</Tag>;
}
