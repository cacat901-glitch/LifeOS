"use client";

import Image from "next/image";
import { useRef } from "react";
import { cn } from "@/lib/utils";

type NovusCoreState = "idle" | "attention" | "positive" | "invoked" | "thinking";

interface NovusCoreProps {
  state?: NovusCoreState;
  variant?: "hero" | "panel" | "mark";
  className?: string;
}

export function NovusCore({ state = "idle", variant = "hero", className }: NovusCoreProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    if (rootRef.current) rootRef.current.style.cssText = `--core-x:${x * 8}px;--core-y:${y * 6}px;--core-depth-x:${x * -3}px;--core-depth-y:${y * -2}px`;
  };

  const resetPointer = () => {
    if (rootRef.current) rootRef.current.style.cssText = "--core-x:0px;--core-y:0px;--core-depth-x:0px;--core-depth-y:0px";
  };

  return (
    <div
      ref={rootRef}
      className={cn("novus-core", `novus-core--${variant}`, `novus-core--${state}`, className)}
      data-core-state={state}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      aria-hidden="true"
    >
      <div className="novus-core__image novus-core__image--depth">
        <Image src="/media/novus-core-transparent.png" alt="" fill sizes={variant === "panel" ? "520px" : "(max-width: 767px) 92vw, 760px"} priority={variant === "hero"} />
      </div>
      <div className="novus-core__image novus-core__image--surface">
        <Image src="/media/novus-core-transparent.png" alt="" fill sizes={variant === "panel" ? "520px" : "(max-width: 767px) 92vw, 760px"} priority={variant === "hero"} />
      </div>
    </div>
  );
}
