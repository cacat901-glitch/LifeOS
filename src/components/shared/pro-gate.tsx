"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProGateProps {
  feature: string;
  description?: string;
  children: React.ReactNode;
}

/**
 * Wraps Pro-only content. Shows an upgrade prompt for Free users.
 * Usage: <ProGate feature="Advanced Analytics"><AnalyticsContent /></ProGate>
 */
export function ProGate({ feature, description, children }: ProGateProps) {
  const [plan, setPlan] = useState<"FREE" | "PRO" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user")
      .then((r) => r.json())
      .then((d) => {
        setPlan(d?.subscription?.plan === "PRO" ? "PRO" : "FREE");
        setLoading(false);
      })
      .catch(() => { setPlan("FREE"); setLoading(false); });
  }, []);

  if (loading) return <div className="animate-pulse h-40 rounded-2xl bg-muted/50" />;
  if (plan === "PRO") return <>{children}</>;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-violet-500/5">
      <CardContent className="p-8 text-center space-y-4">
        <div className="text-4xl">⭐</div>
        <h3 className="font-semibold text-lg">{feature} is a Pro feature</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          {description || `Upgrade to Novus Pro to unlock ${feature} and all other premium features.`}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <UpgradeButton />
          <Link href="/settings?tab=subscription"
            className="inline-flex items-center justify-center h-9 px-4 rounded-xl border border-input bg-background text-sm font-medium hover:bg-accent transition-all">
            View Plans
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function UpgradeButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "checkout" }),
      });
      if (res.ok) {
        const { url } = await res.json();
        if (url) window.location.href = url;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className={`inline-flex items-center justify-center h-10 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-medium transition-all hover:bg-primary/90 disabled:opacity-60 ${className || ""}`}
    >
      {loading ? "Redirecting…" : "Upgrade to Pro — $9.99/mo"}
    </button>
  );
}

/** Inline pill shown on locked nav items */
export function ProBadge() {
  return (
    <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary">
      Pro
    </span>
  );
}
