"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { ArrowRight } from "lucide-react";
import {
  AuthShell,
  AuthField,
  AuthSubmit,
  GoogleButton,
  authInputClass,
} from "@/components/auth/auth-shell";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) setError("Invalid email or password");
      else window.location.href = "/dashboard";
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue to Novus.">
      <GoogleButton onClick={() => signIn("google", { callbackUrl: "/dashboard" })} />

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-white/[0.08]" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-600">or</span>
        <div className="h-px flex-1 bg-white/[0.08]" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

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

        <AuthField
          label="Password"
          action={
            <Link href="/auth/forgot-password" className="font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-500 transition-colors hover:text-[var(--signal)]">
              Forgot?
            </Link>
          }
        >
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={authInputClass}
          />
        </AuthField>

        <AuthSubmit loading={isLoading}>
          {isLoading ? "Signing in…" : "Sign in"}
          {!isLoading && <ArrowRight className="h-4 w-4" />}
        </AuthSubmit>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-400">
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" className="font-medium text-white hover:text-[var(--signal)]">
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}
