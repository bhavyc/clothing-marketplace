import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderNumber, razorpayPaymentId, razorpayOrderId, razorpaySignature } = body;

    if (!orderNumber || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return NextResponse.json(
        { error: "Missing verification parameters." },
        { status: 400 }
      );
    }

    // 1. Fetch the order from the database
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

    // If order is already paid, prevent double operations
    if (order.paymentStatus === "PAID") {
      return NextResponse.json({ success: true, message: "Order is already paid." });
    }

    // 2. Verify signature
    const isValid = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      console.warn(`Signature verification failed for order ${orderNumber}`);
      
      // Edge Case: Mark order failed and rollback stock if signature fails
      await prisma.$transaction(
        async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "FAILED",
            status: "CANCELLED",
          },
        });

        // Restore stock
        for (const item of order.items) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }

        // Refund wallet paid balance
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

      return NextResponse.json(
        { error: "Signature verification failed. Potential fraud detected." },
        { status: 400 }
      );
    }

    // 3. Update order payment status to PAID
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        paymentId: razorpayPaymentId, // Store actual transaction ID now
      },
    });

    // Send confirmation email in background
    sendOrderConfirmationEmail(order.orderNumber).catch((e) =>
      console.error("Failed to send order confirmation email after payment verification:", e)
    );

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully.",
    });
  } catch (error: any) {
    console.error("Order payment verification failed:", error);
    return NextResponse.json(
      { error: error.message || "Internal server verification error." },
      { status: 500 }
    );
  }
}
