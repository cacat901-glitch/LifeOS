import { AppSidebar } from "@/components/layout/sidebar";
import { AppHeader } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { CommandCenter } from "@/components/command/command-center";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex">
      {/* Living aurora backdrop */}
      <div className="aurora"><div className="aurora-blob" /></div>
      <div className="noise" />

      {/* Desktop sidebar — hidden on mobile */}
      <AppSidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-[260px]">
        <AppHeader />
        {/*
          On mobile:
          - pt-0 (header handles its own top spacing)
          - pb-24 leaves room for the bottom nav bar + iOS home indicator
          On desktop:
          - normal padding, no bottom nav
        */}
        <main className="flex-1 px-4 md:px-6 lg:px-10 py-4 md:py-6 lg:py-8 pb-28 lg:pb-8 overflow-x-hidden">
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
