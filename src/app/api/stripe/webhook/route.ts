import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      await prisma.subscription.updateMany({
        where: { stripeCustomerId: customerId },
        data: {
          stripeSubscriptionId: subscriptionId,
          plan: "PRO",
          status: "ACTIVE",
        },
      });
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      await prisma.subscription.updateMany({
        where: { stripeCustomerId: customerId },
        data: {
          status: subscription.status === "active" ? "ACTIVE" : "PAST_DUE",
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      await prisma.subscription.updateMany({
        where: { stripeCustomerId: customerId },
        data: {
          plan: "FREE",
          status: "CANCELED",
          canceledAt: new Date(),
        },
      });
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      await prisma.subscription.updateMany({
        where: { stripeCustomerId: customerId },
        data: { status: "PAST_DUE" },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
