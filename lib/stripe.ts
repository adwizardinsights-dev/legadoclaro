import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-04-10",
      typescript: true,
    });
  }
  return _stripe;
}

/** @deprecated Use getStripe() instead */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as any)[prop];
  },
});

export const PRICES = {
  WILL_BASIC: process.env.STRIPE_PRICE_WILL_BASIC!,
  ATTORNEY_REVIEW: process.env.STRIPE_PRICE_ATTORNEY_REVIEW!,
  CONSULTATION: process.env.STRIPE_PRICE_CONSULTATION!,
  NOTARIZATION: process.env.STRIPE_PRICE_NOTARIZATION!,
} as const;

export const PRICE_AMOUNTS = {
  WILL_BASIC: 9900,       // $99.00
  ATTORNEY_REVIEW: 24900, // $249.00
  CONSULTATION: 19900,    // $199.00
  NOTARIZATION: 7900,     // $79.00
} as const;

export type PriceKey = keyof typeof PRICES;

export async function createCheckoutSession({
  userId,
  priceId,
  metadata,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  priceId: string;
  metadata: Record<string, string>;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { userId, ...metadata },
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: metadata.email,
    billing_address_collection: "required",
  });
}
