"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Shared input styling for the editorial auth screens. */
export const authInputClass =
  "w-full rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder:text-neutral-600 outline-none transition-colors focus:border-[var(--signal)]/60 focus:bg-white/[0.05]";

export const authLabelClass = "mb-1.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400";

export function AuthField({
  label,
  children,
  action,
}: {
  label: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className={authLabelClass}>{label}</label>
        {action}
      </div>
      {children}
    </div>
  );
}

export function AuthSubmit({
  loading,
  children,
}: {
  loading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--signal)] py-2.5 text-sm font-semibold text-black transition-transform hover:scale-[1.01] disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export function GoogleButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-white/12 bg-white/[0.02] py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/[0.06]"
    >
      <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      Continue with Google
    </button>
  );
}

function Wordmark({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)}>
      <span className="h-2.5 w-2.5 rounded-[3px] bg-[var(--signal)] transition-transform duration-500 group-hover:rotate-[225deg]" />
      <span className="font-display text-lg font-semibold leading-none tracking-tight text-white">Novus</span>
    </Link>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0b] font-sans text-neutral-300 antialiased selection:bg-[var(--signal)] selection:text-black">
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-50" />
      <div
        className="pointer-events-none fixed -top-40 left-1/4 h-[480px] w-[720px] -translate-x-1/2 rounded-full blur-[140px]"
        style={{ background: "radial-gradient(circle, rgba(200,249,78,0.05), transparent 70%)" }}
      />

      <div className="relative grid min-h-screen lg:grid-cols-2">
        {/* Brand panel (desktop) */}
        <div className="relative hidden flex-col justify-between border-r border-white/[0.08] p-10 lg:flex xl:p-14">
          <Wordmark />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
              Personal Operating System
            </p>
            <h2 className="mt-5 font-display text-[length:clamp(2rem,3.2vw,3.2rem)] font-semibold leading-[1.03] tracking-tight text-white">
              Your entire life,
              <br />
              <span className="italic text-[var(--signal)]">one operating system.</span>
            </h2>
            <p className="mt-5 max-w-md text-pretty leading-relaxed text-neutral-400">
              Habits, goals, journal, finance and workouts — unified, and run by an intelligence
              that understands the whole picture.
            </p>
          </div>
          <div className="flex items-center gap-x-5 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-600">
            <span>v1.0</span>
            <span className="text-neutral-700">/</span>
            <span>2026</span>
            <span className="text-neutral-700">/</span>
            <span>Made for an intentional life</span>
          </div>
        </div>

        {/* Form side */}
        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-sm">
            <Wordmark className="mb-10 lg:hidden" />
            {(title || subtitle) && (
              <div className="mb-7">
                {title && (
                  <h1 className="font-display text-2xl font-semibold tracking-tight text-white">{title}</h1>
                )}
                {subtitle && <p className="mt-1.5 text-sm text-neutral-400">{subtitle}</p>}
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
