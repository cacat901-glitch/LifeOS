import Stripe from "stripe";

// Lazy singleton: only instantiate Stripe when first accessed at runtime.
// This prevents build-time crashes when STRIPE_SECRET_KEY is not yet set.
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    stripeInstance = new Stripe(key, {
      typescript: true,
    });
  }
  return stripeInstance;
}

// Backwards-compatible proxy: `stripe.xxx` resolves the real client lazily.
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const client = getStripe();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    features: [
      "Up to 3 habits",
      "Basic journal",
      "Basic task management",
      "Limited analytics",
      "7-day mood history",
    ],
    limits: {
      habits: 3,
      journalEntries: 30,
      tasks: 50,
      goals: 3,
      analytics: "basic",
    },
  },
  PRO: {
    name: "Pro",
    price: 9.99,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      "Unlimited habits",
      "Unlimited journals",
      "Advanced analytics",
      "Life Timeline",
      "AI Insights & Reports",
      "Full statistics hub",
      "Custom themes",
      "Data export",
      "Priority support",
      "Workout programs",
      "Goal milestones",
    ],
    limits: {
      habits: Infinity,
      journalEntries: Infinity,
      tasks: Infinity,
      goals: Infinity,
      analytics: "advanced",
    },
  },
} as const;

export type PlanType = keyof typeof PLANS;
