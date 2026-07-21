import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderNumber } = body;

    if (!orderNumber) {
      return NextResponse.json(
        { error: "Missing orderNumber parameter." },
        { status: 400 }
      );
    }

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

    // Edge Case: If order is already paid, we cannot cancel or rollback stock!
    if (order.paymentStatus === "PAID") {
      return NextResponse.json(
        { error: "Cannot cancel a paid order." },
        { status: 400 }
      );
    }

    // Prevent double cancellation/rollback
    if (order.paymentStatus === "FAILED" || order.status === "CANCELLED") {
      return NextResponse.json({ success: true, message: "Order is already cancelled." });
    }

    // Transaction to update order status and restore stock
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

    return NextResponse.json({
      success: true,
      message: "Order cancelled and stock restored successfully.",
    });
  } catch (error: any) {
    console.error("Order cancellation failed:", error);
    return NextResponse.json(
      { error: error.message || "Internal server cancellation error." },
      { status: 500 }
    );
  }
}
