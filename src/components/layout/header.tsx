"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/journal": "Journal",
  "/habits": "Habits",
  "/tasks": "Tasks",
  "/goals": "Goals",
  "/workout": "Workout",
  "/mood": "Mood",
  "/timeline": "Your Life",
  "/statistics": "Statistics",
  "/settings": "Settings",
};

export function AppHeader() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "LifeOS";

  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-between h-16 px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="lg:hidden w-10" /> {/* Spacer for mobile menu button */}
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
          </Button>

          {/* Quick Add */}
          <Button size="sm" className="hidden sm:flex gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Quick Add
          </Button>
        </div>
      </div>
    </header>
  );
}
