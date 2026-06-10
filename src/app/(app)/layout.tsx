import { AppSidebar } from "@/components/layout/sidebar";
import { AppHeader } from "@/components/layout/header";
import { CommandCenter } from "@/components/command/command-center";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex">
      {/* Living aurora backdrop */}
      <div className="aurora"><div className="aurora-blob" /></div>
      <div className="noise" />

      <AppSidebar />

      <div className="flex-1 flex flex-col min-h-screen lg:ml-[260px]">
        <AppHeader />
        <main className="flex-1 px-4 md:px-6 lg:px-10 py-6 lg:py-8 overflow-x-hidden">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>

      {/* Global ⌘K command center */}
      <CommandCenter />
    </div>
  );
}
