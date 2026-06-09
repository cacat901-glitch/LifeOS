import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe, PLANS } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// POST /api/stripe - Create checkout session
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action } = await req.json();

    if (action === "checkout") {
      // Get or create Stripe customer
      let subscription = await prisma.subscription.findUnique({
        where: { userId: session.user.id },
      });

      let customerId = subscription?.stripeCustomerId;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: session.user.email!,
          metadata: { userId: session.user.id },
        });
        customerId = customer.id;

        await prisma.subscription.upsert({
          where: { userId: session.user.id },
          update: { stripeCustomerId: customerId },
          create: {
            userId: session.user.id,
            stripeCustomerId: customerId,
            plan: "FREE",
            status: "ACTIVE",
          },
        });
      }

      // Create checkout session
      const checkoutSession = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: PLANS.PRO.priceId,
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
        subscription_data: {
          trial_period_days: 7,
        },
      });

      return NextResponse.json({ url: checkoutSession.url });
    }

    if (action === "portal") {
      const subscription = await prisma.subscription.findUnique({
        where: { userId: session.user.id },
      });

      if (!subscription?.stripeCustomerId) {
        return NextResponse.json({ error: "No subscription found" }, { status: 404 });
      }

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: subscription.stripeCustomerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
      });

      return NextResponse.json({ url: portalSession.url });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Stripe error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
