"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, PRICES, PRICE_AMOUNTS } from "@/lib/stripe";
import { redirect } from "next/navigation";
import type { PaymentType } from "@prisma/client";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user;
}

// ──────────────────────────────────────────
// Create Stripe Checkout — Will Basic
// ──────────────────────────────────────────

export async function checkoutWillBasic(documentId: string) {
  const user = await requireAuth();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [{ price: PRICES.WILL_BASIC, quantity: 1 }],
    metadata: {
      userId: user.id,
      documentId,
      type: "WILL_BASIC" satisfies PaymentType,
    },
    success_url: `${APP_URL}/dashboard?payment=success&type=will`,
    cancel_url: `${APP_URL}/dashboard?payment=cancelled`,
    customer_email: user.email ?? undefined,
    billing_address_collection: "required",
  });

  // Record pending payment
  await prisma.payment.create({
    data: {
      userId: user.id,
      type: "WILL_BASIC",
      status: "PENDING",
      amount: PRICE_AMOUNTS.WILL_BASIC,
      stripeSessionId: session.id,
      willDocumentId: documentId,
    },
  });

  redirect(session.url!);
}

// ──────────────────────────────────────────
// Create Stripe Checkout — Attorney Review
// ──────────────────────────────────────────

export async function checkoutAttorneyReview(documentId: string) {
  const user = await requireAuth();

  const doc = await prisma.willDocument.findFirst({
    where: { id: documentId, userId: user.id },
  });
  if (!doc) throw new Error("Document not found");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [{ price: PRICES.ATTORNEY_REVIEW, quantity: 1 }],
    metadata: {
      userId: user.id,
      documentId,
      type: "ATTORNEY_REVIEW" satisfies PaymentType,
    },
    success_url: `${APP_URL}/dashboard?payment=success&type=review`,
    cancel_url: `${APP_URL}/dashboard?payment=cancelled`,
    customer_email: user.email ?? undefined,
    billing_address_collection: "required",
  });

  await prisma.payment.create({
    data: {
      userId: user.id,
      type: "ATTORNEY_REVIEW",
      status: "PENDING",
      amount: PRICE_AMOUNTS.ATTORNEY_REVIEW,
      stripeSessionId: session.id,
      willDocumentId: documentId,
    },
  });

  redirect(session.url!);
}

// ──────────────────────────────────────────
// Create Stripe Checkout — Consultation
// ──────────────────────────────────────────

export async function checkoutConsultation(scheduledAt: Date, timezone: string) {
  const user = await requireAuth();

  // Create the consultation record first (pending payment)
  const consultation = await prisma.consultation.create({
    data: {
      userId: user.id,
      scheduledAt,
      timezone,
      status: "PENDING",
    },
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [{ price: PRICES.CONSULTATION, quantity: 1 }],
    metadata: {
      userId: user.id,
      consultationId: consultation.id,
      type: "CONSULTATION" satisfies PaymentType,
    },
    success_url: `${APP_URL}/dashboard?payment=success&type=consultation`,
    cancel_url: `${APP_URL}/dashboard?payment=cancelled`,
    customer_email: user.email ?? undefined,
    billing_address_collection: "required",
  });

  await prisma.payment.create({
    data: {
      userId: user.id,
      type: "CONSULTATION",
      status: "PENDING",
      amount: PRICE_AMOUNTS.CONSULTATION,
      stripeSessionId: session.id,
      consultationId: consultation.id,
    },
  });

  redirect(session.url!);
}

// ──────────────────────────────────────────
// Create Stripe Checkout — Notarization Add-On
// ──────────────────────────────────────────

export async function checkoutNotarization(documentId: string) {
  const user = await requireAuth();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [{ price: PRICES.NOTARIZATION, quantity: 1 }],
    metadata: {
      userId: user.id,
      documentId,
      type: "NOTARIZATION" satisfies PaymentType,
    },
    success_url: `${APP_URL}/dashboard?payment=success&type=notarization`,
    cancel_url: `${APP_URL}/dashboard?payment=cancelled`,
    customer_email: user.email ?? undefined,
  });

  await prisma.payment.create({
    data: {
      userId: user.id,
      type: "NOTARIZATION",
      status: "PENDING",
      amount: PRICE_AMOUNTS.NOTARIZATION,
      stripeSessionId: session.id,
      willDocumentId: documentId,
    },
  });

  redirect(session.url!);
}
