"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";

const ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked: "This email is already registered with a different sign-in method. Please sign in with your original method.",
  OAuthSignin: "There was a problem signing in with Google. Please try again.",
  OAuthCallback: "There was a problem completing the Google sign-in. Please try again.",
  Signin: "Unable to sign in. Please check your credentials and try again.",
  CredentialsSignin: "Invalid email or password.",
  SessionRequired: "Please sign in to access this page.",
  Default: "An unexpected error occurred. Please try again.",
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error") || "Default";
  const message = ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.Default;

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-8 text-center">
        <AlertTriangle className="h-7 w-7 text-amber-400" strokeWidth={1.6} />
        <p className="text-sm text-neutral-400">{message}</p>
      </div>
      <Link
        href="/auth/login"
        className="flex w-full items-center justify-center rounded-lg bg-[var(--signal)] py-2.5 text-sm font-semibold text-black transition-transform hover:scale-[1.01]"
      >
        Try again
      </Link>
      <p className="text-center text-sm text-neutral-500">
        <Link href="/auth/register" className="hover:text-[var(--signal)]">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <AuthShell title="Sign-in error">
      <Suspense fallback={<div className="text-center text-sm text-neutral-500">Loading…</div>}>
        <ErrorContent />
      </Suspense>
    </AuthShell>
  );
}
