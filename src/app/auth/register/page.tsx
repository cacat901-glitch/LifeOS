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

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Registration failed");
        setIsLoading(false);
        return;
      }
      const signInRes = await signIn("credentials", { email, password, redirect: false });
      window.location.href = signInRes?.error ? "/auth/login" : "/dashboard";
    } catch {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Start running your life with Novus.">
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

        <AuthField label="Full name">
          <input type="text" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} required className={authInputClass} />
        </AuthField>
        <AuthField label="Email">
          <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className={authInputClass} />
        </AuthField>
        <AuthField label="Password">
          <input type="password" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className={authInputClass} />
        </AuthField>
        <AuthField label="Confirm password">
          <input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={authInputClass} />
        </AuthField>

        <AuthSubmit loading={isLoading}>
          {isLoading ? "Creating account…" : "Create account"}
          {!isLoading && <ArrowRight className="h-4 w-4" />}
        </AuthSubmit>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-400">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-medium text-white hover:text-[var(--signal)]">
          Sign in
        </Link>
      </p>
      <p className="mt-4 text-center text-xs leading-relaxed text-neutral-600">
        By creating an account, you agree to our{" "}
        <span className="underline">Terms</span> and <span className="underline">Privacy Policy</span>.
      </p>
    </AuthShell>
  );
}
