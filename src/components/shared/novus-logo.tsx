import Image from "next/image";
import { cn } from "@/lib/utils";

interface NovusLogoProps {
  size?: "sm" | "md" | "lg";
  withWordmark?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { px: 32,  rounded: "rounded-xl",  text: "text-lg"   },
  md: { px: 40,  rounded: "rounded-2xl", text: "text-xl"   },
  lg: { px: 56,  rounded: "rounded-2xl", text: "text-3xl"  },
};

/**
 * The Novus mark — uses /public/logo.png.
 * The logo is a dark navy rounded-square icon so it naturally
 * looks correct on both dark and light backgrounds.
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
      className={cn(
        "relative shrink-0 overflow-hidden",
        s.rounded,
        // Subtle drop-shadow matching the navy logo colour
        "shadow-[0_8px_24px_-6px_rgba(30,58,138,0.5)]",
        className
      )}
      style={{ width: s.px, height: s.px }}
    >
      <Image
        src="/logo.png"
        alt="Novus"
        fill
        sizes={`${s.px}px`}
        className="object-cover"
        priority
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
        <span className={cn("font-semibold tracking-tight", s.text)}>
          Novus
        </span>
      )}
    </div>
  );
}
