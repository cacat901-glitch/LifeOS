"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

interface NovusLogoProps {
  size?: "sm" | "md" | "lg";
  withWordmark?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { px: 32,  text: "text-lg",  rounded: "rounded-xl"  },
  md: { px: 40,  text: "text-xl",  rounded: "rounded-2xl" },
  lg: { px: 56,  text: "text-3xl", rounded: "rounded-2xl" },
};

// Raw GitHub URL — works immediately regardless of where logo.png is in the repo.
// Once logo.png is moved to /public/logo.png this can switch to just "/logo.png".
const LOGO_URL = "https://raw.githubusercontent.com/cacat901-glitch/LifeOS/main/logo.png";

/**
 * NovusMark — the Novus app icon.
 * Falls back to the gradient N if the image fails to load.
 */
export function NovusMark({
  size = "md",
  className,
}: {
  size?: NovusLogoProps["size"];
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const s = sizeMap[size!];

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden flex items-center justify-center",
        s.rounded,
        className
      )}
      style={{ width: s.px, height: s.px, minWidth: s.px }}
    >
      {!failed ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={LOGO_URL}
          alt="Novus"
          width={s.px}
          height={s.px}
          onError={() => setFailed(true)}
          className="w-full h-full object-cover block"
          style={{ display: "block" }}
        />
      ) : (
        /* Fallback: gradient N while image loads or if it fails */
        <div
          className="w-full h-full flex items-center justify-center font-bold text-white"
          style={{
            background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)",
            fontSize: s.px * 0.45,
          }}
        >
          N
        </div>
      )}
    </div>
  );
}

export function NovusLogo({
  size = "md",
  withWordmark = true,
  className,
}: NovusLogoProps) {
  const s = sizeMap[size];
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <NovusMark size={size} />
      {withWordmark && (
        <span className={cn("font-semibold tracking-tight", s.text)}>
          Novus
        </span>
      )}
    </div>
  );
}
