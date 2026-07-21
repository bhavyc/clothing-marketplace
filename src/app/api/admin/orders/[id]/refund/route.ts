import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const session = await getServerSession(authOptions);

    // 1. Authenticate Admin or Seller
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const userRole = (session.user as any).role;
    const sellerProfileId = (session.user as any).sellerProfileId;

    if (userRole !== "ADMIN" && userRole !== "SELLER") {
      return NextResponse.json(
        { error: "Unauthorized. Admin or Seller privileges required." },
        { status: 403 }
      );
    }

    // 2. Parse request payload
    const body = await req.json();
    const { itemsToRefund } = body as {
      itemsToRefund: Array<{ orderItemId: string; approve: boolean }>;
    };

    if (!itemsToRefund || !Array.isArray(itemsToRefund) || itemsToRefund.length === 0) {
      return NextResponse.json(
        { error: "Invalid payload. Please provide items to process." },
        { status: 400 }
      );
    }

    // 3. Find order and include its items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (!order.userId) {
      return NextResponse.json(
        { error: "This order is not associated with an active customer account. Cannot refund to wallet." },
        { status: 400 }
      );
    }

    // Verify Seller owns these items
    if (userRole === "SELLER") {
      if (!sellerProfileId) {
        return NextResponse.json(
          { error: "Seller profile not found." },
          { status: 403 }
        );
      }
      for (const processItem of itemsToRefund) {
        const orderItem = order.items.find((item) => item.id === processItem.orderItemId);
        if (!orderItem) {
          return NextResponse.json(
            { error: `Item ${processItem.orderItemId} not found in this order.` },
            { status: 400 }
          );
        }
        if (orderItem.variant.product.sellerId !== sellerProfileId) {
          return NextResponse.json(
            { error: "Forbidden. You are not authorized to process returns for another seller's items." },
            { status: 403 }
          );
        }
      }
    }

    // 4. Process each item inside a transaction
    await prisma.$transaction(
      async (tx) => {
      let totalRefundAmount = 0;

      for (const processItem of itemsToRefund) {
        const orderItem = order.items.find((item) => item.id === processItem.orderItemId);

        if (!orderItem) {
          throw new Error(`Item ${processItem.orderItemId} not found in this order.`);
        }

        const isConfirmReceipt = (processItem as any).confirmReceipt || false;

        // Stage 1: Action on RETURN_REQUESTED
        if (orderItem.returnStatus === "RETURN_REQUESTED") {
          if (processItem.approve) {
            // Approve the request (initiate pickup / approve request)
            await tx.orderItem.update({
              where: { id: orderItem.id },
              data: { returnStatus: "RETURN_APPROVED" },
            });
          } else {
            // Reject the return request
            await tx.orderItem.update({
              where: { id: orderItem.id },
              data: { returnStatus: "RETURN_REJECTED" },
            });
          }
        }
        // Stage 2: Action on RETURN_APPROVED
        else if (orderItem.returnStatus === "RETURN_APPROVED") {
          if (processItem.approve || isConfirmReceipt) {
            // Confirm receipt and issue refund to wallet
            const baseRefundValue = orderItem.priceAtPurchase * orderItem.returnQuantity;
            const discountRatio = order.subtotal > 0 ? (order.totalAmount + order.walletPaid) / order.subtotal : 1;
            const adjustedRefund = Math.round(baseRefundValue * discountRatio * 100) / 100;

            totalRefundAmount += adjustedRefund;

            // Mark item as RETURNED
            await tx.orderItem.update({
              where: { id: orderItem.id },
              data: { returnStatus: "RETURNED" },
            });

            // Revert product variant stock
            await tx.productVariant.update({
              where: { id: orderItem.variantId },
              data: {
                stock: { increment: orderItem.returnQuantity },
              },
            });
          } else {
            // Reject the return (e.g. item inspection failed upon receipt)
            await tx.orderItem.update({
              where: { id: orderItem.id },
              data: { returnStatus: "RETURN_REJECTED" },
            });
          }
        }
      }

      // Credit total approved refund amount to user's wallet
      if (totalRefundAmount > 0) {
        await tx.user.update({
          where: { id: order.userId as string },
          data: {
            walletBalance: { increment: totalRefundAmount },
          },
        });
      }

      // 5. Update overall Order status dynamically based on items return status
      const updatedOrderItems = await tx.orderItem.findMany({
        where: { orderId },
      });

      const totalItemsCount = updatedOrderItems.length;
      const returnedCount = updatedOrderItems.filter((i) => i.returnStatus === "RETURNED").length;
      const requestedCount = updatedOrderItems.filter((i) => i.returnStatus === "RETURN_REQUESTED").length;
      const approvedCount = updatedOrderItems.filter((i) => i.returnStatus === "RETURN_APPROVED").length;
      const rejectedCount = updatedOrderItems.filter((i) => i.returnStatus === "RETURN_REJECTED").length;

      let newOrderStatus = order.status;
      let newPaymentStatus = order.paymentStatus;

      if (returnedCount === totalItemsCount) {
        // All items successfully returned
        newOrderStatus = "RETURNED";
        newPaymentStatus = "REFUNDED";
      } else if (returnedCount > 0 && returnedCount + rejectedCount === totalItemsCount) {
        // Some returned, some rejected (none requested or approved)
        newOrderStatus = "PARTIALLY_RETURNED";
        newPaymentStatus = "PARTIALLY_REFUNDED";
      } else if (returnedCount > 0) {
        // Some returned, some still requested, approved, or outstanding
        newOrderStatus = "PARTIALLY_RETURNED";
        newPaymentStatus = "PARTIALLY_REFUNDED";
      } else if (approvedCount > 0) {
        // Has approved return requests (pickup initiated)
        newOrderStatus = "RETURN_APPROVED";
      } else if (requestedCount > 0) {
        // Still has active return requests
        newOrderStatus = "RETURN_REQUESTED";
      } else if (rejectedCount === totalItemsCount) {
        // All requests rejected, goes back to delivered
        newOrderStatus = "DELIVERED";
      }

      await tx.order.update({
        where: { id: orderId },
        data: {
          status: newOrderStatus,
          paymentStatus: newPaymentStatus,
        },
      });
    },
    {
      maxWait: 15000,
      timeout: 30000,
    });

    return NextResponse.json({
      success: true,
      message: "Return status updated successfully.",
    });
  } catch (error: any) {
    console.error("Admin refund processing error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process refund." },
      { status: 500 }
    );
  }
}
