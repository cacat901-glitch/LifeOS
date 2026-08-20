import { cn } from "@/lib/utils";

export function SpaceHeading({
  eyebrow,
  title,
  description,
  action,
  intensity = "standard",
  className,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
  intensity?: "standard" | "calm" | "data" | "intelligence";
  className?: string;
}) {
  return (
    <header className={cn("space-heading", `space-heading--${intensity}`, className)}>
      <div className="space-heading__copy">
        <p className="space-heading__eyebrow">{eyebrow}</p>
        <h2 className="space-heading__title">{title}</h2>
        <p className="space-heading__description">{description}</p>
      </div>
      {action && <div className="space-heading__action">{action}</div>}
      <span className="space-heading__signal" aria-hidden="true" />
    </header>
  );
}
