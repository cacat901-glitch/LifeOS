import { AppSidebar } from "@/components/layout/sidebar";
import { AppHeader } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { CommandCenter } from "@/components/command/command-center";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen bg-background">
      {/* Subtle editorial grid backdrop */}
      <div className="grid-bg pointer-events-none fixed inset-0 -z-10 opacity-[0.4]" />

      {/* Desktop sidebar — hidden on mobile (bottom nav used instead) */}
      <AppSidebar />

      {/* Main content area */}
      <div className="flex min-h-screen flex-1 flex-col lg:ml-[248px]">
        <AppHeader />
        <main className="flex-1 overflow-x-hidden px-4 py-5 pb-28 md:px-6 md:py-6 lg:px-10 lg:py-8 lg:pb-10">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>

      {/* Mobile bottom tab bar — only on < lg screens */}
      <BottomNav />

      {/* Global ⌘K command center */}
      <CommandCenter />
    </div>
  );
}
