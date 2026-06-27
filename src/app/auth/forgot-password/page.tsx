"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { AuthShell, AuthField, AuthSubmit, authInputClass } from "@/components/auth/auth-shell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setIsSent(true);
    } catch {
      setIsSent(true); // always succeed to prevent enumeration
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle={isSent ? "Check your email for a reset link." : "We'll email you a link to reset it."}
    >
      {isSent ? (
        <div className="space-y-5">
          <div className="flex flex-col items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-8 text-center">
            <MailCheck className="h-7 w-7 text-[var(--signal)]" strokeWidth={1.6} />
            <p className="text-sm text-neutral-400">
              If an account exists with that email, a password reset link is on its way.
            </p>
          </div>
          <Link
            href="/auth/login"
            className="flex w-full items-center justify-center rounded-lg border border-white/12 bg-white/[0.02] py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/[0.06]"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthField label="Email">
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={authInputClass}
            />
          </AuthField>
          <AuthSubmit loading={isLoading}>{isLoading ? "Sending…" : "Send reset link"}</AuthSubmit>
          <p className="text-center text-sm text-neutral-500">
            <Link href="/auth/login" className="hover:text-[var(--signal)]">
              Back to sign in
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
