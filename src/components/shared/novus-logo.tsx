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
 * NovusMark — editorial lime mark (a rounded square with a display "N").
 * Uses the theme accent so it stays cohesive everywhere it appears.
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
        "relative flex shrink-0 items-center justify-center bg-primary font-display font-bold leading-none text-primary-foreground",
        s.rounded,
        className
      )}
      style={{ width: s.px, height: s.px, minWidth: s.px, fontSize: s.fontSize }}
    >
      <span className="select-none tracking-tight">N</span>
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
