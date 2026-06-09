import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
  typescript: true,
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
