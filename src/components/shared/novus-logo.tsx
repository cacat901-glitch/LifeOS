import Image from "next/image";
import { cn } from "@/lib/utils";

interface NovusLogoProps {
  size?: "sm" | "md" | "lg";
  withWordmark?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { px: 28, text: "text-lg" },
  md: { px: 38, text: "text-xl" },
  lg: { px: 54, text: "text-3xl" },
};

/**
 * NovusMark — the liquid woven mark from the canonical Novus reference.
 */
export function NovusMark({
  size = "md",
  className,
}: {
  size?: NovusLogoProps["size"];
  className?: string;
}) {
  const s = sizeMap[size!];

  return (
    <div
      className={cn("relative shrink-0 overflow-hidden", className)}
      style={{ width: s.px, height: s.px, minWidth: s.px }}
    >
      <Image
        src="/media/novus-liquid-mark.png"
        alt=""
        fill
        priority
        sizes={`${s.px}px`}
        className="scale-[2.05] object-contain mix-blend-screen"
      />
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
        <span className={cn("font-semibold tracking-tight", s.text)}>Novus</span>
      )}
    </div>
  );
}
