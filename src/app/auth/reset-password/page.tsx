"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { AuthShell, AuthField, AuthSubmit, authInputClass } from "@/components/auth/auth-shell";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) return setError("Passwords do not match");
    if (password.length < 8) return setError("Password must be at least 8 characters");

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Something went wrong");
      else setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-8 text-center">
        <AlertTriangle className="h-7 w-7 text-amber-400" strokeWidth={1.6} />
        <p className="text-sm text-neutral-400">This reset link is invalid or expired.</p>
        <Link href="/auth/forgot-password" className="text-sm font-medium text-[var(--signal)] hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-5">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-8 text-center">
          <CheckCircle2 className="h-7 w-7 text-[var(--signal)]" strokeWidth={1.6} />
          <p className="text-sm text-neutral-400">Your password has been reset.</p>
        </div>
        <Link
          href="/auth/login"
          className="flex w-full items-center justify-center rounded-lg bg-[var(--signal)] py-2.5 text-sm font-semibold text-black transition-transform hover:scale-[1.01]"
        >
          Sign in with new password
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <AuthField label="New password">
        <input type="password" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required className={authInputClass} />
      </AuthField>
      <AuthField label="Confirm password">
        <input type="password" placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className={authInputClass} />
      </AuthField>
      <AuthSubmit loading={isLoading}>{isLoading ? "Updating…" : "Reset password"}</AuthSubmit>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Choose a new password" subtitle="Enter your new password below.">
      <Suspense fallback={<div className="text-center text-sm text-neutral-500">Loading…</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
