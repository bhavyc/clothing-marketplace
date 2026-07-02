import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyRazorpaySignature } from "@/lib/razorpay";

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
      await prisma.$transaction(async (tx) => {
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
