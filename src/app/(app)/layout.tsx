import { AppHeader } from "@/components/layout/header";
import { OperatingDock } from "@/components/layout/operating-dock";
import { CommandCenter } from "@/components/command/command-center";
import { NovusPanel } from "@/components/novus/novus-panel";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="novus-shell relative min-h-screen bg-background">
      <div className="os-atmosphere pointer-events-none fixed inset-0 -z-10" />
      <OperatingDock />
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <main className="flex-1 overflow-x-hidden px-4 pb-24 sm:px-6 md:px-8 md:pb-12 lg:px-10 xl:px-14">
          <div className="mx-auto w-full max-w-[1480px]">{children}</div>
        </main>
      </div>
      <CommandCenter />
      <NovusPanel />
    </div>
  );
}
