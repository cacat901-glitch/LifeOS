import { cn } from "@/lib/utils";

interface NovusLogoProps {
  size?: "sm" | "md" | "lg";
  withWordmark?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { box: "h-8 w-8 rounded-xl text-sm", text: "text-lg" },
  md: { box: "h-10 w-10 rounded-2xl text-lg", text: "text-xl" },
  lg: { box: "h-14 w-14 rounded-2xl text-2xl", text: "text-3xl" },
};

/** The Novus mark — a glowing gradient glyph. */
export function NovusMark({ size = "md", className }: { size?: NovusLogoProps["size"]; className?: string }) {
  const s = sizeMap[size!];
  return (
    <div
      className={cn(
        "relative flex items-center justify-center font-bold text-white shrink-0",
        "bg-gradient-to-br from-indigo-500 via-violet-500 to-sky-400",
        "shadow-[0_8px_24px_-6px_rgba(99,102,241,0.7)]",
        s.box,
        className
      )}
    >
      <span className="relative z-10 tracking-tight">N</span>
      <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-br from-white/30 to-transparent opacity-60" />
    </div>
  );
}

export function NovusLogo({ size = "md", withWordmark = true, className }: NovusLogoProps) {
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
