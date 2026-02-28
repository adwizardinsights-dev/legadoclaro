import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import {
  sendPaymentConfirmationEmail,
  sendReviewRequestedEmail,
  sendConsultationConfirmedEmail,
} from "@/lib/email";
import type Stripe from "stripe";
import type { PaymentType } from "@prisma/client";

// Disable body parsing — Stripe requires raw body
export const runtime = "nodejs";

const PRODUCT_NAMES: Record<PaymentType, string> = {
  WILL_BASIC: "Basic Will",
  ATTORNEY_REVIEW: "Will + Attorney Review",
  CONSULTATION: "Attorney Consultation",
  NOTARIZATION: "Notarization Add-On",
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        await prisma.payment.updateMany({
          where: { stripePaymentId: intent.id },
          data: { status: "FAILED" },
        });
        break;
      }
      default:
        // Unhandled event type — ignore
        break;
    }
  } catch (err) {
    console.error("[Stripe Webhook] Handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { metadata } = session;
  if (!metadata?.userId || !metadata?.type) {
    console.error("[Webhook] Missing metadata on session:", session.id);
    return;
  }

  const type = metadata.type as PaymentType;
  const userId = metadata.userId;

  // Mark payment as completed
  const payment = await prisma.payment.update({
    where: { stripeSessionId: session.id },
    data: {
      status: "COMPLETED",
      stripePaymentId: session.payment_intent as string,
    },
  });

  // Fetch user for email
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  if (!user?.email) return;

  // Send payment confirmation
  sendPaymentConfirmationEmail(
    user.email,
    user.name ?? "",
    PRODUCT_NAMES[type],
    payment.amount
  ).catch(console.error);

  // Type-specific post-payment logic
  if (type === "ATTORNEY_REVIEW" && metadata.documentId) {
    await prisma.$transaction([
      prisma.willDocument.update({
        where: { id: metadata.documentId },
        data: { status: "UNDER_REVIEW", submittedAt: new Date() },
      }),
      prisma.attorneyReviewRequest.upsert({
        where: { willDocumentId: metadata.documentId },
        create: {
          willDocumentId: metadata.documentId,
          status: "UNDER_REVIEW",
          requestedAt: new Date(),
        },
        update: { status: "UNDER_REVIEW" },
      }),
    ]);

    sendReviewRequestedEmail(user.email, user.name ?? "").catch(console.error);
  }

  if (type === "CONSULTATION" && metadata.consultationId) {
    const consultation = await prisma.consultation.update({
      where: { id: metadata.consultationId },
      data: { status: "CONFIRMED" },
    });

    sendConsultationConfirmedEmail(
      user.email,
      user.name ?? "",
      consultation.scheduledAt,
      consultation.timezone
    ).catch(console.error);
  }

  if (type === "WILL_BASIC" && metadata.documentId) {
    // Mark document as submitted after payment
    await prisma.willDocument.update({
      where: { id: metadata.documentId },
      data: { status: "SUBMITTED", submittedAt: new Date() },
    });
  }
}
