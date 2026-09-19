"use client";

import { NowLiquidField } from "./now-liquid-field";
import { cn } from "@/lib/utils";

const variants = { tasks: 0, habits: 1, goals: 2 } as const;

/** One shared, real-time optical environment for propagated Spaces. It reuses
 * the canonical Now material clock and shader without adding per-card loops. */
export function SecondarySpaceField({ space, className }: { space: keyof typeof variants; className?: string }) {
  return <div className={cn("secondary-space-field", className)} data-space={space} aria-hidden="true">
    <NowLiquidField secondary spaceVariant={variants[space]} pixelRatioCap={1.2} />
  </div>;
}
