"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card className="border-border/50 shadow-xl">
      <CardHeader className="text-center">
        <div className="text-4xl mb-2">⚠️</div>
        <CardTitle>Sign In Error</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">{message}</p>
        <div className="flex flex-col gap-2">
          <Link href="/auth/login" className="inline-flex items-center justify-center w-full h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
            Try Again
          </Link>
          <Link href="/auth/register" className="text-sm text-primary hover:underline">
            Create an account
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 mesh-gradient">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-white font-bold">L</span>
            </div>
            <span className="font-bold text-2xl">LifeOS</span>
          </Link>
        </div>
        <Suspense fallback={<div className="text-center text-muted-foreground">Loading…</div>}>
          <ErrorContent />
        </Suspense>
      </div>
    </div>
  );
}
