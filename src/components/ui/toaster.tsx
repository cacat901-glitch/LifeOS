"use client";

import { cn } from "@/lib/utils";

export function Toaster() {
  return <div id="toaster" className="fixed bottom-4 right-4 z-50 flex flex-col gap-2" />;
}

interface ToastProps {
  title: string;
  description?: string;
  variant?: "default" | "success" | "destructive";
}

export function toast({ title, description, variant = "default" }: ToastProps) {
  const container = document.getElementById("toaster");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = cn(
    "animate-fade-in rounded-xl border p-4 shadow-lg backdrop-blur-sm",
    "bg-card/95 text-card-foreground min-w-[300px]",
    variant === "destructive" && "border-destructive/50 text-destructive",
    variant === "success" && "border-green-500/50 text-green-500"
  );
  toast.innerHTML = `
    <p class="font-medium text-sm">${title}</p>
    ${description ? `<p class="text-xs text-muted-foreground mt-1">${description}</p>` : ""}
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("animate-fade-out");
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
