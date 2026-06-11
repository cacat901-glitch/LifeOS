import { cn } from "@/lib/utils";

interface NovusLogoProps {
  size?: "sm" | "md" | "lg";
  withWordmark?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { px: 32, text: "text-lg",  rounded: "rounded-xl",  fontSize: "14px" },
  md: { px: 40, text: "text-xl",  rounded: "rounded-2xl", fontSize: "18px" },
  lg: { px: 56, text: "text-3xl", rounded: "rounded-2xl", fontSize: "24px" },
};

/**
 * NovusMark — switches between:
 *  1. /logo.png  (when the file exists in /public/)
 *  2. Gradient N fallback (always looks intentional)
 *
 * To activate the real logo: upload logo.png to the /public/ folder in GitHub.
 * Then change USE_IMAGE_LOGO to true and redeploy.
 */
const USE_IMAGE_LOGO = false; // flip to true once /public/logo.png exists

export function NovusMark({
  size = "md",
  className,
}: {
  size?: NovusLogoProps["size"];
  className?: string;
}) {
  const s = sizeMap[size!];

  if (USE_IMAGE_LOGO) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/logo.png"
        alt="Novus"
        width={s.px}
        height={s.px}
        className={cn("block shrink-0 object-cover", s.rounded, className)}
        style={{ width: s.px, height: s.px, minWidth: s.px }}
      />
    );
  }

  return (
    <div
      className={cn(
        "relative shrink-0 flex items-center justify-center font-bold text-white",
        "bg-gradient-to-br from-indigo-500 via-violet-500 to-sky-400",
        "shadow-[0_8px_24px_-6px_rgba(99,102,241,0.7)]",
        s.rounded,
        className
      )}
      style={{ width: s.px, height: s.px, minWidth: s.px, fontSize: s.fontSize }}
    >
      <span className="relative z-10 tracking-tight select-none">N</span>
      <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-br from-white/25 to-transparent" />
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
