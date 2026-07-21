import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyWebhookSignature, isMockMode } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature header." }, { status: 400 });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature (skip in mock mode if no webhook secret is set)
    if (!isMockMode() && webhookSecret) {
      const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        console.warn("Unauthorized webhook signature attempt.");
        return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
      }
    } else {
      console.log("ℹ️ Webhook signature verification skipped (development/mock mode).");
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    console.log(`Razorpay webhook event received: ${event}`);

    // We listen to payment.captured or order.paid
    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = payload.payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;
      const razorpayPaymentId = paymentEntity?.id;

      if (!razorpayOrderId) {
        return NextResponse.json({ error: "Missing Razorpay Order ID in payload." }, { status: 400 });
      }

      // Find order by the Razorpay Order ID we saved in paymentId
      const order = await prisma.order.findFirst({
        where: {
          paymentId: razorpayOrderId,
        },
      });

      if (order) {
        if (order.paymentStatus !== "PAID") {
          console.log(`Webhook updating order ${order.orderNumber} to PAID.`);
          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: "PAID",
              paymentId: razorpayPaymentId, // Replace order ID with payment ID
            },
          });
        } else {
          console.log(`Order ${order.orderNumber} is already marked as PAID.`);
        }
      } else {
        console.warn(`Order not found for Razorpay Order ID: ${razorpayOrderId}`);
      }
    } else if (event === "payment.failed") {
      const paymentEntity = payload.payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;

      if (razorpayOrderId) {
        const order = await prisma.order.findFirst({
          where: {
            paymentId: razorpayOrderId,
            paymentStatus: { not: "PAID" },
            status: { not: "CANCELLED" },
          },
          include: { items: true },
        });

        if (order) {
          console.log(`Webhook updating failed order ${order.orderNumber} to FAILED/CANCELLED.`);
          await prisma.$transaction(
            async (tx) => {
            await tx.order.update({
              where: { id: order.id },
              data: {
                paymentStatus: "FAILED",
                status: "CANCELLED",
              },
            });

            // Restore stocks
            for (const item of order.items) {
              await tx.productVariant.update({
                where: { id: item.variantId },
                data: { stock: { increment: item.quantity } },
              });
            }

            // Refund wallet
            if (order.walletPaid > 0 && order.userId) {
              await tx.user.update({
                where: { id: order.userId },
                data: { walletBalance: { increment: order.walletPaid } },
              });
            }

            // Restore coupon
            if (order.couponUsed && order.userId) {
              const coupon = await tx.coupon.findUnique({
                where: { code: order.couponUsed },
              });
              if (coupon) {
                await tx.coupon.update({
                  where: { id: coupon.id },
                  data: { currentUsage: { decrement: 1 } },
                });
                await tx.couponSent.updateMany({
                  where: {
                    userId: order.userId,
                    couponId: coupon.id,
                    used: true,
                  },
                  data: { used: false },
                });
              }
            }
          },
          {
            maxWait: 15000,
            timeout: 30000,
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Razorpay webhook handler failed:", error);
    return NextResponse.json(
      { error: error.message || "Webhook processing error." },
      { status: 500 }
    );
  }
}
