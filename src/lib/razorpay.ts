import crypto from "crypto";

const KEY_ID = process.env.RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

/**
 * Returns whether Razorpay is running in Mock Mode (due to missing keys in .env).
 */
export function isMockMode(): boolean {
  return !KEY_ID || !KEY_SECRET;
}

/**
 * Calls Razorpay API to create an order (or generates a mock order if keys are missing).
 */
export async function createRazorpayOrder(
  amountInRupees: number,
  receipt: string
): Promise<RazorpayOrder> {
  const amountInPaise = Math.round(amountInRupees * 100);

  if (isMockMode()) {
    console.warn(
      "Razorpay keys are missing. Creating order in development MOCK MODE."
    );
    return {
      id: `order_mock_${crypto.randomBytes(8).toString("hex")}`,
      amount: amountInPaise,
      currency: "INR",
      receipt,
      status: "created",
    };
  }

  const authString = Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64");

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${authString}`,
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency: "INR",
      receipt,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Razorpay Order Creation Failed: ${errorText}`);
  }

  const data = await response.json();
  return {
    id: data.id,
    amount: data.amount,
    currency: data.currency,
    receipt: data.receipt,
    status: data.status,
  };
}

/**
 * Verifies the payment signature returned by the client-side Razorpay modal.
 */
export function verifyRazorpaySignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean {
  if (isMockMode() || process.env.NODE_ENV !== "production") {
    // In mock/dev mode, allow payment validation if the signature matches a mock prefix
    return (
      razorpaySignature === `mock_sig_${razorpayOrderId}_${razorpayPaymentId}` ||
      razorpaySignature.startsWith("mock_sig_")
    );
  }

  const text = `${razorpayOrderId}|${razorpayPaymentId}`;
  const generatedSignature = crypto
    .createHmac("sha256", KEY_SECRET as string)
    .update(text)
    .digest("hex");

  return generatedSignature === razorpaySignature;
}

/**
 * Verifies Razorpay Webhook signature.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  webhookSecret: string
): boolean {
  if (!webhookSecret) return false;

  const generatedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  return generatedSignature === signature;
}
